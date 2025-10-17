/**
 * Bookings handler for Cloudflare Workers
 */

import { corsHeaders } from '../middleware/cors';
import { AuthUser } from '../middleware/auth';

export async function handleBookings(request: Request, env: Env, path: string, user: AuthUser): Promise<Response> {
  try {
    // GET /api/bookings - Get all bookings for current user
    if (request.method === 'GET' && path === '') {
      let bookings;
      
      if (user.role === 'customer') {
        // Get customer bookings with flight details
        bookings = await env.jetchance_db.prepare(`
          SELECT 
            b.id, b.flight_id, b.total_passengers, b.total_amount,
            b.payment_method, b.special_requests, b.status,
            b.contact_email, b.created_at, b.updated_at,
            f.aircraft_model, f.origin_name, f.origin_city, f.origin_country,
            f.destination_name, f.destination_city, f.destination_country,
            f.departure_datetime, f.arrival_datetime,
            o.company_name as operator_name
          FROM bookings b
          JOIN customers c ON b.customer_id = c.id
          JOIN flights f ON b.flight_id = f.id
          JOIN operators o ON f.operator_id = o.id
          WHERE c.user_id = ?
          ORDER BY b.created_at DESC
        `).bind(user.id).all();
      } else if (user.role === 'operator') {
        // Get operator bookings (bookings for their flights)
        bookings = await env.jetchance_db.prepare(`
          SELECT 
            b.id, b.flight_id, b.total_passengers, b.total_amount,
            b.payment_method, b.special_requests, b.status,
            b.contact_email, b.created_at, b.updated_at,
            f.aircraft_model, f.origin_name, f.origin_city, f.origin_country,
            f.destination_name, f.destination_city, f.destination_country,
            f.departure_datetime, f.arrival_datetime,
            c.first_name, c.last_name
          FROM bookings b
          JOIN flights f ON b.flight_id = f.id
          JOIN operators op ON f.operator_id = op.id
          JOIN customers c ON b.customer_id = c.id
          WHERE op.user_id = ?
          ORDER BY b.created_at DESC
        `).bind(user.id).all();
      } else {
        // Admin - get all bookings
        bookings = await env.jetchance_db.prepare(`
          SELECT 
            b.id, b.flight_id, b.total_passengers, b.total_amount,
            b.payment_method, b.special_requests, b.status,
            b.contact_email, b.created_at, b.updated_at,
            f.aircraft_model, f.origin_name, f.destination_name,
            f.departure_datetime,
            o.company_name as operator_name,
            c.first_name, c.last_name
          FROM bookings b
          JOIN flights f ON b.flight_id = f.id
          JOIN operators o ON f.operator_id = o.id
          JOIN customers c ON b.customer_id = c.id
          ORDER BY b.created_at DESC
        `).all();
      }

      return new Response(JSON.stringify(bookings.results || []), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // GET /api/bookings/operator - Get CRM data for operator
    if (request.method === 'GET' && path === '/operator') {
      if (user.role !== 'operator') {
        return new Response(JSON.stringify({
          error: 'Only operators can access this endpoint'
        }), {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Get operator's flights count
      const flightsCount = await env.jetchance_db.prepare(`
        SELECT COUNT(*) as count
        FROM flights f
        JOIN operators o ON f.operator_id = o.id
        WHERE o.user_id = ?
      `).bind(user.id).first();

      // Get operator bookings with all details
      const bookings = await env.jetchance_db.prepare(`
        SELECT 
          b.id,
          b.flight_id as flightId,
          b.total_passengers,
          b.total_amount as totalAmount,
          b.status,
          b.contact_email,
          b.created_at as bookingDate,
          f.origin_name || ' (' || f.origin_city || ')' as origin,
          f.destination_name || ' (' || f.destination_city || ')' as destination,
          f.departure_datetime as departure,
          f.available_seats as availableSeats,
          f.total_seats as totalSeats,
          c.first_name || ' ' || c.last_name as customerName
        FROM bookings b
        JOIN flights f ON b.flight_id = f.id
        JOIN operators op ON f.operator_id = op.id
        JOIN customers c ON b.customer_id = c.id
        WHERE op.user_id = ?
        ORDER BY b.created_at DESC
      `).bind(user.id).all();

      const response = {
        totalFlights: flightsCount?.count || 0,
        bookings: (bookings.results || []).map((booking: any) => ({
          ...booking,
          flight: {
            origin: booking.origin,
            destination: booking.destination,
            departure: booking.departure,
            availableSeats: booking.availableSeats,
            totalSeats: booking.totalSeats
          },
          passengers: [] // Could be populated from passengers table if needed
        }))
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // GET /api/bookings/crm - Get CRM data for admin
    if (request.method === 'GET' && path === '/crm') {
      if (user.role !== 'admin' && user.role !== 'super-admin') {
        return new Response(JSON.stringify({ error: 'Unauthorized - Admin access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Get all bookings with detailed info for CRM
      const bookings = await env.jetchance_db.prepare(`
        SELECT 
          b.id, b.flight_id, b.total_passengers, b.total_amount,
          b.payment_method, b.special_requests, b.status,
          b.contact_email, b.created_at, b.updated_at,
          f.aircraft_model, f.origin_name, f.origin_city, f.origin_country,
          f.destination_name, f.destination_city, f.destination_country,
          f.departure_datetime, f.arrival_datetime, f.price,
          o.company_name as operator_name, o.contact_name as operator_contact,
          c.name as customer_name, c.phone as customer_phone
        FROM bookings b
        JOIN flights f ON b.flight_id = f.id
        JOIN operators o ON f.operator_id = o.id
        LEFT JOIN customers c ON b.customer_id = c.id
        ORDER BY b.created_at DESC
      `).all();

      return new Response(JSON.stringify({
        bookings: bookings.results || [],
        totalBookings: bookings.results?.length || 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // GET /api/bookings/:id/flight - Get booking with flight details
    if (request.method === 'GET' && path.match(/^\/\d+\/flight$/)) {
      const bookingId = path.split('/')[1];
      
      const result = await env.jetchance_db.prepare(`
        SELECT 
          b.id as booking_id, b.total_passengers, b.total_amount,
          b.payment_method, b.special_requests, b.status as booking_status,
          b.contact_email, b.created_at as booking_created_at,
          f.id as flight_id, f.aircraft_model, f.aircraft_type,
          f.origin_name, f.origin_city, f.origin_country, f.origin_iata,
          f.destination_name, f.destination_city, f.destination_country, f.destination_iata,
          f.departure_datetime, f.arrival_datetime, f.price,
          f.available_seats, f.status as flight_status,
          o.company_name as operator_name, o.contact_name as operator_contact,
          o.phone as operator_phone
        FROM bookings b
        JOIN flights f ON b.flight_id = f.id
        JOIN operators o ON f.operator_id = o.id
        WHERE b.id = ?
      `).bind(bookingId).first();

      if (!result) {
        return new Response(JSON.stringify({ error: 'Booking not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Restructure data for frontend
      const response = {
        ...result,
        flight: {
          id: result.flight_id,
          aircraftModel: result.aircraft_model,
          aircraftType: result.aircraft_type,
          origin: {
            name: result.origin_name,
            city: result.origin_city,
            country: result.origin_country,
            iata: result.origin_iata
          },
          destination: {
            name: result.destination_name,
            city: result.destination_city,
            country: result.destination_country,
            iata: result.destination_iata
          },
          departureDateTime: result.departure_datetime,
          arrivalDateTime: result.arrival_datetime,
          price: result.price,
          availableSeats: result.available_seats,
          status: result.flight_status
        },
        operator: {
          name: result.operator_name,
          contact: result.operator_contact,
          phone: result.operator_phone
        }
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // GET /api/bookings/:id - Get specific booking
    if (request.method === 'GET' && path.match(/^\/[^/]+$/)) {
      const bookingId = path.substring(1);
      
      const booking = await env.jetchance_db.prepare(`
        SELECT 
          b.*, f.*, o.company_name as operator_name,
          c.first_name, c.last_name, c.phone
        FROM bookings b
        JOIN flights f ON b.flight_id = f.id
        JOIN operators o ON f.operator_id = o.id
        JOIN customers c ON b.customer_id = c.id
        WHERE b.id = ?
      `).bind(bookingId).first();

      if (!booking) {
        return new Response(JSON.stringify({
          error: 'Booking not found'
        }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      return new Response(JSON.stringify(booking), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // POST /api/bookings - Create new booking (customers only)
    if (request.method === 'POST' && path === '') {
      if (user.role !== 'customer') {
        return new Response(JSON.stringify({
          error: 'Only customers can create bookings'
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
      if (!data.flight_id || !data.total_passengers || !data.total_amount) {
        return new Response(JSON.stringify({
          error: 'Missing required fields'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Get customer ID from user
      const customer = await env.jetchance_db.prepare(
        'SELECT id FROM customers WHERE user_id = ?'
      ).bind(user.id).first();

      if (!customer) {
        return new Response(JSON.stringify({
          error: 'Customer profile not found'
        }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Generate booking ID using UUID
      const bookingId = crypto.randomUUID();

      // Create booking
      await env.jetchance_db.prepare(`
        INSERT INTO bookings (
          id, flight_id, customer_id, total_passengers, total_amount,
          payment_method, special_requests, contact_email, status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))
      `).bind(
        bookingId,
        data.flight_id,
        customer.id,
        data.total_passengers,
        data.total_amount,
        data.payment_method || null,
        data.special_requests || null,
        data.contact_email || user.email
      ).run();

      // Update flight availability
      await env.jetchance_db.prepare(`
        UPDATE flights 
        SET available_seats = available_seats - ?,
            status = CASE 
              WHEN available_seats - ? <= 0 THEN 'fully booked'
              WHEN available_seats - ? < total_seats THEN 'partially booked'
              ELSE status
            END,
            updated_at = datetime('now')
        WHERE id = ?
      `).bind(data.total_passengers, data.total_passengers, data.total_passengers, data.flight_id).run();

      // Get the created booking
      const newBooking = await env.jetchance_db.prepare(
        'SELECT * FROM bookings WHERE id = ?'
      ).bind(bookingId).first();

      return new Response(JSON.stringify(newBooking), {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // PATCH /api/bookings/:id - Update booking status
    if (request.method === 'PATCH' && path.match(/^\/[^/]+$/)) {
      const bookingId = path.substring(1);
      const data = await request.json() as any;

      await env.jetchance_db.prepare(`
        UPDATE bookings 
        SET status = ?, updated_at = datetime('now')
        WHERE id = ?
      `).bind(data.status, bookingId).run();

      const updatedBooking = await env.jetchance_db.prepare(
        'SELECT * FROM bookings WHERE id = ?'
      ).bind(bookingId).first();

      return new Response(JSON.stringify(updatedBooking), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({
      error: 'Not Found',
      message: `Booking route ${path} not found`
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Bookings handler error:', error);
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
