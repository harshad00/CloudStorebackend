import express from "express";
import multer from "multer";
import fs from "fs";
import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

// Multer setup for temporary local storage
const upload = multer({ dest: "uploads/" });

// Test route for upload
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    const fileContent = fs.readFileSync(file.path);

    // S3 upload params
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `test/${file.originalname}`, // Folder: test/
      Body: fileContent,
      ContentType: file.mimetype,
    };

    // Upload file
    const data = await s3.upload(params).promise();

    // Delete local temp file
    fs.unlinkSync(file.path);

    res.json({
      message: "✅ File uploaded successfully!",
      fileUrl: data.Location,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
