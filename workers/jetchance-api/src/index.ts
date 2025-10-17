/**
 * JetChance API - Cloudflare Workers Backend
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
import { handleAirports } from './handlers/airports';
import { handleNotifications } from './handlers/notifications';
import { handleQuotes } from './handlers/quotes';
import { handleUpload } from './handlers/upload';
import { handleEmail } from './handlers/email';
import { handleProfile } from './handlers/profile';
import { handleAdmin } from './handlers/admin';

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
					message: 'JetChance API is running',
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
			
			if (path.startsWith('/api/flights')) {
				const flightsPath = path.replace('/api/flights', '').replace(/^\/$/, '');
				return handleFlights(request, env, flightsPath);
			}
			
			if (path.startsWith('/api/bookings')) {
				const authResult = await authenticate(request, env);
				if (authResult.error) {
					return new Response(JSON.stringify({ error: authResult.error }), {
						status: 401,
						headers: { 'Content-Type': 'application/json', ...corsHeaders }
					});
				}
				// Normalize path: /api/bookings or /api/bookings/ should both result in empty string
				const bookingsPath = path.replace('/api/bookings', '').replace(/^\/$/, '');
				return handleBookings(request, env, bookingsPath, authResult.user);
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

			if (path.startsWith('/api/airports')) {
				// Admin routes require authentication
				if (path.startsWith('/api/airports/admin/')) {
					const authResult = await authenticate(request, env);
					if (authResult.error) {
						return new Response(JSON.stringify({ error: authResult.error }), {
							status: 401,
							headers: { 'Content-Type': 'application/json', ...corsHeaders }
						});
					}
					return handleAirports(request, env, path.replace('/api/airports', ''), authResult.user);
				}
				// Public routes (GET approved airports, POST new airport)
				// Normalize path: /api/airports or /api/airports/ should both result in empty string
				const airportsPath = path.replace('/api/airports', '').replace(/^\/$/, '');
				return handleAirports(request, env, airportsPath);
			}

			if (path.startsWith('/api/notifications')) {
				const authResult = await authenticate(request, env);
				if (authResult.error) {
					return new Response(JSON.stringify({ error: authResult.error }), {
						status: 401,
						headers: { 'Content-Type': 'application/json', ...corsHeaders }
					});
				}
				// Normalize path: /api/notifications or /api/notifications/ should both result in empty string
				const notificationsPath = path.replace('/api/notifications', '').replace(/^\/$/, '');
				return handleNotifications(request, env, notificationsPath, authResult.user);
			}

			if (path.startsWith('/api/quotes')) {
				// Public POST, but other methods require auth
				if (request.method === 'POST' && path === '/api/quotes') {
					return handleQuotes(request, env, '');
				}
				
				const authResult = await authenticate(request, env);
				if (authResult.error) {
					return new Response(JSON.stringify({ error: authResult.error }), {
						status: 401,
						headers: { 'Content-Type': 'application/json', ...corsHeaders }
					});
				}
				const quotesPath = path.replace('/api/quotes', '').replace(/^\/$/, '');
				return handleQuotes(request, env, quotesPath, authResult.user);
			}

			if (path.startsWith('/api/upload')) {
				const authResult = await authenticate(request, env);
				if (authResult.error) {
					return new Response(JSON.stringify({ error: authResult.error }), {
						status: 401,
						headers: { 'Content-Type': 'application/json', ...corsHeaders }
					});
				}
				const uploadPath = path.replace('/api/upload', '').replace(/^\/$/, '');
				return handleUpload(request, env, uploadPath, authResult.user);
			}

			if (path.startsWith('/api/send-email')) {
				// Email endpoint is public (for quote notifications from landing page)
				return handleEmail(request, env, path.replace('/api/send-email', '').replace(/^\/$/, ''));
			}

			if (path.startsWith('/api/profile')) {
				const authResult = await authenticate(request, env);
				if (authResult.error) {
					return new Response(JSON.stringify({ error: authResult.error }), {
						status: 401,
						headers: { 'Content-Type': 'application/json', ...corsHeaders }
					});
				}
				const profilePath = path.replace('/api/profile', '').replace(/^\/$/, '');
				return handleProfile(request, env, profilePath, authResult.user);
			}

			if (path.startsWith('/api/admin/')) {
				const authResult = await authenticate(request, env);
				if (authResult.error) {
					return new Response(JSON.stringify({ error: authResult.error }), {
						status: 401,
						headers: { 'Content-Type': 'application/json', ...corsHeaders }
					});
				}
				const adminPath = path.replace('/api/admin', '').replace(/^\/$/, '');
				return handleAdmin(request, env, adminPath, authResult.user);
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
