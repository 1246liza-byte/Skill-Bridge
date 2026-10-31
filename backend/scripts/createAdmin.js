// Secure script to create the initial administrator account
// Usage: npm run create-admin
const mongoose = require('mongoose');
const colors = require('colors');
const config = require('../config');
const User = require('../models/User');

const createAdmin = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        console.log('MongoDB Connected'.cyan.underline);

        const { name, email, password } = config.admin;

        // Check if admin already exists
        const existing = await User.findOne({ email });
        if (existing) {
            console.log(`Admin with email ${email} already exists.`.yellow);
            process.exit(0);
        }

        const admin = await User.create({
            name,
            email,
            password,
            role: 'admin',
            status: 'active',
        });

        console.log(`Admin created successfully: ${admin.email}`.green.bold);
        console.log('Please change the password after first login.'.yellow);
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`.red);
        process.exit(1);
    }
};

createAdmin();