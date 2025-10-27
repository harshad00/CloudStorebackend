import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import User from "./models/User.js";


dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// ✅ CORS (important if frontend is separate)
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // your frontend URL
    credentials: true, // allow cookies
  })
);



// Auth routes
app.use("/auth", authRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

export { app };
