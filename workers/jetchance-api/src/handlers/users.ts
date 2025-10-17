/**
 * Users handler for Cloudflare Workers
 */

import { corsHeaders } from '../middleware/cors';
import { AuthUser } from '../middleware/auth';

export async function handleUsers(request: Request, env: Env, path: string, user: AuthUser): Promise<Response> {
  return new Response(JSON.stringify({
    message: 'Users API - Coming soon',
    user: user.email
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}
