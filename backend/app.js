const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const clientRoutes = require('./routes/clientRoutes');
const projectRoutes = require('./routes/projectRoutes');
const proposalRoutes = require('./routes/proposalRoutes');
const hiringOfferRoutes = require('./routes/hiringOfferRoutes');
const hireRoutes = require('./routes/hireRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const skillRoutes = require('./routes/skillRoutes');
const adminRoutes = require('./routes/adminRoutes');
const siteSettingsRoutes = require('./routes/siteSettingsRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const contactRoutes = require('./routes/contactRoutes');
const reportRoutes = require('./routes/reportRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Security middleware
app.use(helmet());
app.use(
    cors({
        origin: config.clientUrl,
        credentials: true,
    })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
// 1000 requests / 15 min is generous for normal browsing (each page view
// fires a handful of API calls) while still blocking brute-force abuse.
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes',
    },
});
app.use('/api', limiter);

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/hiring-offers', hiringOfferRoutes);
app.use('/api/hires', hireRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Skills Bridge API is running' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;