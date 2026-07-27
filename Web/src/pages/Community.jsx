import { useState } from 'react';
import TopHeaderBanner from '../components/TopHeaderBanner';

const POSTS = [
  {
    id: 1, user: 'Ramesh Kumar', location: 'Pune, MH', time: '2h ago',
    text: 'My cow recovered from LSD after 3 weeks of Ivermectin + Betadine treatment. Thank you PashuRakshak for the early diagnosis! 🙏',
    tags: ['LSD', 'Recovery'], likes: 24, comments: 6, avatar: '👨‍🌾',
  },
  {
    id: 2, user: 'Sunita Devi', location: 'Karnal, HR', time: '5h ago',
    text: 'Alert: FMD cases reported in Sector 4 area. I have isolated my herd and started vaccination. Please check your cattle.',
    tags: ['FMD', 'Alert'], likes: 45, comments: 12, avatar: '👩‍🌾',
  },
  {
    id: 3, user: 'Bharat Singh', location: 'Anand, GJ', time: '1d ago',
    text: 'My buffalo gave 18 litres today after following the balanced TMR diet from the AI Vet chat. Highly recommend! 🥛',
    tags: ['Nutrition', 'Milk Yield'], likes: 38, comments: 9, avatar: '👨‍🌾',
  },
  {
    id: 4, user: 'Lakshmi Reddy', location: 'Nellore, AP', time: '2d ago',
    text: 'Free veterinary camp by NDDB happening this weekend in Nellore district. Vaccinations and check-ups at no cost.',
    tags: ['Event', 'NDDB'], likes: 67, comments: 20, avatar: '👩‍🌾',
  },
];

const CATEGORIES = ['All', 'Alerts', 'Tips', 'Recovery', 'Events', 'Marketplace'];

export default function Community() {
  const [filter, setFilter] = useState('All');
  const [likes, setLikes] = useState({});
  const [newPost, setNewPost] = useState('');
  const [showPostBox, setShowPostBox] = useState(false);

  const toggleLike = (id) => setLikes(l => ({ ...l, [id]: !l[id] }));

  return (
    <div>
      <TopHeaderBanner title="Community Feed" subtitle="Connect with farmers — share alerts, tips & recovery stories">
        <button className="btn btn-primary btn-sm" onClick={() => setShowPostBox(!showPostBox)}>
          ✏️ Post Update
        </button>
      </TopHeaderBanner>

      {/* New Post Box */}
      {showPostBox && (
        <div className="card mb-4 animate-fade-in">
          <textarea
            className="input"
            style={{ height: 100, marginBottom: 12 }}
            placeholder="Share a disease alert, tip, or recovery story with the community..."
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
          />
          <div className="flex-end gap-3">
            <button className="btn btn-ghost btn-sm" onClick={() => setShowPostBox(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={() => { setShowPostBox(false); setNewPost(''); }}>Post</button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="tab-pills">
        {CATEGORIES.map(c => (
          <button key={c} className={`tab-pill${filter === c ? ' active' : ''}`} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>

      {/* Posts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {POSTS.map(post => (
          <div key={post.id} className="card animate-fade-in">
            {/* Header */}
            <div className="flex-between mb-3">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 20, background: 'linear-gradient(135deg, #16A34A, #0F766E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {post.avatar}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{post.user}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {post.location} · {post.time}</div>
                </div>
              </div>
            </div>

            {/* Text */}
            <div style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.6, marginBottom: 12 }}>{post.text}</div>

            {/* Tags */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {post.tags.map(t => (
                <span key={t} className="badge badge-primary">#{t}</span>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: likes[post.id] ? '#EF4444' : 'var(--text-muted)', fontWeight: 600 }}
                onClick={() => toggleLike(post.id)}
              >
                {likes[post.id] ? '❤️' : '🤍'} {post.likes + (likes[post.id] ? 1 : 0)}
              </button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                💬 {post.comments}
              </button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                📤 Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
