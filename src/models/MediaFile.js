import mongoose from "mongoose";

const mediaFileSchema = new mongoose.Schema({
  mediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Media", // Link to media
    required: true,
  },
  userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to user
      required: true,
    },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["image", "video"],
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  thumbnail: {
    type: String, // Optional — URL for preview
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const MediaFile = mongoose.model("MediaFile", mediaFileSchema);
export default MediaFile;
