import { Server } from 'socket.io';
import { createServer } from 'http';

let io;

export const startSocketServer = (app) => {
  const httpServer = createServer(app);

  io = new Server(httpServer, {
    path: '/api/socket/io',
    addTrailingSlash: false,
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('sendMessage', (message) => {
      socket.broadcast.emit('message', message);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return httpServer;
};

export const getSocketInstance = () => {
  return io;
};
