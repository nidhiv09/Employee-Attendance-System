const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half-day'], default: 'Absent' },
  totalHours: { type: Number, default: 0 },
  reason: { type: String, default: 'On Time' } // <--- NEW FIELD ADDED
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);