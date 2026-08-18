import React, { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const SUGGESTIONS = [
  'What are the signs of Lumpy Skin Disease?',
  'How to treat FMD in cattle?',
  'Best vaccination schedule for calves?',
  'How to prevent mastitis?',
];

const WELCOME_MESSAGE = `Namaste! I am the **PashuRakshak AI Veterinary Assistant**. I am here to help you care for your livestock.

I can assist you with:
* Identifying symptoms of illness.
* Providing first-aid advice.
* Explaining diseases like Lumpy Skin Disease (LSD), Foot and Mouth Disease (FMD), and Mastitis.

Please describe any symptoms you are noticing.

*(Note: For serious conditions, always consult your local veterinary officer immediately.)*`;

const parseMarkdown = (text) => {
  if (!text) return '';
  let clean = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  clean = clean.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  clean = clean.replace(/__(.*?)__/g, '<strong>$1</strong>');
  clean = clean.replace(/\*(.*?)\*/g, '<em>$1</em>');
  clean = clean.replace(/_(.*?)_/g, '<em>$1</em>');

  const lines = clean.split('\n');
  let inList = false;
  const parsedLines = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      if (!inList) {
        inList = true;
        parsedLines.push('<ul style="margin: 8px 0; padding-left: 24px; list-style-type: disc;">');
      }
      parsedLines.push(`<li style="margin-bottom: 4px; line-height: 1.5;">${trimmed.substring(2)}</li>`);
    } else {
      if (inList) {
        inList = false;
        parsedLines.push('</ul>');
      }
      parsedLines.push(line);
    }
  }
  if (inList) {
    parsedLines.push('</ul>');
  }
  return parsedLines.join('<br />').replace(/<\/ul><br \/>/g, '</ul>').replace(/<ul(.*?)><br \/>/g, '<ul$1>');
};

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
        setMessages([{ sender: 'bot', text: WELCOME_MESSAGE }]);
      }
    } catch (e) {
      console.error(e);
      setMessages([{ sender: 'bot', text: WELCOME_MESSAGE }]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleNewSession = async () => {
    if (window.confirm("Are you sure you want to start a new consultation? This will clear current session history.")) {
      setLoading(true);
      try {
        const token = localStorage.getItem('userToken');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/chat/clear`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setMessages([{ sender: 'bot', text: WELCOME_MESSAGE }]);
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
      setMessages(prev => [...prev, { sender: 'bot', text: 'Network error. Please check your connection.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden', background: 'var(--bg-base)' }}>
      
      {/* Header & Disclaimer Panel */}
      <div style={{ padding: '24px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px 0' }}>AI Veterinary Assistant</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-sub)', margin: 0 }}>Get livestock health guidance and information</p>
          </div>
          <button 
            onClick={handleNewSession}
            className="btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', borderRadius: '4px' }}
          >
            <RefreshCw size={14} /> New Consultation
          </button>
        </div>
        
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '4px' }}>
          <AlertCircle size={18} color="#D97706" />
          <span style={{ fontSize: '13px', color: '#B45309', fontWeight: 500 }}>
            AI-generated information is for guidance only and does not replace professional veterinary diagnosis.
          </span>
        </div>
      </div>

      {/* Suggestion chips */}
      {messages.length <= 1 && (
        <div style={{ padding: '16px 24px', display: 'flex', gap: '8px', flexWrap: 'wrap', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
          {SUGGESTIONS.map(s => (
            <button 
              key={s} 
              onClick={() => sendMessage(s)} 
              disabled={loading}
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', padding: '6px 12px', fontSize: '13px', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '4px' }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages Container */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {historyLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
            Loading consultation history...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
            Start a consultation by asking a livestock health question.
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', maxWidth: '800px', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', width: '100%' }}>
              {msg.sender === 'bot' && (
                <div style={{ width: '40px', height: '40px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '20px' }}>🏥</span>
                </div>
              )}
              
              <div style={{ 
                background: msg.sender === 'user' ? 'var(--primary-light)' : 'var(--bg-surface)', 
                border: msg.sender === 'user' ? '1px solid var(--border-active)' : '1px solid var(--border)', 
                borderRadius: '4px', 
                padding: '16px', 
                flex: 1,
                color: msg.sender === 'user' ? 'var(--primary-dark)' : 'var(--text-main)'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: msg.sender === 'user' ? 'var(--primary)' : 'var(--text-sub)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  {msg.sender === 'user' ? 'You' : 'AI Assistant'}
                </div>
                <div 
                  style={{ fontSize: '14px', lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}
                />
              </div>

              {msg.sender === 'user' && (
                <div style={{ width: '40px', height: '40px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '20px' }}>👤</span>
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div style={{ display: 'flex', gap: '16px', maxWidth: '800px', alignSelf: 'flex-start', width: '100%' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '20px' }}>🏥</span>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '16px', flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', marginBottom: '8px', textTransform: 'uppercase' }}>
                AI Assistant
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Analyzing inquiry...</div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div style={{ padding: '24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '12px' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask your question..."
            disabled={loading || historyLoading}
            style={{
              flex: 1,
              height: '48px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              padding: '0 16px',
              fontSize: '14px',
              outline: 'none',
              background: 'var(--bg-base)'
            }}
          />
          <button 
            onClick={() => sendMessage()} 
            disabled={loading || historyLoading || !input.trim()}
            style={{
              height: '48px',
              padding: '0 24px',
              borderRadius: '4px',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Send <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
