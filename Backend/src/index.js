require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Sentry = require('@sentry/node');
const passport = require('./config/passport');

const authRoutes = require('./routes/auth');
const predictRoutes = require('./routes/predict');
const adminRoutes = require('./routes/admin');
const vetRoutes = require('./routes/vets');
const medicineRoutes = require('./routes/medicine');
const animalRoutes = require('./routes/animals');
const chatRoutes = require('./routes/chat');
const outbreakRoutes = require('./routes/outbreaks');
const farmRoutes = require('./routes/farm');
const communityRoutes = require('./routes/community');
const notificationRoutes = require('./routes/notifications');

const app = express();

// Initialize Sentry for crash reporting
Sentry.init({
  dsn: process.env.SENTRY_DSN || "https://dummy@o0.ingest.sentry.io/0",
  tracesSampleRate: 1.0,
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/auth', authRoutes);
app.use('/predict', predictRoutes);
app.use('/admin', adminRoutes);
app.use('/vets', vetRoutes);
app.use('/medicine', medicineRoutes);
app.use('/animals', animalRoutes);
app.use('/chat', chatRoutes);
app.use('/outbreaks', outbreakRoutes);
app.use('/farm', farmRoutes);
app.use('/community', communityRoutes);
app.use('/notifications', notificationRoutes);

// Protected Route Example
app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ message: 'You have accessed a protected route!', user: req.user });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 JSON Fallback Handler
app.use((req, res, next) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// The Sentry error handler must be before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

// Global Error Handler to return JSON instead of HTML
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
