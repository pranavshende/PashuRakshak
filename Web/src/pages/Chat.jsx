import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import TopHeaderBanner from '../components/TopHeaderBanner';
import { API_BASE_URL } from '../config/api';

const SUGGESTIONS = [
  'What are signs of Lumpy Skin Disease?',
  'How to treat FMD in cattle?',
  'Best vaccination schedule for calves?',
  'How to prevent mastitis?',
];

export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Namaste! 🐄 I am your PashuRakshak AI Vet Assistant powered by Google Gemini. Ask me anything about cattle health, disease symptoms, or treatment plans.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: msg }]);
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply || 'Could not process your request.' }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'bot', text: '⚠️ Network error. Please check your connection.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', margin: '-32px', overflow: 'hidden' }}>
      <div style={{ padding: '0 32px' }}>
        <TopHeaderBanner title="AI Vet Assistant" subtitle="Powered by Google Gemini — 24/7 cattle health consultation" />
      </div>

      {/* Suggestion chips */}
      <div style={{ padding: '0 32px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {SUGGESTIONS.map(s => (
          <button key={s} className="chat-chip" onClick={() => sendMessage(s)}>{s}</button>
        ))}
      </div>

      {/* Messages */}
      <div className="chat-messages" style={{ padding: '12px 32px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble-row${msg.sender === 'user' ? ' user' : ''} animate-fade-in`}>
            <div className="chat-avatar" style={{
              background: msg.sender === 'bot' ? 'linear-gradient(135deg, #16A34A, #0F766E)' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              color: '#fff'
            }}>
              {msg.sender === 'bot' ? '🐄' : '👤'}
            </div>
            <div className={`chat-bubble ${msg.sender}`}>{msg.text}</div>
          </div>
        ))}

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
      <div className="chat-input-bar" style={{ padding: '14px 32px', margin: 0 }}>
        <input
          className="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask about cattle health, symptoms, treatments..."
          disabled={loading}
        />
        <button className="btn btn-primary btn-icon" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
