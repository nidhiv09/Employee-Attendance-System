import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useAttendanceStore from '../store'; // Zustand Store
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'; // Charts

export default function Dashboard() {
  const navigate = useNavigate();
  
  // 1. GLOBAL STATE (From Zustand)
  const { 
    user, 
    stats, 
    history, 
    allAttendance, 
    fetchManagerDashboard, 
    fetchEmployeeDashboard 
  } = useAttendanceStore();

  // 2. LOCAL UI STATE (Filters & Calendars)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterName, setFilterName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 3. INITIAL LOAD
  useEffect(() => {
    if (!user) return navigate('/');
    user.role === 'employee' ? fetchEmployeeDashboard(user._id) : fetchManagerDashboard();
  }, [user]);

  // 4. ACTIONS (Check In/Out)
  const handleCheckIn = async () => {
    const now = new Date();
    let reason = "On Time";
    if (now.getHours() >= 10) {
      reason = prompt("You are marking attendance Late. Please enter reason:");
      if (!reason) return alert("Reason is required!");
    }
    try {
      await axios.post('https://attendance-backend-16ix.onrender.com/api/attendance/checkin', { userId: user._id, reason });
      alert('Checked In!');
      fetchEmployeeDashboard(user._id);
    } catch (err) { alert(err.response?.data?.error); }
  };

  const handleCheckOut = async () => {
    try {
      await axios.post('https://attendance-backend-16ix.onrender.com/api/attendance/checkout', { userId: user._id });
      alert('Checked Out!');
      fetchEmployeeDashboard(user._id);
    } catch (err) { alert(err.response?.data?.error); }
  };

  // 5. HELPER: Manager Filter Logic
  const filteredAttendance = allAttendance.filter(rec => {
    const recDate = new Date(rec.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const matchesName = filterName === '' || rec.userId?.name.toLowerCase().includes(filterName.toLowerCase());
    const matchesStart = !start || recDate >= start;
    const matchesEnd = !end || recDate <= end;

    return matchesName && matchesStart && matchesEnd;
  });

  // 6. HELPER: Export CSV
  const exportCSV = () => {
    const headers = ["Employee,Date,In,Out,Status,Reason\n"];
    const rows = filteredAttendance.map(row => 
      `${row.userId?.name},${row.date},${row.checkInTime||'-'},${row.checkOutTime||'-'},${row.status},${row.reason}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  // 7. HELPER: Render Calendar
  const renderCalendar = () => {
    const year = parseInt(selectedMonth.split('-')[0]);
    const month = parseInt(selectedMonth.split('-')[1]) - 1; 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const record = history.find(r => r.date === dateString);
      
      let bg = '#f3f4f6'; 
      if (record) {
        if (record.status === 'Present') bg = '#dcfce7'; 
        if (record.status === 'Late') bg = '#fef9c3';    
        if (record.status === 'Absent') bg = '#fee2e2';  
        if (record.status === 'Half-day') bg = '#ffedd5';
      }

      days.push(
        <div 
          key={d} 
          onClick={() => record && alert(`📅 Date: ${record.date}\n⏰ In: ${new Date(record.checkInTime).toLocaleTimeString()}\n🏁 Out: ${record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : 'Active'}\n📊 Status: ${record.status}`)}
          style={{ 
            background: bg, 
            padding: '10px', 
            borderRadius: '6px', 
            textAlign: 'center', 
            cursor: record ? 'pointer' : 'default',
            border: record ? '1px solid #cbd5e1' : '1px dashed #e2e8f0',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}
        >
          {d}
          {record && <div style={{fontSize:'0.6rem', textTransform:'uppercase', marginTop:'2px'}}>{record.status}</div>}
        </div>
      );
    }
    return days;
  };

  if (!user) return <div className="p-10">Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: 'var(--corporate-green)', margin: 0 }}>Attendance Portal</h1>
          <p style={{ color: 'gray' }}>Welcome, <b>{user.name}</b></p>
        </div>
        {/* SIMPLE LOGOUT - This causes the refresh bug, but it's stable code */}
        <button className="btn btn-danger" onClick={() => { localStorage.clear(); navigate('/'); }}>Logout</button>
      </div>

      {/* --- MANAGER DASHBOARD --- */}
      {user.role === 'manager' && (
        <>
          {/* 1. TOP STATS */}
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-number">{stats.totalEmployees || 0}</div><div className="stat-label">Total Employees</div></div>
            <div className="stat-card"><div className="stat-number">{stats.presentToday || 0}</div><div className="stat-label">Present Today</div></div>
            <div className="stat-card"><div className="stat-number" style={{color:'red'}}>{stats.lateToday || 0}</div><div className="stat-label">Late Today</div></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
            {/* 2. CHARTS SECTION */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="card">
                <h3>Weekly Trend</h3>
                <div style={{ height: '250px', width: '100%' }}>
                  <ResponsiveContainer>
                    <BarChart data={stats.weeklyStats || []}>
                      <XAxis dataKey="date" tick={{fontSize: 12}} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="Attendees" fill="#059669" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <h3>Dept. Attendance</h3>
                <div style={{ height: '250px', width: '100%' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={stats.departmentStats || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {(stats.departmentStats || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#059669', '#047857', '#34d399', '#064e3b'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 3. ABSENT LIST */}
            <div className="card" style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
              <h3 style={{ color: '#991b1b' }}>Absent Today 🚨</h3>
              {stats.absentEmployees?.length > 0 ? (
                <ul style={{ paddingLeft: '20px', color: '#7f1d1d' }}>
                  {stats.absentEmployees.map(emp => (
                    <li key={emp._id} style={{ marginBottom: '5px' }}>
                      <b>{emp.name}</b> <small>({emp.department})</small>
                    </li>
                  ))}
                </ul>
              ) : <p style={{ color: 'green' }}>Everyone is present!</p>}
            </div>
          </div>

          {/* 4. REPORTS & FILTERS */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Reports & Filter</h3>
              <button className="btn btn-outline" onClick={exportCSV}>📥 Export CSV</button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', background: '#f1f5f9', padding: '15px', borderRadius: '8px' }}>
              <div style={{flex:1}}>
                <label style={{fontSize:'0.75rem', fontWeight:'bold', display:'block', marginBottom:'5px'}}>SEARCH EMPLOYEE</label>
                <input placeholder="Type name..." value={filterName} onChange={e => setFilterName(e.target.value)} style={{width:'100%', padding:'8px', border:'1px solid #ccc', borderRadius:'4px', boxSizing:'border-box'}} />
              </div>
              <div>
                <label style={{fontSize:'0.75rem', fontWeight:'bold', display:'block', marginBottom:'5px'}}>START DATE</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}} />
              </div>
              <div>
                <label style={{fontSize:'0.75rem', fontWeight:'bold', display:'block', marginBottom:'5px'}}>END DATE</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}} />
              </div>
              <div style={{display:'flex', alignItems:'end'}}>
                 <button className="btn btn-primary" onClick={() => {setFilterName(''); setStartDate(''); setEndDate('');}}>Reset</button>
              </div>
            </div>

            <table>
              <thead>
                <tr><th>User</th><th>Date</th><th>In</th><th>Out</th><th>Status</th><th>Reason</th></tr>
              </thead>
              <tbody>
                {filteredAttendance.length > 0 ? (
                  filteredAttendance.map(rec => (
                    <tr key={rec._id}>
                      <td><b>{rec.userId?.name}</b></td>
                      <td>{rec.date}</td>
                      <td>{rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : '-'}</td>
                      <td>{rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : '-'}</td>
                      <td><span className={`badge badge-${rec.status}`}>{rec.status}</span></td>
                      <td>{rec.reason}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" style={{textAlign:'center', padding:'20px', color:'gray'}}>No records found matching filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* --- EMPLOYEE DASHBOARD --- */}
      {user.role === 'employee' && (
        <>
          <div className="card" style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button className="btn btn-primary" style={{ marginRight: '10px' }} onClick={handleCheckIn}>✅ Quick Check In</button>
            <button className="btn btn-danger" onClick={handleCheckOut}>🛑 Quick Check Out</button>
          </div>

          <div className="card">
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
               <h3>Attendance Calendar</h3>
               <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}}/>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} style={{textAlign:'center', fontWeight:'bold', color:'gray'}}>{d}</div>)}
                {renderCalendar()}
             </div>
          </div>
          
          <div className="card">
            <h3>My History List</h3>
             <table>
               <thead><tr><th>Date</th><th>In</th><th>Out</th><th>Status</th></tr></thead>
               <tbody>
                 {history.map(rec => (
                   <tr key={rec._id}>
                     <td>{rec.date}</td>
                     <td>{rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : '-'}</td>
                     <td>{rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : '-'}</td>
                     <td>{rec.status}</td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}