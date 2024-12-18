import dbConfig from '../config/db.js';
import mysql from 'mysql2/promise';

// MySQL 연결 풀 생성
const connection = mysql.createPool(dbConfig);

const chat = {
  checkFriend: async ({ chat_user_id, receiverID }) => {
    const [areWeFriends] = await connection.execute(
      'SELECT * FROM friend WHERE (userID = ? AND friendUserID = ? AND status = 1) OR (userID = ? AND friendUserID = ? AND status = 1)',
      [chat_user_id, receiverID, receiverID, chat_user_id]
    );
    return areWeFriends;
  },
  createChat: async (newChat) => {
    const { chat_content, chat_user_id, senderID, receiverID } = newChat;

    const [result] = await connection.execute(
      'INSERT INTO chat (chat_user_id, chat_content, senderID, receiverID, createAt) VALUES (?, ?, ?, ?, NOW() + INTERVAL 9 HOUR)',
      [chat_user_id, chat_content, senderID, receiverID]
    );
    return result;
  },

  getGeneratedChatMessages: async ({ insertId }) => {
    const [getChat] = await connection.execute(
      'SELECT * FROM chat WHERE chat_id = ?',
      [insertId]
    );
    return getChat;
  },

  getAllChatData: async () => {
    const [rows] = await connection.execute('SELECT * FROM chat');
    return rows;
  },

  getAllUserData: async () => {
    const [userRow] = await connection.query('SELECT * FROM user');
    return userRow;
  },

  getChatHistoryByThatID: async ({ userID }) => {
    const [myChat] = await connection.execute(
      'SELECT * FROM chat WHERE senderID = ? OR receiverID = ?',
      [userID, userID]
    );

    return myChat;
  },
};

export default chat;
