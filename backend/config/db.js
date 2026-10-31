const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.mongoUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.error(`Error: ${error.message}`.red.underline.bold);
        process.exit(1);
    }
};

module.exports = connectDB;