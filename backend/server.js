const http = require('http');
const colors = require('colors');
const app = require('./app');
const config = require('./config');
const connectDB = require('./config/db');
const { initSocket } = require('./sockets');

// Connect to database
connectDB();

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

server.listen(config.port, () => {
    console.log(
        `Skills Bridge API running in ${config.nodeEnv} mode on port ${config.port}`.yellow.bold
    );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    server.close(() => process.exit(1));
});