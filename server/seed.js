const mongoose = require('mongoose');
const User = require('./models/User');
const Attendance = require('./models/Attendance');
require('dotenv').config();

const users = [
  { name: 'Manager One', email: 'manager@test.com', password: '123', role: 'manager', employeeId: 'MGR001', department: 'HR' },
  { name: 'Alice Employee', email: 'alice@test.com', password: '123', role: 'employee', employeeId: 'EMP001', department: 'IT' },
  { name: 'Bob Worker', email: 'bob@test.com', password: '123', role: 'employee', employeeId: 'EMP002', department: 'Sales' }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to DB');

    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});
    console.log('🧹 Cleared old data');

    // Create Users
    const createdUsers = await User.create(users);
    console.log('👤 Users Created');

    // Create Fake Attendance for the last 5 days
    const alice = createdUsers[1]; // Alice
    const bob = createdUsers[2];   // Bob
    const today = new Date();
    const attendanceRecords = [];

    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // Alice is Present mostly
      attendanceRecords.push({
        userId: alice._id,
        date: dateStr,
        checkInTime: new Date(d.setHours(9, 0, 0)),
        checkOutTime: new Date(d.setHours(17, 0, 0)),
        status: 'Present',
        totalHours: 8,
        reason: 'On Time'
      });

      // Bob is Late or Absent
      if (i % 2 === 0) {
        attendanceRecords.push({
          userId: bob._id,
          date: dateStr,
          checkInTime: new Date(d.setHours(10, 30, 0)), // Late
          checkOutTime: new Date(d.setHours(18, 0, 0)),
          status: 'Late',
          totalHours: 7.5,
          reason: 'Traffic Issue'
        });
      }
    }

    await Attendance.create(attendanceRecords);
    console.log('📅 Attendance Records Created');

    console.log('✅ SEEDING COMPLETE');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();