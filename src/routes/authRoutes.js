import express from "express";
import passport from "passport";
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

router.get("/failure", (req, res) => res.status(401).json({ message: "Auth failed" }));

export default router;
