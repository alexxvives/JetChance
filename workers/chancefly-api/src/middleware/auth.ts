/**
 * Authentication middleware for Cloudflare Workers
 */

import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface AuthResult {
  user?: AuthUser;
  error?: string;
}

export async function authenticate(request: Request, env: Env): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Authorization header required' };
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return { error: 'Access token required' };
    }

    // Get JWT secret from environment (we'll set this as a secret later)
    const jwtSecret = env.JWT_SECRET || 'fallback-secret-for-development';

    try {
      const decoded = jwt.verify(token, jwtSecret) as { userId: string };
      
      if (!decoded.userId) {
        return { error: 'Invalid token payload' };
      }

      // Get user from database
      const userQuery = await env.chancefly_db.prepare(
        'SELECT id, email, role FROM users WHERE id = ?'
      ).bind(decoded.userId).first();

      if (!userQuery) {
        return { error: 'User not found' };
      }

      const user: AuthUser = {
        id: userQuery.id as string,
        email: userQuery.email as string,
        first_name: '', // Will be populated from role-specific table if needed
        last_name: '', // Will be populated from role-specific table if needed
        role: userQuery.role as string,
      };

      // Add role-specific data if needed (for future use)
      if (userQuery.role === 'customer') {
        const customerQuery = await env.chancefly_db.prepare(
          'SELECT first_name, last_name FROM customers WHERE user_id = ?'
        ).bind(decoded.userId).first();
        
        if (customerQuery) {
          user.first_name = customerQuery.first_name as string;
          user.last_name = customerQuery.last_name as string;
        }
      } else if (userQuery.role === 'operator') {
        const operatorQuery = await env.chancefly_db.prepare(
          'SELECT company_name FROM operators WHERE user_id = ?'
        ).bind(decoded.userId).first();
        
        if (operatorQuery) {
          // For operators, we could use company_name as display name
          user.first_name = operatorQuery.company_name as string;
          user.last_name = '';
        }
      }

      return { user };

    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return { error: 'Invalid or expired token' };
    }

  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'Authentication failed' };
  }
}

export function generateTokens(userId: string, env: Env) {
  const jwtSecret = env.JWT_SECRET || 'fallback-secret-for-development';
  const jwtRefreshSecret = env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-for-development';

  const accessToken = jwt.sign(
    { userId },
    jwtSecret,
    { expiresIn: '7d' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    jwtRefreshSecret,
    { expiresIn: '30d' }
  );
  
  return { accessToken, refreshToken };
}