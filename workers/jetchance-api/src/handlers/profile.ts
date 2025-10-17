/**
 * Profile Handler
 * Handles user profile management (view and update)
 */

import { corsHeaders } from '../middleware/cors';
import bcrypt from 'bcryptjs';

export async function handleProfile(
  request: Request,
  env: Env,
  path: string,
  user: any
): Promise<Response> {
  try {
    // GET /api/profile - Get user profile
    if (request.method === 'GET' && path === '') {
      // Get base user info
      const userRecord = await env.DB.prepare(`
        SELECT id, email, role, created_at
        FROM users
        WHERE id = ?
      `).bind(user.id).first();

      if (!userRecord) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Get role-specific profile data
      let profileData = null;

      if (user.role === 'customer') {
        profileData = await env.DB.prepare(`
          SELECT name, phone, address, city, country, postal_code
          FROM customers
          WHERE user_id = ?
        `).bind(user.id).first();
      } else if (user.role === 'operator') {
        profileData = await env.DB.prepare(`
          SELECT company_name, contact_name, phone, address, 
                 city, country, certification, status
          FROM operators
          WHERE user_id = ?
        `).bind(user.id).first();
      }

      return new Response(JSON.stringify({
        user: {
          id: userRecord.id,
          email: userRecord.email,
          role: userRecord.role,
          createdAt: userRecord.created_at,
          ...profileData
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // PUT /api/profile - Update user profile
    if (request.method === 'PUT' && path === '') {
      const body = await request.json();

      // Update role-specific data
      if (user.role === 'customer') {
        const { name, phone, address, city, country, postal_code } = body;

        // Check if customer record exists
        const existing = await env.DB.prepare(`
          SELECT user_id FROM customers WHERE user_id = ?
        `).bind(user.id).first();

        if (existing) {
          // Update existing
          await env.DB.prepare(`
            UPDATE customers 
            SET name = ?, phone = ?, address = ?, city = ?, 
                country = ?, postal_code = ?
            WHERE user_id = ?
          `).bind(name, phone, address, city, country, postal_code, user.id).run();
        } else {
          // Create new customer record
          await env.DB.prepare(`
            INSERT INTO customers (user_id, name, phone, address, city, country, postal_code)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(user.id, name, phone, address, city, country, postal_code).run();
        }
      } else if (user.role === 'operator') {
        const { company_name, contact_name, phone, address, city, country } = body;

        await env.DB.prepare(`
          UPDATE operators 
          SET company_name = ?, contact_name = ?, phone = ?, 
              address = ?, city = ?, country = ?
          WHERE user_id = ?
        `).bind(company_name, contact_name, phone, address, city, country, user.id).run();
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Profile updated successfully'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // POST /api/profile - Alternative update endpoint (same as PUT)
    if (request.method === 'POST' && path === '') {
      // Just redirect to PUT handler
      return handleProfile(
        new Request(request.url, {
          ...request,
          method: 'PUT',
          body: request.body,
          headers: request.headers
        }),
        env,
        path,
        user
      );
    }

    // POST /api/profile/password - Change password
    if (request.method === 'POST' && path === '/password') {
      const body = await request.json();
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        return new Response(JSON.stringify({
          error: 'Current password and new password required'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Verify current password
      const userRecord = await env.DB.prepare(`
        SELECT password_hash FROM users WHERE id = ?
      `).bind(user.id).first();

      const isValid = await bcrypt.compare(currentPassword, userRecord.password_hash);
      if (!isValid) {
        return new Response(JSON.stringify({
          error: 'Current password is incorrect'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Hash and update new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await env.DB.prepare(`
        UPDATE users SET password_hash = ? WHERE id = ?
      `).bind(hashedPassword, user.id).run();

      return new Response(JSON.stringify({
        success: true,
        message: 'Password updated successfully'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Profile handler error:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}
