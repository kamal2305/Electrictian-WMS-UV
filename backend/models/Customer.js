const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please add customer name'], trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true },
  address: { type: String, default: '' },
  location: { type: String, default: '' },
  landmark: { type: String },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

CustomerSchema.index({ name: 1 });
CustomerSchema.index({ phone: 1 });

module.exports = mongoose.model('Customer', CustomerSchema);
