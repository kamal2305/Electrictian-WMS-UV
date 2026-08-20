const mongoose = require('mongoose');

const TimeLogSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.ObjectId, ref: 'Job', required: true },
  electrician: { type: mongoose.Schema.ObjectId, ref: 'User' },
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  checkIn: { type: Date, required: true, default: Date.now },
  checkOut: { type: Date },
  hoursWorked: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

// Synchronize user and electrician references and calculate hoursWorked
TimeLogSchema.pre('save', function(next) {
  if (this.user && !this.electrician) {
    this.electrician = this.user;
  } else if (this.electrician && !this.user) {
    this.user = this.electrician;
  }
  
  if (this.checkIn && this.checkOut) {
    this.hoursWorked = Number(((this.checkOut - this.checkIn) / (1000 * 60 * 60)).toFixed(2));
  }
  next();
});

module.exports = mongoose.model('TimeLog', TimeLogSchema);
