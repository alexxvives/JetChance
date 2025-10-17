/**
 * Flights handler for Cloudflare Workers
 * Handles flight search and flight data
 */

import { corsHeaders } from '../middleware/cors';

interface FlightSearchParams {
  origin?: string;
  destination?: string;
  departure_date?: string;
  passengers?: string;
}

export async function handleFlights(request: Request, env: Env, path: string): Promise<Response> {
  try {
    // POST /api/flights - Create new flight
    if (path === '' && request.method === 'POST') {
      return handleCreateFlight(request, env);
    }

    // GET /api/flights?user_id=... - Get flights for operator
    if (path === '' && request.method === 'GET') {
      const url = new URL(request.url);
      const userId = url.searchParams.get('user_id');
      
      if (userId) {
        return handleGetOperatorFlights(request, env, userId);
      }
      
      // If no user_id, fall through to search
      return handleFlightSearch(request, env);
    }
    
    if (path === '/search' && request.method === 'GET') {
      return handleFlightSearch(request, env);
    }
    
    // GET /api/flights/{id} - Get single flight (UUID format)
    if (path.match(/^\/[a-f0-9-]{36}$/i) && request.method === 'GET') {
      const flightId = path.substring(1);
      return handleGetFlight(request, env, flightId);
    }
    
    return new Response(JSON.stringify({
      error: 'Not Found',
      message: `Flight route ${path} not found`,
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Flights handler error:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: 'Flight search failed',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

async function handleFlightSearch(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const origin = url.searchParams.get('origin');
    const destination = url.searchParams.get('destination');
    const departureDate = url.searchParams.get('departure_date');
    const passengers = url.searchParams.get('passengers') || '1';
    
    let query = `
      SELECT 
        id, operator_id, origin, destination, origin_code, destination_code,
        departure_time, arrival_time, aircraft_type, aircraft_image,
        price, original_price, seats_available, operator_name, duration,
        origin_lat, origin_lng, destination_lat, destination_lng, status
      FROM flights 
      WHERE status = 'active'
    `;
    
    const params = [];
    
    if (origin) {
      query += ' AND (origin LIKE ? OR origin_code LIKE ?)';
      params.push(`%${origin}%`, `%${origin}%`);
    }
    
    if (destination) {
      query += ' AND (destination LIKE ? OR destination_code LIKE ?)';
      params.push(`%${destination}%`, `%${destination}%`);
    }
    
    if (departureDate) {
      query += ' AND DATE(departure_time) = DATE(?)';
      params.push(departureDate);
    }
    
    query += ' AND seats_available >= ?';
    params.push(passengers);
    
    query += ' ORDER BY departure_time ASC';
    
    const stmt = env.jetchance_db.prepare(query);
    const result = await stmt.bind(...params).all();
    
    return new Response(JSON.stringify({
      flights: result.results || [],
      totalResults: result.results?.length || 0,
      searchParams: {
        origin,
        destination,
        departureDate,
        passengers: parseInt(passengers)
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error('Flight search error:', error);
    return new Response(JSON.stringify({
      error: 'Search failed',
      message: 'Unable to search flights. Please try again.'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

async function handleGetFlight(request: Request, env: Env, flightId: string): Promise<Response> {
  try {
    const flight = await env.jetchance_db.prepare(
      `SELECT 
        id, operator_id, aircraft_model, images,
        origin_name, origin_city, origin_country,
        destination_name, destination_city, destination_country,
        departure_datetime, arrival_datetime,
        market_price, empty_leg_price,
        available_seats, total_seats,
        status, description,
        created_at, updated_at
       FROM flights 
       WHERE id = ?`
    ).bind(flightId).first();
    
    if (!flight) {
      return new Response(JSON.stringify({
        error: 'Flight not found',
        message: 'The requested flight was not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    return new Response(JSON.stringify(flight), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error('Get flight error:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: 'Failed to retrieve flight'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

/**
 * Get all flights for an operator by user_id
 */
async function handleGetOperatorFlights(request: Request, env: Env, userId: string): Promise<Response> {
  try {
    // First check if operator exists for this user_id
    const operator = await env.jetchance_db.prepare(
      'SELECT id FROM operators WHERE user_id = ?'
    ).bind(userId).first();

    // If no operator profile, return empty array (user might not be registered as operator yet)
    if (!operator) {
      console.log(`No operator profile found for user_id: ${userId}`);
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Get flights for this operator
    const flights = await env.jetchance_db.prepare(`
      SELECT 
        id, aircraft_model, images,
        origin_name, origin_city, origin_country,
        destination_name, destination_city, destination_country,
        departure_datetime, arrival_datetime, 
        market_price, empty_leg_price,
        available_seats, total_seats, status, description,
        created_at, updated_at
      FROM flights
      WHERE operator_id = ?
      ORDER BY departure_datetime DESC
    `).bind(operator.id).all();

    return new Response(JSON.stringify(flights.results || []), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error('Get operator flights error:', error);
    return new Response(JSON.stringify({
      error: 'Flight retrieval failed',
      message: error instanceof Error ? error.message : 'Unable to get flight details',
      details: 'Check if operator profile exists for this user'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

/**
 * Create a new flight
 */
async function handleCreateFlight(request: Request, env: Env): Promise<Response> {
  try {
    // Authenticate user
    const { authenticate } = await import('../middleware/auth');
    const authResult = await authenticate(request, env);
    
    if (authResult.error || !authResult.user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: authResult.error || 'Authentication required'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Only operators can create flights
    if (authResult.user.role !== 'operator') {
      return new Response(JSON.stringify({
        error: 'Forbidden',
        message: 'Only operators can create flights'
      }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const data = await request.json() as any;

    // Validate required fields
    const requiredFields = [
      'origin_name', 'origin_city', 'origin_country',
      'destination_name', 'destination_city', 'destination_country',
      'departure_datetime', 'market_price', 'empty_leg_price',
      'available_seats', 'total_seats'
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return new Response(JSON.stringify({
          error: 'Validation failed',
          message: `Missing required field: ${field}`
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }

    // Get operator_id from user_id
    const operator = await env.jetchance_db.prepare(
      'SELECT id FROM operators WHERE user_id = ?'
    ).bind(authResult.user.id).first();

    if (!operator) {
      return new Response(JSON.stringify({
        error: 'Forbidden',
        message: 'Operator profile not found'
      }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Generate flight ID using UUID
    const { generateUUID } = await import('../utils/idGenerator');
    const flightId = generateUUID();

    // Insert flight
    await env.jetchance_db.prepare(`
      INSERT INTO flights (
        id, operator_id, aircraft_model, images,
        origin_name, origin_city, origin_country,
        destination_name, destination_city, destination_country,
        departure_datetime, arrival_datetime,
        market_price, empty_leg_price,
        available_seats, total_seats,
        status, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      flightId,
      operator.id,
      data.aircraft_model || null,
      data.images || '[]',
      data.origin_name,
      data.origin_city,
      data.origin_country,
      data.destination_name,
      data.destination_city,
      data.destination_country,
      data.departure_datetime,
      data.arrival_datetime || null,
      data.market_price,
      data.empty_leg_price,
      data.available_seats,
      data.total_seats,
      data.status || 'pending',
      data.description || null
    ).run();

    // Update operator's total_flights count
    await env.jetchance_db.prepare(
      'UPDATE operators SET total_flights = total_flights + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(operator.id).run();

    // Get the created flight
    const flight = await env.jetchance_db.prepare(
      'SELECT * FROM flights WHERE id = ?'
    ).bind(flightId).first();

    return new Response(JSON.stringify({
      message: 'Flight created successfully',
      flight: flight
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Create flight error:', error);
    return new Response(JSON.stringify({
      error: 'Flight creation failed',
      message: error instanceof Error ? error.message : 'Unable to create flight'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}
