import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    image: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
