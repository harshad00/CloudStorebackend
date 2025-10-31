import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Dummy user (replace with your real user data if needed)
const user = {
  _id: "671f9bb013e3d413dbd83c91",
  name: "Test User",
  email: "testuser@example.com",
};

// Generate JWT
const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "7d" });

console.log("✅ JWT token generated successfully:\n");
console.log(token);
