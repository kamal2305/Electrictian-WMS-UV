const Settings = require('../models/Settings');

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ user: req.user.id });
    if (!settings) {
      settings = await Settings.create({ user: req.user.id });
    }
    res.status(200).json({ success: true, data: settings });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateSettings = async (req, res) => {
  try {
    const allowedFields = ['companyName', 'companyAddress', 'companyPhone', 'companyEmail', 'currencySymbol', 'defaultLabourRate', 'defaultNotes', 'taxRate', 'theme'];
    const updates = {};
    allowedFields.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });
    
    let settings = await Settings.findOneAndUpdate(
      { user: req.user.id },
      updates,
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: settings });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};
