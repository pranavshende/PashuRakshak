import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Namaste! I am your PashuRakshak AI Vet Assistant. Ask me anything about cattle health, symptoms, or remedies.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMsg.text })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply || 'Sorry, I could not process your request.' }]);
    } catch (e) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Network error. Please make sure the backend server is running.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate('/')} className="btn btn-ghost" style={{ padding: '0 8px' }}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
      </div>

      <h1 style={{ marginBottom: '8px' }}>🤖 AI Veterinary Assistant</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Powered by Gemini AI for instant triage and cattle health guidance.</p>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '600px', overflow: 'hidden', padding: 0 }}>
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--bg-base)' }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              {m.sender === 'bot' && (
                <div style={{ background: 'var(--primary-light)', padding: '8px', borderRadius: '50%' }}>
                  <Bot size={20} color="var(--primary-dark)" />
                </div>
              )}
              <div style={{
                padding: '16px 20px', 
                borderRadius: '16px', 
                maxWidth: '75%', 
                lineHeight: '1.5',
                fontSize: '15px',
                background: m.sender === 'user' ? 'var(--primary)' : '#fff',
                color: m.sender === 'user' ? '#fff' : 'var(--text-main)',
                border: m.sender === 'bot' ? '1px solid var(--border-light)' : 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                {m.text}
              </div>
              {m.sender === 'user' && (
                <div style={{ background: 'var(--secondary-light)', padding: '8px', borderRadius: '50%' }}>
                  <User size={20} color="var(--secondary-dark)" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ background: 'var(--primary-light)', padding: '8px', borderRadius: '50%' }}>
                <Bot size={20} color="var(--primary-dark)" />
              </div>
              <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>AI is thinking...</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px', padding: '20px', borderTop: '1px solid var(--border-light)', background: '#fff' }}>
          <input 
            type="text" 
            placeholder="Ask a question (e.g., My cow has fever and blisters)..." 
            value={input}
            onChange={e => setInput(e.target.value)}
            className="input-field"
            style={{ flex: 1, margin: 0 }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
