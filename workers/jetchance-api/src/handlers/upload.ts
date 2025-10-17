/**
 * Upload Handler
 * Handles file uploads to Cloudflare R2 storage
 */

import { corsHeaders } from '../middleware/cors';

export async function handleUpload(
  request: Request,
  env: Env,
  path: string,
  user?: any
): Promise<Response> {
  try {
    // POST /api/upload/aircraft-image - Upload aircraft image to R2
    if (request.method === 'POST' && path === '/aircraft-image') {
      // Require authentication
      if (!user) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Only operators can upload aircraft images
      if (user.role !== 'operator' && user.role !== 'admin' && user.role !== 'super-admin') {
        return new Response(JSON.stringify({ error: 'Only operators can upload aircraft images' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const formData = await request.formData();
      const file = formData.get('image');

      if (!file || !(file instanceof File)) {
        return new Response(JSON.stringify({ error: 'No image file provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        return new Response(JSON.stringify({
          error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return new Response(JSON.stringify({
          error: 'File too large. Maximum size is 5MB.'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000000000);
      const extension = file.name.split('.').pop() || 'jpg';
      const filename = `aircraft-${timestamp}-${random}.${extension}`;
      const key = `aircraft/${filename}`;

      // Upload to R2
      const arrayBuffer = await file.arrayBuffer();
      await env.AIRCRAFT_IMAGES.put(key, arrayBuffer, {
        httpMetadata: {
          contentType: file.type,
        },
      });

      // Generate public URL
      // In production, this would be the R2 public URL or CDN URL
      const imageUrl = `https://pub-ac9d99c78bee497299d7d2e44ec95be5.r2.dev/${key}`;

      return new Response(JSON.stringify({
        success: true,
        imageUrl,
        filename,
        key
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Upload handler error:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}
