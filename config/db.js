import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.HOST,
  user: process.env.DB_USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
};

export default dbConfig;
