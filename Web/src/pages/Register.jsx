import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await login(data.token, data.user);
        navigate('/');
      } else {
        alert(data.error || 'Registration failed');
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
        <p className="auth-subtitle">Create an Account</p>

        <form onSubmit={handleRegister} className="auth-form">
          <input
            type="text"
            className="input-field"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            Register
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login" className="link-text">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}
