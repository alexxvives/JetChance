/**
 * Airport Handlers - Cloudflare Workers
 */

import { corsHeaders } from '../middleware/cors';

export async function handleAirports(
  request: Request,
  env: Env,
  path: string,
  user?: any
): Promise<Response> {
  try {
    // GET /api/airports - Get all approved airports
    if (request.method === 'GET' && path === '') {
      const url = new URL(request.url);
      const query = url.searchParams.get('q');

      let airports;
      
      if (query) {
        // Search airports by query
        airports = await env.jetchance_db.prepare(
          `SELECT * FROM airports 
           WHERE status = 'approved' 
           AND (name LIKE ? OR code LIKE ? OR city LIKE ? OR country LIKE ?)
           ORDER BY name`
        ).bind(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`).all();
      } else {
        // Get all approved airports
        airports = await env.jetchance_db.prepare(
          'SELECT * FROM airports WHERE status = \'approved\' ORDER BY name'
        ).all();
      }

      return new Response(JSON.stringify(airports.results || []), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // POST /api/airports - Create new airport (pending approval)
    if (request.method === 'POST' && path === '') {
      const data = await request.json();
      
      // Validate required fields
      if (!data.name || !data.code) {
        return new Response(JSON.stringify({
          error: 'Validation failed',
          message: 'Airport name and code are required'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Check if airport code already exists
      const existing = await env.jetchance_db.prepare(
        'SELECT id FROM airports WHERE code = ?'
      ).bind(data.code).first();

      if (existing) {
        return new Response(JSON.stringify({
          error: 'Duplicate airport',
          message: 'An airport with this code already exists'
        }), {
          status: 409,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Insert new airport with pending status
      const result = await env.jetchance_db.prepare(
        `INSERT INTO airports (name, code, city, country, latitude, longitude, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
         RETURNING *`
      ).bind(
        data.name,
        data.code,
        data.city || null,
        data.country || null,
        data.latitude || null,
        data.longitude || null
      ).first();

      return new Response(JSON.stringify(result), {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // GET /api/airports/admin/pending - Get pending airports (admin only)
    if (request.method === 'GET' && path === '/admin/pending') {
      if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
        return new Response(JSON.stringify({
          error: 'Unauthorized',
          message: 'Admin access required'
        }), {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      const airports = await env.jetchance_db.prepare(
        'SELECT * FROM airports WHERE status = \'pending\' ORDER BY created_at DESC'
      ).all();

      return new Response(JSON.stringify(airports.results || []), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // POST /api/airports/admin/approve/:id - Approve airport (admin only)
    if (request.method === 'POST' && path.startsWith('/admin/approve/')) {
      if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
        return new Response(JSON.stringify({
          error: 'Unauthorized',
          message: 'Admin access required'
        }), {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      const airportId = path.replace('/admin/approve/', '');
      
      await env.jetchance_db.prepare(
        'UPDATE airports SET status = \'approved\', updated_at = datetime(\'now\') WHERE id = ?'
      ).bind(airportId).run();

      return new Response(JSON.stringify({
        message: 'Airport approved successfully'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // POST /api/airports/admin/reject/:id - Reject airport (admin only)
    if (request.method === 'POST' && path.startsWith('/admin/reject/')) {
      if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
        return new Response(JSON.stringify({
          error: 'Unauthorized',
          message: 'Admin access required'
        }), {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      const airportId = path.replace('/admin/reject/', '');
      
      await env.jetchance_db.prepare(
        'DELETE FROM airports WHERE id = ? AND status = \'pending\''
      ).bind(airportId).run();

      return new Response(JSON.stringify({
        message: 'Airport rejected and deleted'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 404 for unknown airport routes
    return new Response(JSON.stringify({
      error: 'Not Found',
      message: `Airport route ${path} not found`
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Airport handler error:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'An error occurred'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}
