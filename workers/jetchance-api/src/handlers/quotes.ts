/**
 * Quotes Handler
 * Handles quote/lead capture requests from potential customers
 */

import { corsHeaders } from '../middleware/cors';

export async function handleQuotes(
  request: Request,
  env: Env,
  path: string,
  user?: any
): Promise<Response> {
  try {
    // POST /api/quotes - Create new quote (public)
    if (request.method === 'POST' && path === '') {
      const body = await request.json() as any;
      
      const {
        name,
        email,
        phone,
        origin,
        destination,
        departureDate,
        returnDate,
        passengers,
        message,
        tripType = 'one-way'
      } = body;

      // Validation
      if (!name || !email || !origin || !destination || !departureDate || !passengers) {
        return new Response(JSON.stringify({
          error: 'Missing required fields: name, email, origin, destination, departureDate, passengers'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Insert quote
      const result = await env.jetchance_db.prepare(`
        INSERT INTO quotes (
          name, email, phone, origin, destination, 
          departure_date, return_date, passengers, 
          message, trip_type, status, contacted, seen, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, 0, datetime('now'))
      `).bind(
        name,
        email,
        phone || null,
        origin,
        destination,
        departureDate,
        returnDate || null,
        passengers,
        message || null,
        tripType
      ).run();

      return new Response(JSON.stringify({
        success: true,
        quoteId: result.meta.last_row_id,
        message: 'Quote request received. We will contact you soon!'
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // GET /api/quotes - Get all quotes (admin only)
    if (request.method === 'GET' && path === '') {
      if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
        return new Response(JSON.stringify({ error: 'Unauthorized - Admin access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const quotes = await env.jetchance_db.prepare(`
        SELECT 
          id, name, email, phone, origin, destination,
          departure_date, return_date, passengers, message,
          trip_type, status, contacted, seen, created_at
        FROM quotes
        ORDER BY created_at DESC
      `).all();

      return new Response(JSON.stringify({ quotes: quotes.results }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // GET /api/quotes/unseen-count - Count unseen quotes (admin only)
    if (request.method === 'GET' && path === '/unseen-count') {
      if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const result = await env.jetchance_db.prepare(`
        SELECT COUNT(*) as count FROM quotes WHERE seen = 0
      `).first();

      return new Response(JSON.stringify({ count: result?.count || 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // GET /api/quotes/not-contacted-count - Count not contacted quotes (admin only)
    if (request.method === 'GET' && path === '/not-contacted-count') {
      if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const result = await env.jetchance_db.prepare(`
        SELECT COUNT(*) as count FROM quotes WHERE contacted = 0
      `).first();

      return new Response(JSON.stringify({ count: result?.count || 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // POST /api/quotes/mark-seen - Mark quotes as seen (admin only)
    if (request.method === 'POST' && path === '/mark-seen') {
      if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const body = await request.json() as any;
      const { quoteIds } = body;

      if (!Array.isArray(quoteIds) || quoteIds.length === 0) {
        return new Response(JSON.stringify({ error: 'quoteIds array required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Mark all as seen
      const placeholders = quoteIds.map(() => '?').join(',');
      await env.jetchance_db.prepare(`
        UPDATE quotes SET seen = 1 WHERE id IN (${placeholders})
      `).bind(...quoteIds).run();

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // PUT /api/quotes/:id - Update quote (admin only)
    if (request.method === 'PUT' && path.match(/^\/\d+$/)) {
      if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const quoteId = path.substring(1);
      const body = await request.json() as any;
      const { status, contacted } = body;

      const updates = [];
      const values = [];

      if (status) {
        updates.push('status = ?');
        values.push(status);
      }
      if (contacted !== undefined) {
        updates.push('contacted = ?');
        values.push(contacted ? 1 : 0);
      }

      if (updates.length === 0) {
        return new Response(JSON.stringify({ error: 'No fields to update' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      values.push(quoteId);

      await env.jetchance_db.prepare(`
        UPDATE quotes SET ${updates.join(', ')} WHERE id = ?
      `).bind(...values).run();

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Quotes handler error:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}
