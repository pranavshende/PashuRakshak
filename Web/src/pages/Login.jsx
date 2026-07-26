import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await login(data.token, data.user);
        navigate('/');
      } else {
        alert(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error(error);
      alert('Unable to connect to server');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="brand-title">PashuRakshak</h1>
        <p className="auth-subtitle">Welcome Back!</p>

        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="tel"
            className="input-field"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            type="password"
            className="input-field"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="primary-button">
            Login
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/register" className="link-text">
            Don't have an account? <span>Register</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
