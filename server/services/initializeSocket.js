const jwt = require('jsonwebtoken');
const db = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

const initializeSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);

    socket.join(socket.user.id);

    socket.on('join_conversation', async ({ conversationId }) => {
      try {
        const conversationDoc = await db.collection('Conversations').doc(conversationId).get();
        if (!conversationDoc.exists) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        const conversation = conversationDoc.data();
        if (!conversation.participants.includes(socket.user.id)) {
          socket.emit('error', { message: 'Not a participant' });
          return;
        }

        socket.join(conversationId);
        console.log(`User ${socket.user.id} joined conversation ${conversationId}`);
      } catch (error) {
        console.error('Join conversation error:', error.message);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    socket.on('send_message', async ({ conversationId, text }) => {
      try {
        const conversationDoc = await db.collection('Conversations').doc(conversationId).get();
        if (!conversationDoc.exists) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        const conversation = conversationDoc.data();
        if (!conversation.participants.includes(socket.user.id)) {
          socket.emit('error', { message: 'Not a participant' });
          return;
        }

        const messageId = uuidv4();
        const messageData = {
          messageId,
          senderId: socket.user.id,
          text,
          timestamp: new Date().toISOString()
        };

        await db.collection('Conversations').doc(conversationId).collection('Messages').doc(messageId).set(messageData);
        await db.collection('Conversations').doc(conversationId).update({
          lastMessage: text,
          updatedAt: new Date().toISOString()
        });

        io.to(conversationId).emit('receive_message', {
          conversationId,
          message: messageData
        });

        conversation.participants.forEach(participantId => {
          if (participantId !== socket.user.id) {
            io.to(participantId).emit('new_message_notification', {
              conversationId,
              message: messageData
            });
          }
        });

        console.log(`Message sent in conversation ${conversationId} by ${socket.user.id}`);
      } catch (error) {
        console.error('Send message error:', error.message);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });

  return io;
};

module.exports = initializeSocket;