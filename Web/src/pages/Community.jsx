import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, ThumbsUp, Trash2, Edit, Save, X } from 'lucide-react';

const CATEGORIES = ['All', 'Alerts', 'Tips', 'Recovery', 'Events', 'Marketplace'];

export default function Community() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newTags, setNewTags] = useState('');
  const [showPostBox, setShowPostBox] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState('');
  
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
    if (!newPost.trim()) return;
    try {
      const tags = newTags.split(',').map(t => t.trim()).filter(Boolean);
      await api.createPost({ text: newPost, tags, location: 'Local Farm' });
      setNewPost('');
      setNewTags('');
      setShowPostBox(false);
      fetchPosts();
    } catch (e) {
      console.error(e);
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
    // Optimistic UI update
    setPosts(prev => prev.map(p => 
      p.id === id 
        ? { ...p, userHasLiked: !p.userHasLiked, likes: p.userHasLiked ? p.likes - 1 : p.likes + 1 }
        : p
    ));

    try {
      await api.toggleLike(id);
    } catch (e) {
      console.error(e);
      fetchPosts(); // Revert on failure
    }
  };

  // Comments handlers
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
        // Update comments count on main posts state
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="container animate-fade-in-fast" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Top Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>👥 Community Intelligence Feed</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Connect with farmers — share alerts, tips & recovery stories</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowPostBox(!showPostBox)}>
          ✏️ Post Update
        </button>
      </div>

      <div className="page-content-container">
        {/* New Post Box */}
        {showPostBox && (
          <div className="card mb-4 animate-fade-in" style={{ background: '#fff' }}>
            <textarea
              className="input"
              style={{ height: 100, marginBottom: 12 }}
              placeholder="Share a disease alert, tip, or recovery story with the community..."
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
            />
            <input
              className="input"
              style={{ marginBottom: 12 }}
              placeholder="Tags (comma separated, e.g. Alerts, FMD)"
              value={newTags}
              onChange={e => setNewTags(e.target.value)}
            />
            <div className="flex-end gap-3">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPostBox(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={submitPost}>Post</button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="tab-pills">
          {CATEGORIES.map(c => (
            <button key={c} className={`tab-pill${filter === c ? ' active' : ''}`} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>

        {/* Posts Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
              Loading feed...
            </div>
          ) : posts.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No community posts found for this category.
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="card animate-fade-in" style={{ background: '#fff' }}>
                {/* Header */}
                <div className="flex-between mb-3">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 20, background: 'linear-gradient(135deg, #16A34A, #0F766E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                      {post.avatar}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
                        {post.user} {post.role === 'VET' && <span style={{ color: '#3B82F6', fontSize: 11, background: '#EFF6FF', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>✔️ Vet</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: '2px' }}>
                        📍 {post.location} · {new Date(post.time).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions for Own Post */}
                  {user && user.id === post.userId && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-ghost btn-sm" style={{ padding: '0 8px', border: 'none' }} onClick={() => startEdit(post)}>
                        <Edit size={14} color="var(--text-muted)" />
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ padding: '0 8px', border: 'none' }} onClick={() => deletePost(post.id)}>
                        <Trash2 size={14} color="#EF4444" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Text Content */}
                {editingPostId === post.id ? (
                  <div style={{ marginBottom: '12px' }}>
                    <textarea 
                      className="input" 
                      style={{ height: '80px', marginBottom: '8px' }} 
                      value={editText} 
                      onChange={e => setEditText(e.target.value)} 
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" onClick={cancelEdit}><X size={12} /> Cancel</button>
                      <button className="btn btn-primary btn-sm" onClick={() => saveEdit(post.id)}><Save size={12} /> Save</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '14px', color: 'var(--text-sub)', lineHeight: 1.6, marginBottom: 12 }}>
                    {post.text}
                  </div>
                )}

                {/* Tags */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                  {post.tags?.map(t => (
                    <span key={t} className="badge badge-primary">#{t}</span>
                  ))}
                </div>

                {/* Engagement Actions */}
                <div style={{ display: 'flex', gap: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: post.userHasLiked ? '#EF4444' : 'var(--text-muted)', fontWeight: 600 }}
                    onClick={() => toggleLike(post.id)}
                  >
                    <ThumbsUp size={14} /> {post.likes} Likes
                  </button>
                  <button 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}
                    onClick={() => handleToggleComments(post.id)}
                  >
                    <MessageSquare size={14} /> {post.comments} Comments
                  </button>
                </div>

                {/* Comments Accordion */}
                {expandedCommentsPostId === post.id && (
                  <div style={{ marginTop: '16px', background: '#F8FAFC', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fade-in">
                    <h5 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>Comments ({post.comments})</h5>
                    
                    {/* Add Comment */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        className="input" 
                        placeholder="Add a public comment..." 
                        style={{ height: '36px', fontSize: '13px' }} 
                        value={newCommentText}
                        onChange={e => setNewCommentText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && submitComment(post.id)}
                      />
                      <button className="btn btn-primary btn-sm" style={{ height: '36px' }} onClick={() => submitComment(post.id)} disabled={!newCommentText.trim() || submittingComment}>
                        Comment
                      </button>
                    </div>

                    {/* Comments List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                      {comments[post.id]?.length === 0 ? (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No comments yet.</div>
                      ) : (
                        comments[post.id]?.map(c => (
                          <div key={c.id} style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #ECEFF1', paddingBottom: '8px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#B0BEC5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                              👤
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                                {c.user} {c.role === 'VET' && <span style={{ color: '#3B82F6', fontSize: '9px' }}>Vet</span>}
                                <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '8px', fontSize: '10px' }}>
                                  {new Date(c.time).toLocaleDateString()}
                                </span>
                              </div>
                              <div style={{ fontSize: '13px', color: 'var(--text-sub)', marginTop: '2px' }}>{c.text}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
