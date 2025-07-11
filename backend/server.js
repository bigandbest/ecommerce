import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();


import authRoutes from './routes/authRoute.js';

const app = express();
const PORT = process.env.PORT || 5000;
/* const allowedOrigins = [
  'http://localhost:5173',
  'https://ecommerce-umber-five-95.vercel.app',
  'https://admin-eight-flax.vercel.app'
]; */

app.use(cors({
  /* origin: function (origin, callback) {
    // allow requests with no origin like mobile apps or curl
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  }, */
  origin: 'https://ecommerce-umber-five-95.vercel.app', // Temporarily allowing all origins for development
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/business', authRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
