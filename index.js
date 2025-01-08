import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import chatRoute from './routes/chatRoute.js';
import { Server } from 'socket.io';

dotenv.config();

const app = express();

// CORS 및 미들웨어 설정
app.use(
  cors({
    origin: [
      process.env.DEPLOY_ADDRESS,
      process.env.LOCAL_ADDRESS,
      process.env.BE_DEPLOY_ADDRESS,
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan('common'));

// Socket.IO 서버 설정
const server = app.listen(process.env.PORT, () => {
  console.log(`Server running on port: http://localhost:${process.env.PORT}`);
});

const io = new Server(server, {
  path: '/api/socket/io',
});

// Socket.IO 이벤트 핸들러
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// 기본 경로 확인
app.get('/', (req, res) => {
  res.send(`Server is running on port:${process.env.PORT}`);
});

// 라우터 설정
app.use('/api', chatRoute);
