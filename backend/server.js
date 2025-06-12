
// Top-level await requires ESM modules
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import bodyparser from 'body-parser';
import cors from 'cors';
import AuthRouter from './routes/AuthRouter.js';


dotenv.config();

// Connect to MongoDB
await connectDB();

const app = express();

// Middleware
app.use(bodyparser.json());
app.use(cors());

// Routes
app.use('/auth', AuthRouter);

// Test route
app.get('/hello', (req, res) => {
    res.send('Hello, world!');
});


const PORT = process.env.PORT || 8080;
// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
