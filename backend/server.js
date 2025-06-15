
// Top-level await requires ESM modules
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import bodyparser from 'body-parser';
import cors from 'cors';
import AuthRouter from './routes/AuthRouter.js';
import UserRouter from './routes/UserRouter.js';
import TweetRouter from './routes/TweetRouter.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
// Make sure to configure the path correctly
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('MONGO_URI from env:', process.env.MONGO_URI ? 'Exists' : 'Missing');
console.log('JWT_SECRET from env:', process.env.JWT_SECRET ? 'Exists' : 'Missing');

// Connect to MongoDB
try {
  await connectDB();
  console.log('MongoDB connected successfully');
} catch (error) {
  console.error('MongoDB connection error:', error);
}

const app = express();

// Middleware
app.use(bodyparser.json());
app.use(cors());

// Routes
app.use('/auth', AuthRouter);
app.use('/users', UserRouter);
app.use('/tweets', TweetRouter);

// Test route
app.get('/hello', (req, res) => {
    res.send('Hello, world!');
});


const PORT = process.env.PORT || 8080;
// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
