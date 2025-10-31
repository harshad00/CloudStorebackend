
import Media from "../models/Media.js";
import MediaFile from "../models/MediaFile.js";
import fs from "fs";
import   s3 from "../config/s3Config.js";


export const uploadMedia = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const files = req.files;
    const userId = req.user.id; // from JWT middleware

    // 🟩 Check if this user already has this title (case-insensitive)
    const existingMedia = await Media.findOne({ 
      userId, 
      title 
    }).collation({ locale: 'en', strength: 2 });

    if (existingMedia) {
      return res.status(400).json({
        error: "You already have media with this title. Please use a different title.",
      });
    }

    // 🟨 Validate uploaded files
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // 🟦 Create new media entry
    const media = await Media.create({ userId, title, description, category });
    const uploadedFiles = [];

    // 🟪 Upload each file to S3
    for (const file of files) {
      const fileContent = fs.readFileSync(file.path);
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/${Date.now()}_${file.originalname}`,
        Body: fileContent,
        ContentType: file.mimetype,
      };

      const data = await s3.upload(params).promise();

      const mediaFile = await MediaFile.create({
        mediaId: media._id,
        url: data.Location,
        type: file.mimetype.startsWith("image") ? "image" : "video",
        size: file.size,
      });

      uploadedFiles.push(mediaFile);
      fs.unlinkSync(file.path);
    }

    res.status(200).json({
      message: "✅ Files uploaded successfully!",
      media,
      files: uploadedFiles,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

