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
    
    if (path.match(/^\/\d+$/) && request.method === 'GET') {
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
        id, operator_id, origin, destination, origin_code, destination_code,
        departure_time, arrival_time, aircraft_type, aircraft_image,
        price, original_price, seats_available, operator_name, duration,
        origin_lat, origin_lng, destination_lat, destination_lng, status
       FROM flights 
       WHERE id = ? AND status = 'active'`
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
    
    return new Response(JSON.stringify({ flight }), {
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
    // Get flights for this operator
    const flights = await env.jetchance_db.prepare(`
      SELECT 
        f.id, f.aircraft_model, f.aircraft_type, f.origin_name, 
        f.origin_city, f.origin_country, f.origin_iata,
        f.destination_name, f.destination_city, f.destination_country, f.destination_iata,
        f.departure_datetime, f.arrival_datetime, f.price, 
        f.available_seats, f.total_seats, f.status, f.images,
        f.created_at, f.updated_at
      FROM flights f
      JOIN operators o ON f.operator_id = o.id
      WHERE o.user_id = ?
      ORDER BY f.departure_datetime DESC
    `).bind(userId).all();

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
      message: 'Unable to get flight details. Please try again.'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}
