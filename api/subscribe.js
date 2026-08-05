export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email } = req.body || {};

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address required' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.OWNER_NOTIFY_EMAIL || 'notification@vizion-apollo.com';

  const welcomeHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #121212; color: #faf8f5; margin: 0; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 20px; border: 1px solid rgba(232, 141, 90, 0.3); padding: 40px; text-align: center; }
        .badge { display: inline-block; background-color: rgba(232, 141, 90, 0.15); color: #e88d5a; font-family: monospace; font-size: 12px; padding: 6px 14px; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
        h1 { font-size: 32px; font-weight: 300; margin-bottom: 16px; color: #faf8f5; }
        p { font-size: 16px; line-height: 1.6; color: rgba(250, 248, 245, 0.75); margin-bottom: 24px; }
        .btn { display: inline-block; background-color: #e88d5a; color: #121212; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-size: 14px; margin-top: 10px; }
        .footer { margin-top: 40px; font-size: 12px; color: rgba(250, 248, 245, 0.4); border-top: 1px solid rgba(250, 248, 245, 0.1); padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="badge">Welcome to Vizion</div>
        <h1>You're on the list!</h1>
        <p>Thank you for subscribing to updates for <strong>Vizion Apollo</strong> — the world's first smart eyewear that translates sign language in real-time onto your lens.</p>
        <p>We'll keep you posted with early access invitations, launch announcements, and developer behind-the-scenes insights.</p>
        <a href="https://vizion-ar-smart-glasses.vercel.app/" class="btn">Explore Apollo Demo</a>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Vizion, Inc. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  if (!apiKey) {
    console.log(`[SUBSCRIBE SIMULATED] Email subscribed: ${email}. Add RESEND_API_KEY in Vercel to send real emails.`);
    return res.status(200).json({
      success: true,
      simulated: true,
      message: 'Subscribed successfully (Simulated mode — add RESEND_API_KEY in Vercel to send live emails).'
    });
  }

  try {
    // Send Welcome Email to subscriber
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Vizion Apollo <onboarding@resend.dev>',
        to: [email],
        subject: 'Welcome to Vizion Apollo — Smart Glasses Updates',
        html: welcomeHtml,
      }),
    });

    const data = await resendRes.json();

    if (!resendRes.ok) {
      console.error('[RESEND API ERROR]', data);
      return res.status(500).json({ error: data.message || 'Failed to send email via Resend' });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error('[SUBSCRIBE SERVER ERROR]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
