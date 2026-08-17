import { API_BASE_URL } from '../config/api';

const getHeaders = () => {
  const token = localStorage.getItem('userToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth & Profile
  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to get user profile');
    return res.json();
  },
  updateProfile: async (profileData) => {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update profile');
    }
    return res.json();
  },

  // Animals (Digital Twin & IoT)
  getAnimals: async () => {
    const res = await fetch(`${API_BASE_URL}/animals`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch animals');
    return res.json();
  },
  getAnimalDetail: async (id) => {
    const res = await fetch(`${API_BASE_URL}/animals/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch animal details');
    return res.json();
  },
  createAnimal: async (animalData) => {
    const res = await fetch(`${API_BASE_URL}/animals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(animalData)
    });
    if (!res.ok) throw new Error('Failed to register animal');
    return res.json();
  },

  // Chat
  getChatHistory: async () => {
    const res = await fetch(`${API_BASE_URL}/chat/history`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load chat history');
    return res.json();
  },
  sendChatMessage: async (message) => {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message })
    });
    if (!res.ok) throw new Error('Failed to send chat message');
    return res.json();
  },

  // Heatmap Outbreaks
  getOutbreaks: async (days = 30, disease = 'All') => {
    const res = await fetch(`${API_BASE_URL}/outbreaks/historical?days=${days}&disease=${disease}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch outbreak reports');
    return res.json();
  },
  getOutbreakPredictions: async () => {
    const res = await fetch(`${API_BASE_URL}/outbreaks/predict`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch predictions');
    return res.json();
  },

  // Community Feed
  getCommunityPosts: async (category = 'All') => {
    const res = await fetch(`${API_BASE_URL}/community?category=${category}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch community feed');
    return res.json();
  },
  createPost: async (postData) => {
    const res = await fetch(`${API_BASE_URL}/community`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(postData)
    });
    if (!res.ok) throw new Error('Failed to submit post');
    return res.json();
  },
  editPost: async (id, postData) => {
    const res = await fetch(`${API_BASE_URL}/community/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(postData)
    });
    if (!res.ok) throw new Error('Failed to edit post');
    return res.json();
  },
  deletePost: async (id) => {
    const res = await fetch(`${API_BASE_URL}/community/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete post');
    return res.json();
  },
  toggleLike: async (postId) => {
    const res = await fetch(`${API_BASE_URL}/community/${postId}/like`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to toggle like');
    return res.json();
  },
  getPostComments: async (postId) => {
    const res = await fetch(`${API_BASE_URL}/community/${postId}/comments`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch comments');
    return res.json();
  },
  addPostComment: async (postId, commentText) => {
    const res = await fetch(`${API_BASE_URL}/community/${postId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text: commentText })
    });
    if (!res.ok) throw new Error('Failed to submit comment');
    return res.json();
  },

  // Farm Score & News
  getFarmScore: async () => {
    const res = await fetch(`${API_BASE_URL}/farm/score`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load farm score');
    return res.json();
  },
  getFarmNews: async () => {
    const res = await fetch(`${API_BASE_URL}/farm/news`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load live farm news');
    return res.json();
  }
};
