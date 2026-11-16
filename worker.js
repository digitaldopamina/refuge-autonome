export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle newsletter form submission
    if (url.pathname === '/newsletter' && request.method === 'POST') {
      try {
        const formData = await request.formData();
        const email = (formData.get('email') || '').trim().toLowerCase();

        if (!email || !email.includes('@')) {
          return new Response(JSON.stringify({ error: 'Email invalide' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const apiKey = env.SYSTEME_IO_API_KEY;
        if (apiKey) {
          const res = await fetch('https://api.systeme.io/api/contacts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': apiKey,
            },
            body: JSON.stringify({ email, fields: [], tags: ['refuge-autonome'] }),
          });
          if (!res.ok && res.status !== 409) {
            const body = await res.text();
            console.error('Systeme.io error:', res.status, body);
          }
        } else {
          console.error('SYSTEME_IO_API_KEY not set');
        }

        return Response.redirect(new URL('/merci', request.url).toString(), 302);
      } catch (err) {
        console.error('newsletter handler error:', err);
        return Response.redirect(new URL('/merci', request.url).toString(), 302);
      }
    }

    // Serve static assets for all other requests
    return env.ASSETS.fetch(request);
  },
};
