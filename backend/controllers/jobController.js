const Job = require('../models/Job');
const TimeLog = require('../models/TimeLog');

exports.getJobs = async (req, res) => {
  try {
    let query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = new RegExp(`^${req.query.priority}$`, 'i');
    if (req.user.role === 'electrician') {
      query.$or = [
        { assignedTo: req.user.id },
        { assignedElectricians: req.user.id }
      ];
    }
    const jobs = await Job.find(query)
      .populate('assignedTo', 'name email phone')
      .populate('assignedElectricians', 'name email phone')
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('assignedTo', 'name email phone specialization')
      .populate('assignedElectricians', 'name email phone specialization')
      .populate('createdBy', 'name');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, data: job });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createJob = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    
    if (!req.body.client || !req.body.client.name) {
      req.body.client = {
        name: req.body.client?.name || 'General Client',
        phone: req.body.client?.phone || '',
        email: req.body.client?.email || '',
        address: req.body.client?.address || req.body.location || ''
      };
    }

    if (req.body.assignedTo && !req.body.assignedElectricians) {
      req.body.assignedElectricians = req.body.assignedTo;
    }

    const job = await Job.create(req.body);
    res.status(201).json({ success: true, data: job });
  } catch (err) {
    console.error('Job creation error:', err);
    res.status(400).json({ success: false, message: err.message || 'Validation error creating job' });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    Object.assign(job, req.body);
    if (req.body.assignedTo) job.assignedElectricians = req.body.assignedTo;
    await job.save();

    res.status(200).json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Error updating job' });
  }
};

exports.updateJobStatus = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, notes: req.body.notes },
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, data: job });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    await job.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getJobsByElectrician = async (req, res) => {
  try {
    const jobs = await Job.find({
      $or: [
        { assignedTo: req.params.id },
        { assignedElectricians: req.params.id }
      ]
    }).populate('assignedTo', 'name email').sort('-createdAt');
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getCurrentElectricianJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      $or: [
        { assignedTo: req.user.id },
        { assignedElectricians: req.user.id }
      ],
      status: { $ne: 'Completed' }
    }).populate('assignedTo', 'name email').sort('-createdAt');
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getJobTimelogs = async (req, res) => {
  try {
    const timelogs = await TimeLog.find({ job: req.params.id }).populate('user', 'name email').sort('-checkIn');
    res.status(200).json({ success: true, count: timelogs.length, data: timelogs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.checkIn = async (req, res) => {
  try {
    const electricianId = req.user.id;
    const jobId = req.params.id;

    // Check if electrician already has an active checkin for this job
    const existingLog = await TimeLog.findOne({
      $or: [{ electrician: electricianId }, { user: electricianId }],
      job: jobId,
      status: 'active'
    });

    if (existingLog) {
      return res.status(200).json({ success: true, data: existingLog, message: 'Already checked in' });
    }

    const timelog = await TimeLog.create({
      electrician: electricianId,
      user: electricianId,
      job: jobId,
      checkIn: req.body.checkInTime ? new Date(req.body.checkInTime) : new Date(),
      status: 'active',
      notes: req.body.notes || ''
    });

    res.status(201).json({ success: true, data: timelog });
  } catch (err) {
    console.error('Checkin error:', err);
    res.status(400).json({ success: false, message: err.message || 'Checkin error' });
  }
};
