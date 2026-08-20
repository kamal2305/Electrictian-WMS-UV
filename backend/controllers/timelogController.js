const TimeLog = require('../models/TimeLog');

exports.checkout = async (req, res) => {
  try {
    const timelog = await TimeLog.findById(req.params.id);
    if (!timelog) return res.status(404).json({ success: false, message: 'TimeLog not found' });
    timelog.checkOut = new Date();
    timelog.status = 'completed';
    if (req.body.notes) timelog.notes = req.body.notes;
    timelog.hoursWorked = (timelog.checkOut - timelog.checkIn) / (1000 * 60 * 60);
    await timelog.save();
    res.status(200).json({ success: true, data: timelog });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.getTimelogsByJob = async (req, res) => {
  try {
    const timelogs = await TimeLog.find({ job: req.params.jobId }).populate('electrician', 'name email').sort('-checkIn');
    res.status(200).json({ success: true, count: timelogs.length, data: timelogs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, electricianId } = req.query;
    let query = {};
    if (startDate && endDate) query.checkIn = { $gte: new Date(startDate), $lte: new Date(endDate) };
    if (electricianId) query.electrician = electricianId;
    const timelogs = await TimeLog.find(query).populate('electrician', 'name email').populate('job', 'title').sort('-checkIn');
    res.status(200).json({ success: true, count: timelogs.length, data: timelogs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getHoursReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { status: 'completed' };
    if (startDate && endDate) query.checkIn = { $gte: new Date(startDate), $lte: new Date(endDate) };
    const timelogs = await TimeLog.find(query).populate('electrician', 'name').populate('job', 'title');
    const grouped = {};
    timelogs.forEach(log => {
      const id = log.electrician._id.toString();
      if (!grouped[id]) grouped[id] = { electrician: log.electrician, totalHours: 0, logs: [] };
      grouped[id].totalHours += log.hoursWorked || 0;
      grouped[id].logs.push(log);
    });
    res.status(200).json({ success: true, data: Object.values(grouped) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
