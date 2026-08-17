const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { requireAuth } = require('../middlewares/authMiddleware');

// Get all community posts
router.get('/', requireAuth, async (req, res) => {
  try {
    const { category } = req.query; // 'All', 'Alerts', 'Tips', etc.
    
    let whereClause = {};
    if (category && category !== 'All') {
      whereClause.tags = { has: category };
    }

    const posts = await prisma.communityPost.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, role: true } },
        likes: { select: { userId: true } },
        _count: { select: { comments: true, likes: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedPosts = posts.map(post => ({
      id: post.id,
      user: post.user.name,
      userId: post.user.id,
      role: post.user.role,
      location: post.location || 'Local Area',
      time: post.createdAt,
      text: post.text,
      tags: post.tags,
      likes: post._count.likes,
      comments: post._count.comments,
      userHasLiked: post.likes.some(like => like.userId === req.user.id),
      avatar: post.user.role === 'VET' ? '👨‍⚕️' : '👨‍🌾'
    }));

    res.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Fetch Posts Error:', error);
    res.status(500).json({ error: 'Failed to fetch community posts.' });
  }
});

// Create a new post
router.post('/', requireAuth, async (req, res) => {
  try {
    const { text, tags, location } = req.body;
    if (!text) return res.status(400).json({ error: 'Post text is required' });

    const newPost = await prisma.communityPost.create({
      data: {
        text,
        tags: tags || [],
        location,
        userId: req.user.id
      }
    });

    res.status(201).json({ success: true, post: newPost });
  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({ error: 'Failed to create post.' });
  }
});

// Toggle Like on a post
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingLike = await prisma.communityLike.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: id
        }
      }
    });

    if (existingLike) {
      await prisma.communityLike.delete({
        where: { id: existingLike.id }
      });
      return res.json({ liked: false });
    } else {
      await prisma.communityLike.create({
        data: { userId, postId: id }
      });
      return res.json({ liked: true });
    }
  } catch (error) {
    console.error('Like Post Error:', error);
    res.status(500).json({ error: 'Failed to toggle like.' });
  }
});

// Edit a post
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, tags } = req.body;

    const post = await prisma.communityPost.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized to edit this post' });

    const updated = await prisma.communityPost.update({
      where: { id },
      data: { text, ...(tags && { tags }) }
    });

    res.json({ success: true, post: updated });
  } catch (error) {
    console.error('Edit Post Error:', error);
    res.status(500).json({ error: 'Failed to edit post.' });
  }
});

// Delete a post
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.communityPost.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized to delete this post' });

    await prisma.communityPost.delete({ where: { id } });
    res.json({ success: true, message: 'Post deleted successfully.' });
  } catch (error) {
    console.error('Delete Post Error:', error);
    res.status(500).json({ error: 'Failed to delete post.' });
  }
});

// Get comments for a post
router.get('/:id/comments', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await prisma.communityComment.findMany({
      where: { postId: id },
      include: { user: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'asc' }
    });

    const formattedComments = comments.map(c => ({
      id: c.id,
      text: c.text,
      time: c.createdAt,
      user: c.user.name,
      role: c.user.role
    }));

    res.json({ comments: formattedComments });
  } catch (error) {
    console.error('Fetch Comments Error:', error);
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
});

// Add comment to a post
router.post('/:id/comments', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Comment text is required.' });

    const newComment = await prisma.communityComment.create({
      data: {
        text,
        postId: id,
        userId: req.user.id
      },
      include: { user: { select: { name: true, role: true } } }
    });

    res.json({
      success: true,
      comment: {
        id: newComment.id,
        text: newComment.text,
        time: newComment.createdAt,
        user: newComment.user.name,
        role: newComment.user.role
      }
    });
  } catch (error) {
    console.error('Add Comment Error:', error);
    res.status(500).json({ error: 'Failed to add comment.' });
  }
});

module.exports = router;
