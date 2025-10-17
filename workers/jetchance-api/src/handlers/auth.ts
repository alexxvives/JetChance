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
  signupCode?: string;
  companyName?: string;
  company_name?: string;
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
    console.log('🔵 [REGISTER] Starting registration process');
    const data = await request.json() as RegisterRequest;
    console.log('🔵 [REGISTER] Data received:', {
      email: data.email,
      hasPassword: !!data.password,
      hasSignupCode: !!data.signupCode,
      hasFirstName: !!(data.firstName || data.first_name),
      hasLastName: !!(data.lastName || data.last_name)
    });
    
    // Validation
    if (!data.email || !data.password) {
      console.log('❌ [REGISTER] Missing email or password');
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
    
    // Only require name for customers, not for operators
    const isOperator = !!data.signupCode;
    console.log('🔵 [REGISTER] User type:', isOperator ? 'OPERATOR' : 'CUSTOMER');
    
    if (!isOperator && (!firstName || !lastName)) {
      console.log('❌ [REGISTER] Customer missing first/last name');
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
    console.log('🔵 [REGISTER] Checking if user exists...');
    const existingUser = await env.jetchance_db.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(data.email).first();
    
    if (existingUser) {
      console.log('❌ [REGISTER] User already exists');
      return new Response(JSON.stringify({
        error: 'User already exists',
        message: 'An account with this email already exists'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Hash password
    console.log('🔵 [REGISTER] Hashing password...');
    const passwordHash = await bcrypt.hash(data.password, 12);
    
    // Generate user ID
    const userId = uuidv4();
    const role = data.role || 'customer';
    console.log('🔵 [REGISTER] Creating user with role:', role);
    
    // Create user (authentication data only)
    console.log('🔵 [REGISTER] Inserting into users table...');
    await env.jetchance_db.prepare(
      `INSERT INTO users (id, email, password_hash, role)
       VALUES (?, ?, ?, ?)`
    ).bind(userId, data.email, passwordHash, role).run();
    console.log('✅ [REGISTER] User created successfully');
    
    // Create role-specific profile
    if (role === 'customer') {
      console.log('🔵 [REGISTER] Creating customer profile...');
      const customerId = uuidv4();
      await env.jetchance_db.prepare(
        'INSERT INTO customers (id, user_id, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)'
      ).bind(customerId, userId, firstName, lastName, data.phone || null).run();
      console.log('✅ [REGISTER] Customer profile created');
    } else if (role === 'operator') {
      console.log('🔵 [REGISTER] Creating operator profile...');
      const operatorId = uuidv4();
      const companyName = data.companyName || data.company_name || 
                         (firstName && lastName ? `${firstName} ${lastName} Aviation` : 'New Aviation Company');
      console.log('🔵 [REGISTER] Operator company name:', companyName);
      await env.jetchance_db.prepare(
        'INSERT INTO operators (id, user_id, company_name) VALUES (?, ?, ?)'
      ).bind(operatorId, userId, companyName).run();
      console.log('✅ [REGISTER] Operator profile created');
    }
    
    // Get the created user and role-specific data
    const userResult = await env.jetchance_db.prepare(
      'SELECT id, email, role, created_at FROM users WHERE id = ?'
    ).bind(userId).first();
    
    if (!userResult) {
      throw new Error('Failed to retrieve created user');
    }
    
    let userData: any = {
      id: userResult.id,
      email: userResult.email,
      role: userResult.role,
      createdAt: userResult.created_at
    };

    if (role === 'customer') {
      const customerResult = await env.jetchance_db.prepare(
        'SELECT first_name, last_name FROM customers WHERE user_id = ?'
      ).bind(userId).first();
      
      if (customerResult) {
        userData.firstName = customerResult.first_name;
        userData.lastName = customerResult.last_name;
      }
    } else if (role === 'operator') {
      const operatorResult = await env.jetchance_db.prepare(
        'SELECT company_name FROM operators WHERE user_id = ?'
      ).bind(userId).first();
      
      if (operatorResult) {
        userData.companyName = operatorResult.company_name;
      }
    }
    
    console.log('🔵 [REGISTER] Generating tokens...');
    const { accessToken, refreshToken } = generateTokens(userId, env);
    console.log('✅ [REGISTER] Tokens generated');
    
    console.log('✅ [REGISTER] Registration complete! Returning success response...');
    return new Response(JSON.stringify({
      message: 'User registered successfully',
      user: userData,
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
    console.error('❌ [REGISTER] FATAL ERROR:', error);
    console.error('❌ [REGISTER] Error message:', error instanceof Error ? error.message : String(error));
    console.error('❌ [REGISTER] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return new Response(JSON.stringify({
      error: 'Registration failed',
      message: 'Unable to create account. Please try again.',
      debug: error instanceof Error ? error.message : String(error)
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
    const user = await env.jetchance_db.prepare(
      'SELECT id, email, password_hash, role FROM users WHERE email = ?'
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
    
    // Build user response with role-specific data
    let userData: any = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    if (user.role === 'customer') {
      const customerResult = await env.jetchance_db.prepare(
        'SELECT first_name, last_name FROM customers WHERE user_id = ?'
      ).bind(user.id).first();
      
      if (customerResult) {
        userData.firstName = customerResult.first_name;
        userData.lastName = customerResult.last_name;
      }
    } else if (user.role === 'operator') {
      const operatorResult = await env.jetchance_db.prepare(
        'SELECT company_name FROM operators WHERE user_id = ?'
      ).bind(user.id).first();
      
      if (operatorResult) {
        userData.companyName = operatorResult.company_name;
      }
    }
    
    const { accessToken, refreshToken } = generateTokens(user.id as string, env);
    
    return new Response(JSON.stringify({
      message: 'Login successful',
      user: userData,
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
