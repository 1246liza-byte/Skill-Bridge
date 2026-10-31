const dotenv = require('dotenv');

dotenv.config();

const config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillsbridge',
    jwtSecret: process.env.JWT_SECRET || 'skillsbridge_dev_secret_change_me',
    jwtExpire: process.env.JWT_EXPIRE || '30d',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    email: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        from: process.env.EMAIL_FROM,
    },
    admin: {
        name: process.env.ADMIN_NAME || 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@skillsbridge.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@12345',
    },
};

module.exports = config;