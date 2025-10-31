import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { loginSuccess, sendTokenJSON } from "../controllers/AuthController.js";

const router = express.Router();

// Google login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Callback route
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/auth/failure" }),
  loginSuccess
);

// Optional JSON response route
router.get(
  "/google/callback/json",
  passport.authenticate("google", { session: false, failureRedirect: "/auth/failure" }),
  sendTokenJSON
);

// ✅ Check login status (for frontend)
router.get("/check", async (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.json({ user: null });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "JWT_SECRET");

    // ✅ Fetch full user details from DB using ID in token
    const dbUser = await User.findById(decoded.id);

    if (!dbUser) {
      return res.json({ user: null, message: "User not found" });
    }

    return res.json({ user: dbUser });
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.json({ user: null, message: "Invalid token" });
  }
});


// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
  });
  return res.json({ message: "Logged out successfully" });
});

// Failure
router.get("/failure", (req, res) => res.status(401).json({ message: "Auth failed" }));

export default router;
