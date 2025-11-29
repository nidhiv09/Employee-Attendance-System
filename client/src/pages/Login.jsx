import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(res.data.user)); 
      navigate('/dashboard'); 
    } catch (err) {
      alert('Login Failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const quickRegister = async () => {
    const name = prompt("Enter Name:");
    if(!name) return;
    const regEmail = prompt("Enter Email:");
    const regPass = prompt("Enter Password:");
    const role = prompt("Role (employee/manager):", "employee");
    try {
      await axios.post('http://localhost:5000/api/auth/register', { name, email: regEmail, password: regPass, role });
      alert("User Created! Login now.");
    } catch (err) { alert("Failed"); }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: 'var(--corporate-green)', margin: 0, fontSize: '2rem' }}>Welcome</h1>
          <p style={{ color: 'var(--text-light)', marginTop: '5px' }}>Attendance Management System</p>
        </div>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input type="text" placeholder="Email Address" onChange={e => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
          <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>Login</button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
           onClick={() => navigate('/register')} 
           style={{ background: 'none', border: 'none', color: 'var(--corporate-green)', cursor: 'pointer', textDecoration: 'underline' }}>
           Create Account
          </button>
        </div>
      </div>
    </div>
  );
}