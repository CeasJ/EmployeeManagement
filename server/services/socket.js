const { Server } = require('socket.io');
const  initializeSocket = require('./initializeSocket');

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Authorization', 'Content-Type']
    }
  });

  initializeSocket(io);
  return io;
};

module.exports = setupSocket;