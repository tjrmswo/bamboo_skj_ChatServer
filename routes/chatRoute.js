import express from 'express';
import {
  createChats,
  getChats,
  getUserChats,
} from '../controllers/chatController.js';

const router = express.Router();

// 모든 데이터 GET
router.get('/chat', getChats);
// 채팅 생성
router.post('/chat', createChats);
// 특정 유저 채팅 데이터 GET
router.get('/chat/:chat_user_id', getUserChats);

export default router;
