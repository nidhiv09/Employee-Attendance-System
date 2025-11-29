import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register'; // <--- IMPORT STEP 1

// Splash Component
const SplashScreen = () => (
  <div style={{
    height: '100vh', 
    background: '#065f46', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    flexDirection: 'column', 
    color: 'white', 
    animation: 'fadeIn 0.5s ease'
  }}>
    <h1 style={{ fontSize: '3rem', margin: 0 }}>ATTENDANCE SYSTEM</h1>
    <p style={{ letterSpacing: '2px', opacity: 0.8 }}>Loading Portal...</p>
  </div>
);

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <SplashScreen />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* THIS IS THE MISSING PART CAUSING YOUR ERROR */}
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;