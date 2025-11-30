import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee', // Default role
    department: 'IT'
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://attendance-backend-l6ix.onrender.com/api/auth/register', formData);
      alert('Registration Successful! Please Login.');
      navigate('/'); // Go back to Login page
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: 'var(--corporate-green)', margin: 0, fontSize: '2rem' }}>New Account</h1>
          <p style={{ color: 'var(--text-light)', marginTop: '5px' }}>Join the team</p>
        </div>
        
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <input name="name" type="text" placeholder="Full Name" onChange={handleChange} required style={inputStyle} />
          <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required style={inputStyle} />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} required style={inputStyle} />
          
          <select name="role" onChange={handleChange} style={inputStyle}>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>

          <input name="department" type="text" placeholder="Department (e.g. Sales)" onChange={handleChange} style={inputStyle} />

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
            Register Now
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: 'gray' }}>Already have an ID?</p>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--corporate-green)', cursor: 'pointer', textDecoration: 'underline' }}>
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '12px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '1rem',
  width: '100%',
  boxSizing: 'border-box'
};