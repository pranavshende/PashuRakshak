const passport = require('passport');

/**
 * Middleware to verify JWT and attach user to req.user.
 * Rejects requests if no valid JWT is provided.
 */
const requireAuth = passport.authenticate('jwt', { session: false });

module.exports = {
  requireAuth,
};
