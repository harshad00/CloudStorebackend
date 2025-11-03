import express from "express";
import multer from "multer";
import {
  uploadMedia,
  addMediaFilesByMediaId,
  getAllMediaByUserId

} from "../controllers/uploadMedia.js";
import {authMiddleware as protect} from "../middleware/authMiddleware.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    console.log("📂 File:", file.originalname);
    console.log("➡️ MIME:", file.mimetype);

    // Allow any image/* or video/* MIME types
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image or video files are allowed!"));
    }
  },
});


// ✅ protect route with middleware
router.post("/upload", protect, upload.array("files", 10), uploadMedia);
router.post('/addMediaFilesByMediaId', protect, upload.array("files", 10), addMediaFilesByMediaId);
router.get('/getAllMedia', protect, getAllMediaByUserId);

export default router;
