import { startSocketServer } from '../socket/io.js';
import express from 'express';
import chat from '../models/chatModel.js';

// socket 설정
const app = express();
const httpServer = startSocketServer(app);

// 채팅 데이터 POST
const createChats = async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { chat_content, chat_user_id, receiverID } = req.body;
      const senderID = chat_user_id;

      // 친구 관계 확인
      const areWeFriends = await chat.checkFriend({
        chat_user_id,
        receiverID,
      });

      if (areWeFriends.length > 0) {
        // 채팅 메시지 생성
        const createChat = await chat.createChat({
          chat_content,
          chat_user_id,
          senderID,
          receiverID,
        });

        // 생성된 채팅 메시지 가져오기
        const { insertId } = createChat;
        const getChat = await chat.getGeneratedChatMessages({ insertId });

        if (createChat.affectedRows > 0) {
          // 소켓으로 메시지 전송
          httpServer.emit('message', getChat);
          res.status(201).json(getChat);
        } else {
          res.status(404).json({ message: 'Invalid Chat Data!' });
        }
      } else {
        res.status(404).json({ message: 'Not Found Friend Info!' });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 모든 chat data GET
const getChats = async (req, res) => {
  try {
    if (req.method === 'GET') {
      // 채팅 데이터 가져오기
      const row = await chat.getAllChatData();
      const userRow = await chat.getAllUserData();

      // 사용자의 닉네임을 추가
      const inputUserId = row.map((d) => {
        const addUserId = userRow.find((u) => u.user_index === d.chat_user_id);

        return {
          ...d,
          chat_user_nickname: addUserId ? addUserId.user_nickname : null,
        };
      });

      if (row.length > 0) {
        res.status(200).json(inputUserId);
      } else {
        res.status(404).json({ message: 'Not Found Chat Data!' });
      }
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 특정 유저 채팅 GET
const getUserChats = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { chat_user_id } = req.params;

      if (!chat_user_id) {
        return res
          .status(400)
          .json({ success: false, message: 'Missing chat_user_id' });
      }

      const userID = chat_user_id;
      const chatUserId = parseInt(chat_user_id, 10);

      // 해당 사용자 ID로 채팅 내역 가져오기
      const myChat = await chat.getChatHistoryByThatID({ userID });

      // 사용자 목록 가져오기
      const userRow = await chat.getAllUserData();

      // 사용자 ID와 매칭하여 데이터 처리
      const inputUserId = myChat.map((d) => {
        const compare = [d.senderID, d.receiverID];

        // 상대방 ID 찾기
        const friendUserId = compare.find((v) => chatUserId !== v);
        const userId = compare.find((v) => chatUserId === v);

        // 상대방 ID에 해당하는 사용자 정보 찾기
        const matchingUser = userRow.find((u) => u.user_index === friendUserId);
        // 내 ID 정보 찾기
        const matchMyId = userRow.find((u) => u.user_index === userId);

        return {
          ...d,
          user_id: matchMyId?.user_id,
          chat_user_nickname: matchingUser ? matchingUser.user_nickname : null,
          university: matchingUser?.university,
        };
      });

      if (myChat.length > 0) {
        res.status(200).json(inputUserId);
      } else {
        res.status(404).json({ success: false, message: 'Chat not found' });
      }
    } else {
      res.setHeader('Allow', ['GET']);
      res
        .status(405)
        .json({ success: false, message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export { createChats, getChats, getUserChats };
