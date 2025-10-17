/**
 * Email Handler
 * Handles email notifications (currently logs only - integrate with email service later)
 */

import { corsHeaders } from '../middleware/cors';

export async function handleEmail(
  request: Request,
  env: Env,
  path: string
): Promise<Response> {
  try {
    // POST /api/send-email - Send email notification
    if (request.method === 'POST' && path === '') {
      const body = await request.json();
      
      const {
        to,
        subject,
        html,
        from = 'noreply@jetchance.com'
      } = body;

      // Validation
      if (!to || !subject || !html) {
        return new Response(JSON.stringify({
          error: 'Missing required fields: to, subject, html'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // TODO: Integrate with actual email service (SendGrid, Mailgun, Resend, etc.)
      // For now, we'll log the email and return success
      
      console.log('📧 Email notification:', {
        to,
        subject,
        from,
        htmlLength: html.length,
        timestamp: new Date().toISOString()
      });

      // Store email log in database for tracking
      await env.jetchance_db.prepare(`
        INSERT INTO email_logs (
          recipient, subject, sent_at, status
        ) VALUES (?, ?, datetime('now'), 'pending')
      `).bind(to, subject).run();

      // In production, uncomment this to actually send emails:
      /*
      // Example with Resend API
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to,
          subject,
          html,
        }),
      });

      if (!resendResponse.ok) {
        throw new Error('Failed to send email');
      }
      */

      return new Response(JSON.stringify({
        success: true,
        message: 'Email queued for delivery',
        // In development, include the email content for debugging
        debug: env.ENVIRONMENT === 'development' ? { to, subject } : undefined
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
    console.error('Email handler error:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}
