/**
 * Payments handler for Cloudflare Workers
 */

import { corsHeaders } from '../middleware/cors';
import { AuthUser } from '../middleware/auth';

export async function handlePayments(request: Request, env: Env, path: string, user: AuthUser): Promise<Response> {
  return new Response(JSON.stringify({
    message: 'Payments API - Coming soon',
    user: user.email
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}
