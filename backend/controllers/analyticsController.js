const Job = require('../models/Job');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const TimeLog = require('../models/TimeLog');
const Material = require('../models/Material');

exports.getAnalytics = async (req, res) => {
  try {
    const [totalJobs, pendingJobs, inProgressJobs, completedJobs, cancelledJobs, totalElectricians, invoices, timelogs, materials] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ status: { $in: ['Pending', 'Not Started'] } }),
      Job.countDocuments({ status: 'In Progress' }),
      Job.countDocuments({ status: 'Completed' }),
      Job.countDocuments({ status: 'Cancelled' }),
      User.countDocuments({ role: 'electrician' }),
      Invoice.find(),
      TimeLog.find({ status: 'completed' }),
      Material.find()
    ]);

    const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + (i.totalAmount || 0), 0);
    const totalHours = timelogs.reduce((sum, t) => sum + (t.hoursWorked || 0), 0);
    const totalMaterialCost = materials.reduce((sum, m) => sum + ((m.quantity || 0) * (m.unitPrice || 0)), 0);

    const jobsByMonth = await Job.aggregate([
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    const revenueByMonth = await Invoice.aggregate([
      { $match: { status: 'Paid' } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, total: { $sum: '$totalAmount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        jobStats: {
          totalJobs,
          completedJobs,
          statusDistribution: [
            { name: 'Completed', value: completedJobs },
            { name: 'In Progress', value: inProgressJobs },
            { name: 'Not Started', value: pendingJobs },
            { name: 'Cancelled', value: cancelledJobs }
          ]
        },
        revenueStats: {
          totalRevenue,
          monthlyData: revenueByMonth.map(r => ({
            month: `M${r._id.month}/${r._id.year}`,
            revenue: r.total
          }))
        },
        materialStats: {
          totalItems: materials.length,
          lowStockItems: materials.filter(m => (m.quantity || 0) <= (m.minStock || 5)).length,
          usageByCategory: materials.slice(0, 8).map(m => ({
            category: m.name || m.category || 'General',
            quantity: m.quantity || 0
          }))
        },
        electricianStats: {
          totalElectricians,
          activeElectricians: totalElectricians,
          topPerformers: []
        },
        timeLogStats: { totalHours, count: timelogs.length },
        jobs: { total: totalJobs, pending: pendingJobs, inProgress: inProgressJobs, completed: completedJobs, cancelled: cancelledJobs },
        electricians: { total: totalElectricians },
        revenue: { total: totalRevenue, invoiceCount: invoices.length },
        hours: { total: totalHours },
        materials: { totalCost: totalMaterialCost },
        jobsByMonth, revenueByMonth
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalJobs,
      pendingJobs,
      inProgressJobs,
      completedJobs,
      totalElectricians,
      invoices,
      materials,
      recentJobs,
      recentTimeLogs,
      recentInvoices,
      electricians
    ] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ status: { $in: ['Pending', 'Not Started'] } }),
      Job.countDocuments({ status: 'In Progress' }),
      Job.countDocuments({ status: 'Completed' }),
      User.countDocuments({ role: 'electrician' }),
      Invoice.find(),
      Material.find(),
      Job.find().populate('assignedTo', 'name email phone').populate('client', 'name phone').sort('-createdAt').limit(6),
      TimeLog.find().populate('electrician', 'name email').populate('job', 'title').sort('-createdAt').limit(6),
      Invoice.find().populate('customer', 'name').sort('-createdAt').limit(6),
      User.find({ role: 'electrician' }).select('name email phone specialization')
    ]);

    const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + (i.totalAmount || 0), 0);
    const pendingRevenue = invoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + (i.totalAmount || 0), 0);
    const pendingInvoices = invoices.filter(i => i.status !== 'Paid').length;
    const lowStockMaterials = materials.filter(m => (m.quantity || 0) <= (m.minStock || 5));

    // Calculate real live completed jobs and active jobs for each electrician from MongoDB
    const electricianPerformance = await Promise.all(
      electricians.map(async e => {
        const [completedCount, activeCount] = await Promise.all([
          Job.countDocuments({
            $or: [{ assignedTo: e._id }, { assignedElectricians: e._id }],
            status: 'Completed'
          }),
          Job.countDocuments({
            $or: [{ assignedTo: e._id }, { assignedElectricians: e._id }],
            status: 'In Progress'
          })
        ]);
        return {
          id: e._id,
          name: e.name || 'Technician',
          email: e.email,
          specialization: e.specialization || 'Electrician',
          completedJobs: completedCount,
          activeJobs: activeCount
        };
      })
    );

    // Aggregate real weekly jobs velocity for the SVG chart
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    const weeklyJobsAggregate = await Job.aggregate([
      { $match: { createdAt: { $gte: fourWeeksAgo } } },
      {
        $group: {
          _id: { $week: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Build real live activity stream from real database records
    const liveActivities = [];

    recentJobs.forEach(job => {
      liveActivities.push({
        id: `job-${job._id}`,
        type: 'job',
        icon: 'assignment',
        color: 'var(--primary)',
        title: `Work Order: ${job.title || 'Electrical Service Ticket'}`,
        subtitle: `Assigned: ${job.assignedTo?.name || 'Unassigned'} • Status: ${job.status || 'Pending'}`,
        timestamp: job.createdAt,
        link: `/jobs/${job._id}`
      });
    });

    recentInvoices.forEach(inv => {
      liveActivities.push({
        id: `inv-${inv._id}`,
        type: 'invoice',
        icon: 'payments',
        color: 'var(--teal)',
        title: `Invoice #${inv.invoiceNumber || inv._id.toString().slice(-5).toUpperCase()} (${inv.status || 'Draft'})`,
        subtitle: `Customer: ${inv.customer?.name || inv.client?.name || 'Direct Client'} • Total: ₹${(inv.totalAmount || 0).toLocaleString('en-IN')}`,
        timestamp: inv.createdAt,
        link: `/invoices/${inv._id}`
      });
    });

    recentTimeLogs.forEach(tl => {
      liveActivities.push({
        id: `tl-${tl._id}`,
        type: 'timelog',
        icon: 'schedule',
        color: 'var(--accent)',
        title: `${tl.electrician?.name || 'Technician'} logged ${tl.hoursWorked || 0} hrs`,
        subtitle: `Job: ${tl.job?.title || 'Field Work'} • Status: ${tl.status || 'Completed'}`,
        timestamp: tl.createdAt,
        link: '/reports/attendance'
      });
    });

    // Sort live activities descending by creation date
    liveActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        activeJobs: inProgressJobs,
        pendingJobs,
        completedJobs,
        totalElectricians,
        totalMaterials: materials.length,
        lowStockCount: lowStockMaterials.length,
        lowStockItems: lowStockMaterials.slice(0, 5).map(m => ({
          id: m._id,
          name: m.name,
          sku: m.sku,
          quantity: m.quantity || 0,
          minStock: m.minStock || 5,
          unit: m.unit || 'pcs'
        })),
        totalRevenue,
        pendingRevenue,
        pendingInvoices,
        recentJobs,
        electricianPerformance,
        weeklyVelocity: weeklyJobsAggregate.map(w => w.count),
        liveActivities: liveActivities.slice(0, 8)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getElectricianDashboardStats = async (req, res) => {
  try {
    const electricianId = req.params.id || req.user.id;

    const [activeJobs, completedJobs, timelogs, materials] = await Promise.all([
      Job.find({
        $or: [
          { assignedTo: electricianId },
          { assignedElectricians: electricianId }
        ],
        status: { $in: ['Pending', 'Not Started', 'In Progress'] }
      }).populate('assignedTo', 'name email phone').sort('-createdAt'),
      Job.find({
        $or: [
          { assignedTo: electricianId },
          { assignedElectricians: electricianId }
        ],
        status: 'Completed'
      }).sort('-createdAt').limit(10),
      TimeLog.find({
        $or: [{ electrician: electricianId }, { user: electricianId }]
      }),
      Material.countDocuments()
    ]);

    const hoursLogged = timelogs.reduce((sum, log) => sum + (log.hoursWorked || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        activeJobs,
        completedJobs,
        totalMaterials: materials,
        hoursLogged: Number(hoursLogged.toFixed(1))
      }
    });
  } catch (err) {
    console.error('Electrician stats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.repairMaterials = async (req, res) => {
  try {
    const count = await Material.countDocuments();
    res.status(200).json({
      success: true,
      data: { totalMaterials: count }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
