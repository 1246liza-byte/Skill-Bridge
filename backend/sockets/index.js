const { Server } = require('socket.io');
const config = require('../config');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: config.clientUrl,
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Join a room based on user id for private notifications
        socket.on('join', (userId) => {
            if (userId) {
                socket.join(`user_${userId}`);
                console.log(`User ${userId} joined room user_${userId}`);
            }
        });

        // Join a conversation room for real-time messaging
        socket.on('join-conversation', (conversationId) => {
            if (conversationId) {
                socket.join(`conversation_${conversationId}`);
            }
        });

        socket.on('leave-conversation', (conversationId) => {
            if (conversationId) {
                socket.leave(`conversation_${conversationId}`);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = { initSocket, getIO };