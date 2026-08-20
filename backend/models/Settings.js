const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', unique: true, required: true },
  companyName: { type: String, default: 'ElectroTrack WMS' },
  companyAddress: { type: String, default: '' },
  companyPhone: { type: String, default: '' },
  companyEmail: { type: String, default: '' },
  companyLogo: { type: String },
  currencySymbol: { type: String, default: '₹' },
  defaultLabourRate: { type: Number, default: 0 },
  defaultNotes: { type: String, default: 'Thank you for your business.' },
  taxRate: { type: Number, default: 0 },
  theme: { type: String, default: 'dark' },
  updatedAt: { type: Date, default: Date.now }
});

SettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Settings', SettingsSchema);
