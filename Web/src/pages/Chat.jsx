import { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

const SUGGESTIONS = [
  'What are signs of Lumpy Skin Disease?',
  'How to treat FMD in cattle?',
  'Best vaccination schedule for calves?',
  'How to prevent mastitis?',
];

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => { 
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages, loading]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await api.getChatHistory();
      if (data.conversation && data.conversation.messages.length > 0) {
        setMessages(data.conversation.messages);
      } else {
        setMessages([{ sender: 'bot', text: 'Namaste! 🐄 I am your PashuRakshak AI Vet Assistant powered by Google Gemini. Ask me anything about cattle health, disease symptoms, or deworming plans.' }]);
      }
    } catch (e) {
      console.error(e);
      setMessages([{ sender: 'bot', text: 'Namaste! 🐄 I am your PashuRakshak AI Vet Assistant. How can I help you today?' }]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleNewSession = async () => {
    if (window.confirm("Are you sure you want to start a new consultation? This will clear current session history.")) {
      setLoading(true);
      try {
        const token = localStorage.getItem('userToken');
        // Simple endpoint to delete conversation or we just clear client-side/start new conversation on backend.
        // For simplicity, we just post to a '/chat/clear' or clear client state
        // Let's check backend if it supports clearing or we just wipe Client-side and backend will create new one
        // We'll clear conversation in Prisma in a new endpoint
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/chat/clear`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setMessages([{ sender: 'bot', text: 'Namaste! 🐄 I started a new AI consultation session. Ask me any herd health queries.' }]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: msg }]);
    setLoading(true);
    try {
      const data = await api.sendChatMessage(msg);
      setMessages(prev => [...prev, { sender: 'bot', text: data.response || 'Could not process your request.' }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'bot', text: '⚠️ Network error. Please check your connection.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 92px)', overflow: 'hidden', background: '#F8FAFC' }}>
      
      {/* Disclaimer Panel */}
      <div style={{ background: '#FFFBEB', borderBottom: '1px solid #FDE68A', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}>
        <AlertTriangle size={16} color="#D97706" />
        <span style={{ fontSize: '11px', color: '#B45309', fontWeight: 600 }}>
          ⚠️ Disclaimer: AI guidance does not replace professional veterinary diagnosis. Always consult a vet for critical cases.
        </span>
        <button 
          onClick={handleNewSession}
          className="btn btn-ghost btn-sm" 
          style={{ marginLeft: 'auto', height: '28px', padding: '0 8px', background: '#fff', fontSize: '11px', color: 'var(--text-sub)' }}
        >
          <RefreshCw size={12} /> New Consult
        </button>
      </div>

      {/* Suggestion chips */}
      {messages.length <= 1 && (
        <div style={{ padding: '16px 24px 8px', display: 'flex', gap: 8, flexWrap: 'wrap', background: 'white', borderBottom: '1px solid var(--border)' }}>
          {SUGGESTIONS.map(s => (
            <button key={s} className="chat-chip" onClick={() => sendMessage(s)} disabled={loading}>{s}</button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages" style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {historyLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading conversation...</div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`chat-bubble-row${msg.sender === 'user' ? ' user' : ''} animate-fade-in`}>
              <div className="chat-avatar" style={{
                background: msg.sender === 'bot' ? 'linear-gradient(135deg, #16A34A, #0F766E)' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                color: '#fff'
              }}>
                {msg.sender === 'bot' ? '🐄' : '👤'}
              </div>
              <div className={`chat-bubble ${msg.sender}`} style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
            </div>
          ))
        )}

        {loading && (
          <div className="chat-bubble-row animate-fade-in">
            <div className="chat-avatar" style={{ background: 'linear-gradient(135deg, #16A34A, #0F766E)', color: '#fff' }}>🐄</div>
            <div className="chat-bubble bot">
              <div className="typing-dots"><span /><span /><span /></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="chat-input-bar" style={{ padding: '16px 24px', margin: 0, background: '#fff', borderTop: '1px solid var(--border)' }}>
        <input
          className="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask about cattle health, symptoms, treatments..."
          disabled={loading || historyLoading}
        />
        <button className="btn btn-primary btn-icon" onClick={() => sendMessage()} disabled={loading || historyLoading || !input.trim()}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
