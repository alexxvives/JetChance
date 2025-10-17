/**
 * Operators handler for Cloudflare Workers
 */

import { corsHeaders } from '../middleware/cors';

export async function handleOperators(request: Request, env: Env, path: string): Promise<Response> {
  return new Response(JSON.stringify({
    message: 'Operators API - Coming soon'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}
