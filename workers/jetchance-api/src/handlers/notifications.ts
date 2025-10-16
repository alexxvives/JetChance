/**
 * Notifications Handlers - Cloudflare Workers
 */

import { corsHeaders } from '../middleware/cors';

export async function handleNotifications(
  request: Request,
  env: Env,
  path: string,
  user?: any
): Promise<Response> {
  try {
    if (!user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'Authentication required'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // GET /api/notifications - Get all notifications for current user
    if (request.method === 'GET' && path === '') {
      const notifications = await env.jetchance_db.prepare(
        `SELECT id, title, message, type, read_at, created_at 
         FROM notifications 
         WHERE user_id = ? 
         ORDER BY created_at DESC`
      ).bind(user.id).all();

      return new Response(JSON.stringify(notifications.results || []), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // POST /api/notifications/:id/read - Mark notification as read
    if (request.method === 'POST' && path.match(/^\/[^/]+\/read$/)) {
      const notificationId = path.split('/')[1];
      
      await env.jetchance_db.prepare(
        'UPDATE notifications SET read_at = datetime(\'now\') WHERE id = ? AND user_id = ?'
      ).bind(notificationId, user.id).run();

      return new Response(JSON.stringify({
        message: 'Notification marked as read'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // POST /api/notifications/mark-all-read - Mark all notifications as read
    if (request.method === 'POST' && path === '/mark-all-read') {
      await env.jetchance_db.prepare(
        'UPDATE notifications SET read_at = datetime(\'now\') WHERE user_id = ? AND read_at IS NULL'
      ).bind(user.id).run();

      return new Response(JSON.stringify({
        message: 'All notifications marked as read'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // DELETE /api/notifications/:id - Delete notification
    if (request.method === 'DELETE' && path.match(/^\/[^/]+$/)) {
      const notificationId = path.substring(1);
      
      await env.jetchance_db.prepare(
        'DELETE FROM notifications WHERE id = ? AND user_id = ?'
      ).bind(notificationId, user.id).run();

      return new Response(JSON.stringify({
        message: 'Notification deleted'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 404 for unknown notification routes
    return new Response(JSON.stringify({
      error: 'Not Found',
      message: `Notification route ${path} not found`
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Notifications handler error:', error);
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
