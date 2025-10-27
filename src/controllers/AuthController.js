import { signToken }  from "../utils/jwt.js";

import User from "../models/User.js";

export const loginSuccess = async (req, res) => {
  if (!req.user) return res.status(400).json({ message: "No user found" });

  // Make sure user still exists in DB (edge case)
  const dbUser = await User.findById(req.user._id);
  if (!dbUser) return res.status(404).json({ message: "User not found in DB" });

  const payload = {
    id: dbUser._id,
    email: dbUser.email,
    role: dbUser.role,
  };

  const token = signToken(payload);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60, // 1 hour
  };

  res.cookie("token", token, cookieOptions);
  return res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
};


export const sendTokenJSON = async (req, res) => {
  if (!req.user) return res.status(400).json({ message: "No user found" });

  const dbUser = await User.findById(req.user._id);
  if (!dbUser) return res.status(404).json({ message: "User not found in DB" });

  const payload = {
    id: dbUser._id,
    email: dbUser.email,
    role: dbUser.role,
  };

  const token = signToken(payload);
  return res.json({ token, user: dbUser });
};