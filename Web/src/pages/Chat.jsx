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
      const token = localStorage.getItem('token');
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
    <div className="page-container" style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      <button onClick={() => navigate('/')} style={styles.backBtn}>
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <h1 style={{ color: '#111827', marginTop: '15px' }}>🤖 AI Veterinary Assistant</h1>
      <p style={{ color: '#6B7280', marginBottom: '20px' }}>Powered by Gemini AI for instant triage and cattle health guidance.</p>

      <div style={styles.chatBox}>
        <div style={styles.messageList}>
          {messages.map((m, idx) => (
            <div key={idx} style={{ ...styles.bubbleRow, justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              {m.sender === 'bot' && <Bot size={24} color="#10B981" style={{ marginTop: '4px' }} />}
              <div style={{
                ...styles.bubble,
                background: m.sender === 'user' ? '#10B981' : '#F3F4F6',
                color: m.sender === 'user' ? '#fff' : '#1F2937'
              }}>
                {m.text}
              </div>
              {m.sender === 'user' && <User size={24} color="#3B82F6" style={{ marginTop: '4px' }} />}
            </div>
          ))}
          {loading && <p style={{ fontStyle: 'italic', color: '#9CA3AF' }}>AI is thinking...</p>}
        </div>

        <form onSubmit={handleSend} style={styles.inputRow}>
          <input 
            type="text" 
            placeholder="Ask a question (e.g., My cow has fever and blisters)..." 
            value={input}
            onChange={e => setInput(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.sendBtn}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#4B5563', fontWeight: 'bold' },
  chatBox: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', display: 'flex', flexDirection: 'column', height: '500px', overflow: 'hidden' },
  messageList: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' },
  bubbleRow: { display: 'flex', gap: '10px', alignItems: 'flex-start' },
  bubble: { padding: '12px 16px', borderRadius: '16px', maxWidth: '80%', lineHeight: '1.4' },
  inputRow: { display: 'flex', gap: '10px', padding: '15px', borderTop: '1px solid #E5E7EB', background: '#F9FAFB' },
  input: { flex: 1, padding: '10px 15px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '15px', outline: 'none' },
  sendBtn: { background: '#10B981', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '8px', cursor: 'pointer' }
};
