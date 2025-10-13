# Image Storage Strategy for Cloudflare Deployment

## Problem
- Frontend images in `/public/images/` → ✅ Will work (served by Pages)
- Backend uploaded images in `/backend/uploads/` → ❌ Won't work (not in Workers)

## Solutions

### Option 1: Cloudflare R2 (Recommended) 🌟
**Best for production, free up to 10GB**

```bash
# Create R2 bucket
wrangler r2 bucket create jetchance-uploads

# Add to wrangler.jsonc
{
  "r2_buckets": [
    {
      "binding": "UPLOADS",
      "bucket_name": "jetchance-uploads"
    }
  ]
}
```

**Code changes needed:**
- Update upload endpoint to save to R2 instead of filesystem
- Images URL: `https://pub-xxxxx.r2.dev/aircraft/filename.jpg`

### Option 2: Cloudflare Images (Easiest) 💰
**Paid service but very easy: $5/month for 100k images**

```typescript
// Upload to Cloudflare Images
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch(
  'https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v1',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`
    },
    body: formData
  }
);

// Returns: https://imagedelivery.net/{account_hash}/{image_id}/public
```

### Option 3: External CDN (Imgur, ImgBB)
**Free but less control**

### Option 4: Keep Using External URLs Only
**Simplest - operators paste image URLs from their own hosting**

## Current Frontend Images
These are in `/public/images/` and WILL work on Cloudflare Pages:
- ✅ Logo
- ✅ Hero images
- ✅ Static assets

## Recommendation for MVP

**Use Cloudflare R2** because:
1. Free for your scale (10GB free, $0.015/GB after)
2. Fast global delivery
3. Direct integration with Workers
4. No external dependencies

Would you like me to:
1. Set up R2 integration for image uploads?
2. Update the upload endpoint to use R2?
3. Create migration script to move existing images to R2?
