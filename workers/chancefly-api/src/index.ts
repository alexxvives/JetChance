/**
 * ChanceFly API - Cloudflare Workers Backend
 * Migrated from Node.js/Express to Cloudflare Workers with D1 Database
 */

import { corsHeaders, handleCors } from './middleware/cors';
import { authenticate } from './middleware/auth';
import { handleAuth } from './handlers/auth';
import { handleFlights } from './handlers/flights';
import { handleBookings } from './handlers/bookings';
import { handleUsers } from './handlers/users';
import { handleOperators } from './handlers/operators';
import { handlePayments } from './handlers/payments';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return handleCors(request);
		}

		try {
			const url = new URL(request.url);
			const path = url.pathname;
			
			// Health check endpoint
			if (path === '/health') {
				return new Response(JSON.stringify({
					status: 'OK',
					message: 'ChanceFly API is running',
					timestamp: new Date().toISOString(),
					environment: 'production',
				}), {
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders
					}
				});
			}

			// Route requests to appropriate handlers
			if (path.startsWith('/api/auth/')) {
				return handleAuth(request, env, path.replace('/api/auth', ''));
			}
			
			if (path.startsWith('/api/flights/')) {
				return handleFlights(request, env, path.replace('/api/flights', ''));
			}
			
			if (path.startsWith('/api/bookings/')) {
				const authResult = await authenticate(request, env);
				if (authResult.error) {
					return new Response(JSON.stringify({ error: authResult.error }), {
						status: 401,
						headers: { 'Content-Type': 'application/json', ...corsHeaders }
					});
				}
				return handleBookings(request, env, path.replace('/api/bookings', ''), authResult.user);
			}
			
			if (path.startsWith('/api/users/')) {
				const authResult = await authenticate(request, env);
				if (authResult.error) {
					return new Response(JSON.stringify({ error: authResult.error }), {
						status: 401,
						headers: { 'Content-Type': 'application/json', ...corsHeaders }
					});
				}
				return handleUsers(request, env, path.replace('/api/users', ''), authResult.user);
			}
			
			if (path.startsWith('/api/operators/')) {
				return handleOperators(request, env, path.replace('/api/operators', ''));
			}
			
			if (path.startsWith('/api/payments/')) {
				const authResult = await authenticate(request, env);
				if (authResult.error) {
					return new Response(JSON.stringify({ error: authResult.error }), {
						status: 401,
						headers: { 'Content-Type': 'application/json', ...corsHeaders }
					});
				}
				return handlePayments(request, env, path.replace('/api/payments', ''), authResult.user);
			}

			// 404 handler
			return new Response(JSON.stringify({
				error: 'Not Found',
				message: `Route ${path} not found`,
			}), {
				status: 404,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders
				}
			});

		} catch (error) {
			console.error('Worker error:', error);
			return new Response(JSON.stringify({
				error: 'Internal Server Error',
				message: 'An unexpected error occurred',
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders
				}
			});
		}
	},
} satisfies ExportedHandler<Env>;
