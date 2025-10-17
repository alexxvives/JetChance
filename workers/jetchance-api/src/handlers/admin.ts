/**
 * Admin Handler
 * Handles admin-only endpoints for system statistics and management
 */

import { corsHeaders } from '../middleware/cors';

export async function handleAdmin(
  request: Request,
  env: Env,
  path: string,
  user: any
): Promise<Response> {
  try {
    // Verify admin access
    if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // GET /api/admin/system-stats - Get system statistics
    if (request.method === 'GET' && path === '/system-stats') {
      // Get counts from various tables
      const [users, operators, flights, bookings, quotes, airports] = await Promise.all([
        env.DB.prepare('SELECT COUNT(*) as count FROM users').first(),
        env.DB.prepare('SELECT COUNT(*) as count FROM operators WHERE status = ?').bind('approved').first(),
        env.DB.prepare('SELECT COUNT(*) as count FROM flights WHERE status = ?').bind('active').first(),
        env.DB.prepare('SELECT COUNT(*) as count FROM bookings').first(),
        env.DB.prepare('SELECT COUNT(*) as count FROM quotes').first(),
        env.DB.prepare('SELECT COUNT(*) as count FROM airports WHERE approved = 1').first(),
      ]);

      // Get pending items
      const [pendingOperators, pendingFlights, pendingAirports, unseenQuotes] = await Promise.all([
        env.DB.prepare('SELECT COUNT(*) as count FROM operators WHERE status = ?').bind('pending').first(),
        env.DB.prepare('SELECT COUNT(*) as count FROM flights WHERE status = ?').bind('pending').first(),
        env.DB.prepare('SELECT COUNT(*) as count FROM airports WHERE approved = 0').first(),
        env.DB.prepare('SELECT COUNT(*) as count FROM quotes WHERE seen = 0').first(),
      ]);

      // Get recent activity (last 7 days)
      const [recentBookings, recentQuotes] = await Promise.all([
        env.DB.prepare(`
          SELECT COUNT(*) as count 
          FROM bookings 
          WHERE created_at >= datetime('now', '-7 days')
        `).first(),
        env.DB.prepare(`
          SELECT COUNT(*) as count 
          FROM quotes 
          WHERE created_at >= datetime('now', '-7 days')
        `).first(),
      ]);

      return new Response(JSON.stringify({
        totals: {
          users: users?.count || 0,
          operators: operators?.count || 0,
          flights: flights?.count || 0,
          bookings: bookings?.count || 0,
          quotes: quotes?.count || 0,
          airports: airports?.count || 0,
        },
        pending: {
          operators: pendingOperators?.count || 0,
          flights: pendingFlights?.count || 0,
          airports: pendingAirports?.count || 0,
          unseenQuotes: unseenQuotes?.count || 0,
        },
        recentActivity: {
          bookingsLast7Days: recentBookings?.count || 0,
          quotesLast7Days: recentQuotes?.count || 0,
        },
        timestamp: new Date().toISOString(),
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // GET /api/admin/r2-stats - Get R2 storage statistics
    if (request.method === 'GET' && path === '/r2-stats') {
      try {
        // List all objects in the aircraft images bucket
        const listed = await env.AIRCRAFT_IMAGES.list();
        
        // Calculate total size
        let totalSize = 0;
        let imageCount = listed.objects.length;

        // R2 list() returns basic info, we need to get full object info for size
        // For now, we'll estimate or just count files
        // In production, you might want to cache this or use R2's analytics

        return new Response(JSON.stringify({
          imageCount,
          totalSize: 'N/A', // R2 doesn't provide size in list() by default
          bucketName: 'AIRCRAFT_IMAGES',
          lastUpdated: new Date().toISOString(),
          note: 'Full size calculation requires individual object fetches - implement caching for production'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      } catch (error) {
        // R2 bucket might not be configured in dev
        return new Response(JSON.stringify({
          imageCount: 0,
          totalSize: 0,
          error: 'R2 bucket not available',
          note: 'R2 bucket may not be configured in development environment'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Admin handler error:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}
