const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Environment-based storage configuration
const isProduction = process.env.NODE_ENV === 'production';
const useCloudflareR2 = process.env.USE_CLOUDFLARE_R2 === 'true';

// Local storage configuration
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/aircraft');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-randomid.ext
    const uniqueName = `aircraft-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Memory storage for R2 upload
const memoryStorage = multer.memoryStorage();

// File filter for both storage types
const fileFilter = (req, file, cb) => {
  // Allowed image types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];
  
  console.log('📁 File upload attempt:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log('✅ File type accepted:', file.mimetype);
    cb(null, true);
  } else {
    console.log('❌ File type rejected:', file.mimetype);
    cb(new Error(`File type not allowed. Supported formats: JPEG, PNG, GIF, WebP, SVG. Received: ${file.mimetype}`), false);
  }
};

// Configure multer based on environment
const upload = multer({ 
  storage: useCloudflareR2 ? memoryStorage : localStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Cloudflare R2 configuration (only load if needed)
let r2Client;
if (useCloudflareR2) {
  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
  const crypto = require('crypto');
  
  r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    },
  });
}

// @route   POST /api/upload/aircraft-image
// @desc    Upload aircraft image (local dev or Cloudflare R2 prod)
// @access  Private
router.post('/aircraft-image', authenticate, upload.single('aircraftImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let imageUrl;
    let storageType;

    if (useCloudflareR2 && r2Client) {
      // 🌐 PRODUCTION: Upload to Cloudflare R2
      try {
        const fileExtension = path.extname(req.file.originalname);
        const uniqueFilename = `aircraft-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${fileExtension}`;
        const bucketKey = `aircraft-images/${uniqueFilename}`;

        const uploadCommand = new (require('@aws-sdk/client-s3').PutObjectCommand)({
          Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
          Key: bucketKey,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        });

        await r2Client.send(uploadCommand);
        imageUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${bucketKey}`;
        storageType = 'Cloudflare R2';
        
        console.log(`✅ Image uploaded to Cloudflare R2: ${imageUrl}`);
      } catch (r2Error) {
        console.error('❌ Cloudflare R2 upload failed, falling back to local:', r2Error);
        // Fall back to local storage if R2 fails
        imageUrl = `/uploads/aircraft/${req.file.filename}`;
        storageType = 'Local (R2 fallback)';
      }
    } else {
      // 💻 DEVELOPMENT: Use local storage
      imageUrl = `/uploads/aircraft/${req.file.filename}`;
      storageType = 'Local Development';
      console.log(`✅ Image saved locally: http://localhost:4000${imageUrl}`);
    }

    res.json({
      message: `Image uploaded successfully using ${storageType}`,
      imageUrl: imageUrl,
      filename: req.file.filename,
      storageType: storageType
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload image',
      details: error.message 
    });
  }
});

module.exports = router;