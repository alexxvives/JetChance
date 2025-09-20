# 📸 Image Storage Setup Guide

## 🏠 **Current Setup (Development)**

✅ **Already Working:**
- Images saved to `backend/uploads/aircraft/`
- Served at `http://localhost:4000/uploads/aircraft/`
- Perfect for development and testing

## 🚀 **Production Setup (Cloudflare R2)**

### **Step 1: Create Cloudflare R2 Bucket**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **R2 Object Storage**
2. Click **"Create bucket"**
3. Name: `chancefly-images`
4. Location: Choose closest to your users

### **Step 2: Get R2 API Credentials**
1. Go to **R2** → **Manage R2 API tokens**
2. Click **"Create API token"**
3. Permissions: **Object Read & Write**
4. Save the **Access Key ID** and **Secret Access Key**

### **Step 3: Configure Environment Variables**
In your production environment, set:
```bash
USE_CLOUDFLARE_R2=true
CLOUDFLARE_R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
CLOUDFLARE_R2_BUCKET_NAME=chancefly-images
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_here
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key_here
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

### **Step 4: Optional - Custom Domain**
1. In R2 bucket settings → **Settings** → **Custom Domains**
2. Add your domain: `images.yourdomain.com`
3. Update `CLOUDFLARE_R2_PUBLIC_URL=https://images.yourdomain.com`

## 🔄 **How the Switch Works**

### **Development Mode** (`USE_CLOUDFLARE_R2=false`):
```
Upload Image → Save to /uploads/aircraft/ → Return local URL
```

### **Production Mode** (`USE_CLOUDFLARE_R2=true`):
```
Upload Image → Upload to R2 → Return Cloudflare URL
```

## ✅ **Benefits of This Setup**

1. **🏠 Development**: Fast local storage, no cloud costs
2. **🚀 Production**: Cloudflare's global CDN, 99.9% uptime
3. **💰 Cost**: FREE for first 10GB + 10M requests/month
4. **🔄 Easy Switch**: Just change environment variables
5. **🛡️ Fallback**: If R2 fails, falls back to local storage

## 🎯 **When You Deploy**

Simply set `USE_CLOUDFLARE_R2=true` and add your R2 credentials - that's it! The same code automatically switches to cloud storage.

**Your images will then be served from Cloudflare's global CDN! 🌍**