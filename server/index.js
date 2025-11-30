const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');
const Attendance = require('./models/Attendance');

const app = express();
app.use(express.json());
// Replace the old app.use(cors()) with this:
app.use(cors({
  origin: "*", // Allow ALL domains (Easiest fix for interviews)
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ DB Error:', err));

// --- 1. AUTH ENDPOINTS ---
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

app.get('/api/auth/me', async (req, res) => {
  // In a real app with JWT, you would decode the token here
  res.json({ message: "User validation endpoint" });
});


// --- 2. ATTENDANCE (EMPLOYEE) ---

// POST /api/attendance/checkin
app.post('/api/attendance/checkin', async (req, res) => {
  const { userId, reason } = req.body;
  const date = new Date().toISOString().split('T')[0];
  const now = new Date();

  const existing = await Attendance.findOne({ userId, date });
  if (existing) return res.status(400).json({ error: 'Already checked in today' });

  let status = 'Present';
  if (now.getHours() >= 10) status = 'Late'; 

  const newRecord = await Attendance.create({ userId, date, checkInTime: now, status, reason: status === 'Late' ? reason : 'On Time' });
  res.json(newRecord);
});

// POST /api/attendance/checkout
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

// GET /api/attendance/my-history
app.get('/api/attendance/my-history/:userId', async (req, res) => {
  const history = await Attendance.find({ userId: req.params.userId }).sort({ date: -1 });
  res.json(history);
});

// GET /api/attendance/my-summary (Calculated Monthly Stats)
app.get('/api/attendance/my-summary/:userId', async (req, res) => {
  const data = await Attendance.find({ userId: req.params.userId });
  const present = data.filter(r => r.status === 'Present').length;
  const late = data.filter(r => r.status === 'Late').length;
  const absent = data.filter(r => r.status === 'Absent').length;
  res.json({ present, late, absent });
});

// GET /api/attendance/today (Check if checked in today)
app.get('/api/attendance/today/:userId', async (req, res) => {
  const date = new Date().toISOString().split('T')[0];
  const record = await Attendance.findOne({ userId: req.params.userId, date });
  res.json({ checkedIn: !!record, record });
});


// --- 3. ATTENDANCE (MANAGER) ---

// GET /api/attendance/all
app.get('/api/attendance/all', async (req, res) => {
  const all = await Attendance.find().populate('userId', 'name employeeId department').sort({ date: -1 });
  res.json(all);
});

// GET /api/attendance/employee/:id
app.get('/api/attendance/employee/:id', async (req, res) => {
  const records = await Attendance.find({ userId: req.params.id });
  res.json(records);
});

// GET /api/attendance/today-status (Who is present today)
app.get('/api/attendance/today-status', async (req, res) => {
  const date = new Date().toISOString().split('T')[0];
  const present = await Attendance.find({ date }).populate('userId', 'name');
  res.json(present);
});


// --- 4. DASHBOARD STATS ---

// GET /api/dashboard/employee (Stats for dashboard)
app.get('/api/dashboard/employee/:userId', async (req, res) => {
  const data = await Attendance.find({ userId: req.params.userId });
  const totalHours = data.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
  res.json({ totalHours: totalHours.toFixed(1), recent: data.slice(0, 7) });
});

// GET /api/dashboard/manager (Advanced Stats for Charts & Absent List)
app.get('/api/dashboard/manager', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Basic Counts
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const presentToday = await Attendance.countDocuments({ date: today, status: { $in: ['Present', 'Late'] } });
    const lateToday = await Attendance.countDocuments({ date: today, status: 'Late' });

    // 2. Absent Employees List 
    // Find all users who are NOT in today's attendance records
    const presentUserIds = await Attendance.find({ date: today }).distinct('userId');
    const absentEmployees = await User.find({
      role: 'employee',
      _id: { $nin: presentUserIds }
    }).select('name department employeeId');

    // 3. Weekly Trend Chart 
    // Aggregate attendance counts for the last 7 days
    const weeklyRaw = await Attendance.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: "$date", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Format for Recharts (ensure all days are valid strings)
    const weeklyStats = weeklyRaw.map(item => ({ date: item._id, Attendees: item.count }));

    // 4. Department Chart [cite: 81]
    // Find departments of everyone present today
    const presentDocs = await Attendance.find({ date: today }).populate('userId', 'department');
    const deptCounts = {};
    presentDocs.forEach(doc => {
      const dept = doc.userId?.department || 'Unknown';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });
    const departmentStats = Object.keys(deptCounts).map(dept => ({ name: dept, value: deptCounts[dept] }));

    res.json({
      totalEmployees,
      presentToday,
      lateToday,
      absentEmployees, // <--- New List
      weeklyStats,     // <--- New Chart Data
      departmentStats  // <--- New Chart Data
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('🚀 Server running on port 5000'));