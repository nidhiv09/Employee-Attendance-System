const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // [cite: 36]
  email: { type: String, required: true, unique: true }, // [cite: 37]
  password: { type: String, required: true }, // [cite: 38]
  role: { 
    type: String, 
    enum: ['employee', 'manager'], 
    default: 'employee' 
  }, // [cite: 39]
  employeeId: { type: String, unique: true }, // [cite: 40]
  department: { type: String, default: 'IT' } // [cite: 41]
}, { timestamps: true }); // This automatically adds 'createdAt' [cite: 42]

module.exports = mongoose.model('User', userSchema);