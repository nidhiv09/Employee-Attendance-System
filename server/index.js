const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');
const Attendance = require('./models/Attendance');

const app = express();

// --- SIMPLE CORS (The version that worked before) ---
app.use(cors()); 
// ----------------------------------------------------

app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ DB Error:', err));

// --- ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    const employeeId = 'EMP' + Math.floor(1000 + Math.random() * 9000); 
    const user = await User.create({ name, email, password, role, employeeId, department });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.password !== password) return res.status(400).json({ error: 'Invalid credentials' });
  res.json({ user });
});

app.post('/api/attendance/checkin', async (req, res) => {
  const { userId, reason } = req.body;
  const date = new Date().toISOString().split('T')[0];
  const existing = await Attendance.findOne({ userId, date });
  if (existing) return res.status(400).json({ error: 'Already checked in today' });
  
  let status = 'Present';
  if (new Date().getHours() >= 10) status = 'Late';
  
  const newRecord = await Attendance.create({ userId, date, checkInTime: new Date(), status, reason: status === 'Late' ? reason : 'On Time' });
  res.json(newRecord);
});

app.post('/api/attendance/checkout', async (req, res) => {
  const { userId } = req.body;
  const date = new Date().toISOString().split('T')[0];
  const record = await Attendance.findOne({ userId, date });
  if (!record) return res.status(400).json({ error: 'Not checked in' });
  
  record.checkOutTime = new Date();
  record.totalHours = ((record.checkOutTime - record.checkInTime) / (1000 * 60 * 60)).toFixed(2);
  await record.save();
  res.json(record);
});

app.get('/api/attendance/my-history/:userId', async (req, res) => {
  const history = await Attendance.find({ userId: req.params.userId }).sort({ date: -1 });
  res.json(history);
});

app.get('/api/attendance/my-summary/:userId', async (req, res) => {
  const data = await Attendance.find({ userId: req.params.userId });
  res.json({
    present: data.filter(r => r.status === 'Present').length,
    late: data.filter(r => r.status === 'Late').length,
    absent: data.filter(r => r.status === 'Absent').length
  });
});

app.get('/api/dashboard/employee/:userId', async (req, res) => {
  const data = await Attendance.find({ userId: req.params.userId });
  const totalHours = data.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
  res.json({ totalHours: totalHours.toFixed(1) });
});

app.get('/api/dashboard/manager', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const presentToday = await Attendance.countDocuments({ date: today, status: { $in: ['Present', 'Late'] } });
    const lateToday = await Attendance.countDocuments({ date: today, status: 'Late' });

    const presentUserIds = await Attendance.find({ date: today }).distinct('userId');
    const absentEmployees = await User.find({ role: 'employee', _id: { $nin: presentUserIds } }).select('name department employeeId');

    const weeklyRaw = await Attendance.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: "$date", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const weeklyStats = weeklyRaw.map(item => ({ date: item._id, Attendees: item.count }));

    const presentDocs = await Attendance.find({ date: today }).populate('userId', 'department');
    const deptCounts = {};
    presentDocs.forEach(doc => {
      const dept = doc.userId?.department || 'Unknown';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });
    const departmentStats = Object.keys(deptCounts).map(dept => ({ name: dept, value: deptCounts[dept] }));

    res.json({ totalEmployees, presentToday, lateToday, absentEmployees, weeklyStats, departmentStats });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/attendance/all', async (req, res) => {
  const all = await Attendance.find().populate('userId', 'name employeeId department').sort({ date: -1 });
  res.json(all);
});

app.listen(5000, () => console.log('🚀 Server running on port 5000'));