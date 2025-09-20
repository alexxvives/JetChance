const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { authenticate } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// Configure Cloudflare R2 (S3-compatible)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT, // e.g., https://abc123.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

// Configure multer for memory storage (we'll upload directly to R2)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @route   POST /api/upload/aircraft-image
// @desc    Upload aircraft image to Cloudflare R2
// @access  Private
router.post('/aircraft-image', authenticate, upload.single('aircraftImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate unique filename
    const fileExtension = req.file.originalname.split('.').pop();
    const uniqueFilename = `aircraft-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${fileExtension}`;
    const bucketKey = `aircraft-images/${uniqueFilename}`;

    // Upload to Cloudflare R2
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME, // e.g., 'chancefly-images'
      Key: bucketKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      // Make publicly accessible
      ACL: 'public-read', // Note: R2 handles this differently, see below
    });

    await r2Client.send(uploadCommand);

    // Construct public URL
    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${bucketKey}`;
    
    res.json({
      message: 'Image uploaded successfully to Cloudflare R2',
      imageUrl: publicUrl,
      filename: uniqueFilename
    });
  } catch (error) {
    console.error('Cloudflare R2 upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload image to Cloudflare R2',
      details: error.message 
    });
  }
});

// Fallback route for local development (if R2 not configured)
router.post('/aircraft-image-local', authenticate, upload.single('aircraftImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // For local development, we could save to local filesystem
    // or return a placeholder URL
    const placeholderUrl = `http://localhost:4000/api/placeholder-image/${req.file.originalname}`;
    
    res.json({
      message: 'Using local development placeholder',
      imageUrl: placeholderUrl,
      filename: req.file.originalname
    });
  } catch (error) {
    console.error('Local upload error:', error);
    res.status(500).json({ error: 'Failed to process image locally' });
  }
});

module.exports = router;