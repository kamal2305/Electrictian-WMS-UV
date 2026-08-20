const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Please add a job title'], trim: true },
  description: { type: String },
  client: {
    name: { type: String, default: 'General Client' },
    phone: { type: String },
    email: { type: String },
    address: { type: String }
  },
  assignedTo: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  assignedElectricians: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['Pending', 'Not Started', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'low', 'medium', 'high', 'urgent'],
    default: 'Medium'
  },
  startDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  endDate: { type: Date },
  estimatedHours: { type: Number },
  actualHours: { type: Number, default: 0 },
  laborCost: { type: Number, default: 0 },
  materialCost: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  notes: { type: String },
  location: { type: String },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to synchronize assignedTo and assignedElectricians
JobSchema.pre('save', function (next) {
  if (this.assignedTo && this.assignedTo.length && (!this.assignedElectricians || !this.assignedElectricians.length)) {
    this.assignedElectricians = this.assignedTo;
  } else if (this.assignedElectricians && this.assignedElectricians.length && (!this.assignedTo || !this.assignedTo.length)) {
    this.assignedTo = this.assignedElectricians;
  }
  next();
});

module.exports = mongoose.model('Job', JobSchema);
