import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, ThumbsUp, Trash2, Edit, Save, X, AlertCircle } from 'lucide-react';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';

const CATEGORIES = ['All', 'Alerts', 'Tips', 'Recovery', 'Events', 'Marketplace'];

export default function Community() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alerts');
  const [showPostBox, setShowPostBox] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Comment states
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState(null);
  const [comments, setComments] = useState({});
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await api.getCommunityPosts(filter);
      if (data.posts) setPosts(data.posts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const submitPost = async () => {
    if (!newPost.trim()) {
      setErrorMsg('Post content cannot be empty.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.createPost({
        text: newPost,
        tags: [selectedCategory],
        location: newLocation.trim() || 'Local Farm'
      });
      setNewPost('');
      setNewLocation('');
      setSelectedCategory('Alerts');
      setShowPostBox(false);
      fetchPosts();
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to submit post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (post) => {
    setEditingPostId(post.id);
    setEditText(post.text);
  };

  const cancelEdit = () => {
    setEditingPostId(null);
    setEditText('');
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      await api.editPost(id, { text: editText });
      setEditingPostId(null);
      setEditText('');
      fetchPosts();
    } catch (e) {
      console.error(e);
    }
  };

  const deletePost = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await api.deletePost(id);
        fetchPosts();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const toggleLike = async (id) => {
    setPosts(prev => prev.map(p => 
      p.id === id 
        ? { ...p, userHasLiked: !p.userHasLiked, likes: p.userHasLiked ? p.likes - 1 : p.likes + 1 }
        : p
    ));

    try {
      await api.toggleLike(id);
    } catch (e) {
      console.error(e);
      fetchPosts(); 
    }
  };

  const handleToggleComments = async (postId) => {
    if (expandedCommentsPostId === postId) {
      setExpandedCommentsPostId(null);
      return;
    }
    setExpandedCommentsPostId(postId);
    try {
      const data = await api.getPostComments(postId);
      setComments(prev => ({ ...prev, [postId]: data.comments }));
    } catch (e) {
      console.error(e);
    }
  };

  const submitComment = async (postId) => {
    if (!newCommentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const data = await api.addPostComment(postId, newCommentText);
      if (data.success) {
        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data.comment]
        }));
        setNewCommentText('');
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="page-content-container" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0' }}>Agricultural Portal</h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '14px', margin: 0 }}>Community intelligence, advisories, and local marketplace.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowPostBox(!showPostBox)}>
          New Submission
        </button>
      </div>

      {/* New Post Panel */}
      {showPostBox && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>Submit Information</span>
            <button onClick={() => { setShowPostBox(false); setErrorMsg(''); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>

          {errorMsg && (
            <div style={{ color: 'var(--risk-critical)', fontSize: '13px', background: 'var(--risk-critical-bg)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(217,45,32,0.2)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-sub)', display: 'block', marginBottom: '8px' }}>Description *</label>
              <textarea
                className="input"
                style={{ height: '100px', minHeight: '100px' }}
                placeholder="Enter details of your advisory, question, or marketplace listing..."
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-sub)', display: 'block', marginBottom: '8px' }}>Category</label>
                <select
                  className="input"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-sub)', display: 'block', marginBottom: '8px' }}>Location (Optional)</label>
                <input
                  className="input"
                  placeholder="e.g. Pune District"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => { setShowPostBox(false); setErrorMsg(''); }} disabled={submitting}>Cancel</button>
              <button className="btn btn-primary" onClick={submitPost} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '24px' }}>
        {CATEGORIES.map(c => (
          <button 
            key={c} 
            onClick={() => setFilter(c)}
            style={{ 
              padding: '8px 16px', 
              borderRadius: '4px',
              border: filter === c ? '1px solid var(--primary)' : '1px solid var(--border)',
              background: filter === c ? 'var(--primary)' : 'var(--bg-card)', 
              color: filter === c ? '#fff' : 'var(--text-sub)', 
              fontWeight: 600, 
              fontSize: '13px', 
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'var(--transition)'
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Feed List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {loading ? (
          <LoadingSkeleton type="card" count={3} />
        ) : posts.length === 0 ? (
          <EmptyState title="No records found" description="There are no community posts matching the selected category." />
        ) : (
          posts.map(post => (
            <div key={post.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px' }}>
              
              {/* Post Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-base)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    {post.avatar || '👤'}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {post.user} 
                      {post.role === 'VET' && <span style={{ color: 'var(--primary)', fontSize: '10px', background: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', fontWeight: 700 }}>CERTIFIED VET</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '2px' }}>
                      {post.location} • {new Date(post.time).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {user && user.id === post.userId && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => startEdit(post)}>
                      <Edit size={16} />
                    </button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--risk-critical)' }} onClick={() => deletePost(post.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Post Body */}
              <div style={{ padding: '20px' }}>
                {editingPostId === post.id ? (
                  <div style={{ marginBottom: '16px' }}>
                    <textarea 
                      className="input"
                      style={{ minHeight: '80px' }} 
                      value={editText} 
                      onChange={e => setEditText(e.target.value)} 
                    />
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                      <button className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
                      <button className="btn btn-primary" onClick={() => saveEdit(post.id)}>Save Changes</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
                    {post.text}
                  </div>
                )}

                {/* Tags */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {post.tags?.map(t => (
                    <span key={t} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary-dark)', background: 'var(--primary-light)', border: '1px solid rgba(13,148,136,0.2)', padding: '4px 10px', borderRadius: '4px' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '24px', background: 'var(--bg-base)' }}>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: post.userHasLiked ? 'var(--primary)' : 'var(--text-sub)', fontWeight: 600 }}
                  onClick={() => toggleLike(post.id)}
                >
                  <ThumbsUp size={16} /> {post.likes} Useful
                </button>
                <button 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-sub)', fontWeight: 600 }}
                  onClick={() => handleToggleComments(post.id)}
                >
                  <MessageSquare size={16} /> {post.comments} Replies
                </button>
              </div>

              {/* Comments Section */}
              {expandedCommentsPostId === post.id && (
                <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                  
                  {/* Comments List */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {comments[post.id]?.length === 0 ? (
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No replies yet. Be the first to answer.</div>
                    ) : (
                      comments[post.id]?.map(c => (
                        <div key={c.id} style={{ display: 'flex', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                            👤
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                              {c.user} {c.role === 'VET' && <span style={{ color: 'var(--primary)', fontSize: '10px', marginLeft: '4px' }}>(Vet)</span>}
                              <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '8px', fontSize: '12px' }}>
                                {new Date(c.time).toLocaleDateString()}
                              </span>
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--text-sub)', marginTop: '4px', lineHeight: 1.5 }}>{c.text}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment */}
                  <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
                    <input 
                      className="input"
                      placeholder="Add a reply..." 
                      value={newCommentText}
                      onChange={e => setNewCommentText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && submitComment(post.id)}
                    />
                    <button className="btn btn-primary" onClick={() => submitComment(post.id)} disabled={!newCommentText.trim() || submittingComment}>
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
