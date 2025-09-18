/**
 * Authentication handler for Cloudflare Workers
 * Handles login, register, and token refresh
 */

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { corsHeaders } from '../middleware/cors';
import { generateTokens } from '../middleware/auth';

interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  phone?: string;
  role?: 'customer' | 'operator';
}

interface LoginRequest {
  email: string;
  password: string;
}

export async function handleAuth(request: Request, env: Env, path: string): Promise<Response> {
  try {
    if (path === '/register' && request.method === 'POST') {
      return handleRegister(request, env);
    }
    
    if (path === '/login' && request.method === 'POST') {
      return handleLogin(request, env);
    }
    
    if (path === '/me' && request.method === 'GET') {
      return handleGetProfile(request, env);
    }
    
    return new Response(JSON.stringify({
      error: 'Not Found',
      message: `Auth route ${path} not found`,
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Auth handler error:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

async function handleRegister(request: Request, env: Env): Promise<Response> {
  try {
    const data = await request.json() as RegisterRequest;
    
    // Validation
    if (!data.email || !data.password) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        message: 'Email and password are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Handle both firstName/lastName and first_name/last_name formats
    const firstName = data.firstName || data.first_name;
    const lastName = data.lastName || data.last_name;
    
    if (!firstName || !lastName) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        message: 'First name and last name are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    if (data.password.length < 6) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        message: 'Password must be at least 6 characters'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Check if user already exists
    const existingUser = await env.chancefly_db.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(data.email).first();
    
    if (existingUser) {
      return new Response(JSON.stringify({
        error: 'User already exists',
        message: 'An account with this email already exists'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);
    
    // Generate user ID
    const userId = uuidv4();
    const role = data.role || 'customer';
    
    // Create user
    await env.chancefly_db.prepare(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(userId, data.email, passwordHash, firstName, lastName, data.phone || null, role).run();
    
    // If registering as operator, create operator profile
    if (role === 'operator') {
      const operatorId = uuidv4();
      await env.chancefly_db.prepare(
        'INSERT INTO operators (id, user_id, company_name, status) VALUES (?, ?, ?, ?)'
      ).bind(operatorId, userId, `${firstName} ${lastName} Aviation`, 'pending').run();
    }
    
    // Get the created user
    const userResult = await env.chancefly_db.prepare(
      'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = ?'
    ).bind(userId).first();
    
    if (!userResult) {
      throw new Error('Failed to retrieve created user');
    }
    
    const { accessToken, refreshToken } = generateTokens(userId, env);
    
    return new Response(JSON.stringify({
      message: 'User registered successfully',
      user: {
        id: userResult.id,
        email: userResult.email,
        firstName: userResult.first_name,
        lastName: userResult.last_name,
        role: userResult.role,
        createdAt: userResult.created_at
      },
      tokens: {
        accessToken,
        refreshToken
      }
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({
      error: 'Registration failed',
      message: 'Unable to create account. Please try again.'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  try {
    const data = await request.json() as LoginRequest;
    
    // Validation
    if (!data.email || !data.password) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        message: 'Email and password are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Get user from database
    const user = await env.chancefly_db.prepare(
      'SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = ?'
    ).bind(data.email).first();
    
    if (!user) {
      return new Response(JSON.stringify({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password_hash as string);
    
    if (!isPasswordValid) {
      return new Response(JSON.stringify({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const { accessToken, refreshToken } = generateTokens(user.id as string, env);
    
    return new Response(JSON.stringify({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      },
      tokens: {
        accessToken,
        refreshToken
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({
      error: 'Login failed',
      message: 'Unable to log in. Please try again.'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

async function handleGetProfile(request: Request, env: Env): Promise<Response> {
  // This would need authentication - simplified for now
  return new Response(JSON.stringify({
    message: 'Profile endpoint - authentication required'
  }), {
    status: 401,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}