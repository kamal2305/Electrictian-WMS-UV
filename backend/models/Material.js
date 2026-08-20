const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please add a material name'] },
  description: { type: String },
  unit: { type: String, default: 'pcs' },
  unitPrice: { type: Number, required: true, default: 0 },
  quantity: { type: Number, default: 0 },
  minStockLevel: { type: Number, default: 0 },
  category: { type: String, default: 'General' },
  job: { type: mongoose.Schema.ObjectId, ref: 'Job' },
  addedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
  isInventory: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Material', MaterialSchema);
