const passport = require('passport');

/**
 * Middleware to verify JWT and attach user to req.user.
 * Rejects requests if no valid JWT is provided.
 */
const requireAuth = passport.authenticate('jwt', { session: false });

/**
 * Middleware to enforce Admin role
 */
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    return next();
  }
  return res.status(403).json({ error: 'Access denied. Admin role required.' });
};

module.exports = {
  requireAuth,
  requireAdmin,
};
