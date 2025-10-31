import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to user
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
mediaSchema.index({ title: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

const Media = mongoose.model("Media", mediaSchema);
export default Media;
