const User = require('../models/User');

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: { _id: user._id, id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, specialization: user.specialization, address: user.address }
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, specialization } = req.body;
    const user = await User.create({ name, email, password, role: role || 'electrician', phone, specialization });
    sendToken(user, 201, res);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Email already registered' });
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: { ...user._doc, id: user._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = { name: req.body.name, phone: req.body.phone, specialization: req.body.specialization, address: req.body.address };
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
