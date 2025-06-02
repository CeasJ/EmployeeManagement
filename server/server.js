require('dotenv').config();
  const express = require('express');
  const cors = require('cors');
  const http = require('http');
  const { Server } = require('socket.io');
  const authRoutes = require('./routes/auth');
  const employeeRoutes = require('./routes/employee');
  const messageRoutes = require('./routes/message');
  const userRoutes = require('./routes/user');
  const taskRoutes = require('./routes/task');
  const setupSocket = require('./services/socket');

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Authorization', 'Content-Type']
    }
  });
  
  app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true
  }));
  app.use(express.json());
  app.use(express.static('public'));
  
  app.use('/api/auth', authRoutes);
  app.use('/api/employee', employeeRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/task', taskRoutes);
  
  setupSocket(server);

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });