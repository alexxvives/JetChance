/**
 * CORS middleware for Cloudflare Workers
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

export function handleCors(request: Request): Response {
  // Handle CORS preflight request
  if (request.method === 'OPTIONS') {
    // Get the origin from request headers
    const origin = request.headers.get('Origin');
    const allowedOrigins = [
      'http://localhost:8000',
      'http://localhost:8001',
      'https://chancefly.alexxvives.workers.dev'
    ];

    const responseHeaders = { ...corsHeaders };
    
    // Set specific origin if it's in allowed list, otherwise use wildcard
    if (origin && allowedOrigins.includes(origin)) {
      responseHeaders['Access-Control-Allow-Origin'] = origin;
    }

    return new Response(null, {
      status: 204,
      headers: responseHeaders,
    });
  }

  throw new Error('Not a CORS preflight request');
}

export function addCorsHeaders(response: Response, origin?: string): Response {
  const headers = new Headers(response.headers);
  
  // Add CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  // Set specific origin if provided
  if (origin) {
    const allowedOrigins = [
      'http://localhost:8000',
      'http://localhost:8001', 
      'https://chancefly.alexxvives.workers.dev'
    ];
    
    if (allowedOrigins.includes(origin)) {
      headers.set('Access-Control-Allow-Origin', origin);
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}