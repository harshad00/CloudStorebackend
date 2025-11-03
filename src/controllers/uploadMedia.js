
import Media from "../models/Media.js";
import MediaFile from "../models/MediaFile.js";
import fs from "fs";
import s3 from "../config/s3Config.js";


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
        userId,
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

export const getMediaByTitle = async (req, res) => {
  try {
    const { title } = req.params;
    const userId = req.user.id;
    const media = await Media.findOne({
      userId,
      title
    }).collation({ locale: 'en', strength: 2 });

    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }
    res.status(200).json(media);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });

  }
};

export const getAllMediaByUserId = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all media for this user
    const mediaList = await Media.find({ userId });

    // Get all media IDs
    const mediaIds = mediaList.map((m) => m._id);

    // Get all files linked to these media
    const mediaFiles = await MediaFile.find({ mediaId: { $in: mediaIds } });

    // Combine media + files
    const combinedMedia = mediaList.map((media) => ({
      ...media.toObject(),
      files: mediaFiles.filter((file) => file.mediaId.toString() === media._id.toString()),
    }));

    res.status(200).json({
      success: true,
      count: combinedMedia.length,
      data: combinedMedia,
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}; 

export const deleteMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const userId = req.user.id;
    const media = await Media.findOneAndDelete({ _id: mediaId, userId });
    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }
    await MediaFile.deleteMany({ mediaId: media._id });
    res.status(200).json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { title, description, category } = req.body;
    const userId = req.user.id;
    const media = await Media.findOneAndUpdate(
      { _id: mediaId, userId },
      { title, description, category },
      { new: true }
    );

    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }
    res.status(200).json({ message: "Media updated successfully", media });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: error.message });
  }
};

export const addMediaFilesByMediaId = async (req, res) => {
  try {
    const { mediaId } = req.query;
    if (!mediaId) {
      return res.status(400).json({ error: "mediaId is required as query param" });
    }

    const files = req.files;
    const userId = req.user.id;

    // 🔍 Verify media belongs to this user
    const media = await Media.findOne({ _id: mediaId, userId });
    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadedFiles = [];

    for (const file of files) {
      // ✅ Stream upload instead of reading whole file in memory
      const fileStream = fs.createReadStream(file.path);

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/${Date.now()}_${file.originalname}`,
        Body: fileStream,
        ContentType: file.mimetype,
      };

      // Upload to S3
      const data = await s3.upload(params).promise();

      // Save file info to DB
      const mediaFile = await MediaFile.create({
        mediaId: media._id,
        url: data.Location,
        type: file.mimetype.startsWith("image") ? "image" : "video",
        size: file.size,
      });

      uploadedFiles.push(mediaFile);

      // Clean up temp file
      try {
        await fs.promises.unlink(file.path);
      } catch (err) {
        console.warn("⚠️ Failed to delete temp file:", file.path, err);
      }
    }

    res.status(200).json({
      message: "✅ Files added successfully!",
      files: uploadedFiles,
    });

  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ error: error.message });
  }
};