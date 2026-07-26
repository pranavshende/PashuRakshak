const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const prisma = require('./db');

// Local Strategy for Login (Phone + Password)
passport.use(
  new LocalStrategy(
    { usernameField: 'phone', passwordField: 'password' },
    async (phone, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { phone } });
        if (!user) {
          return done(null, false, { message: 'User not found.' });
        }

        if (!user.password) {
          return done(null, false, { message: 'Account has no password set (did you sign up with OTP?)' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// JWT Strategy for protected routes
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SUPABASE_JWT_SECRET || 'super-secret-jwt-key',
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      // Support both Supabase ('sub') and Local ('id') JWT payloads
      const userId = jwtPayload.sub || jwtPayload.id;
      if (!userId) return done(null, false, { message: 'Invalid token payload' });

      let user = await prisma.user.findUnique({ where: { id: userId } });
      
      // Auto-create the user in Prisma if they authenticated via Supabase but don't exist here yet
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: userId,
            phone: jwtPayload.phone || '',
            name: jwtPayload.user_metadata?.name || 'Farmer',
          }
        });
      }
      
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  })
);

module.exports = passport;
