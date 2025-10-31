import { signToken } from "../utils/jwt.js";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

export const loginSuccess = async (req, res) => {
  if (!req.user) return res.status(400).json({ message: "No user found" });

  // Make sure user still exists in DB (edge case)
  const dbUser = await User.findById(req.user._id);
  if (!dbUser) return res.status(404).json({ message: "User not found in DB" });

  const payload = {
    id: dbUser._id,
     name: dbUser.name, 
    email: dbUser.email,
    img: dbUser.img,
  };

  const token = signToken(payload); 
  console.log(token);
  

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60, // 1 hour
  };

  res.cookie("token", token, cookieOptions);
  return res.redirect(`${process.env.FRONTEND_URL}`);
};


export const sendTokenJSON = async (req, res) => {
  if (!req.user) return res.status(400).json({ message: "No user found" });

  const dbUser = await User.findById(req.user._id);
  if (!dbUser) return res.status(404).json({ message: "User not found in DB" });

  const payload = {
    id: dbUser._id,
    email: dbUser.email,
    img: dbUser.img,
  };

  const token = signToken(payload);
  return res.json({ token, user: dbUser });
};

export const protect =  async(req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // store user info
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};