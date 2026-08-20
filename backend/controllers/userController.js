const User = require('../models/User');

exports.getElectricians = async (req, res) => {
  try {
    const users = await User.find({ role: 'electrician' }).sort('name');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getElectrician = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Electrician not found' });
    res.status(200).json({ success: true, data: user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAllUsers = async (req, res) => {
  try {
    let query = {};
    if (req.query.role) query.role = req.query.role;
    const users = await User.find(query).sort('name');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createElectrician = async (req, res) => {
  try {
    req.body.role = 'electrician';
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Email already registered' });
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateElectrician = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteElectrician = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
