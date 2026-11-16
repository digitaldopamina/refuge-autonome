export async function onRequestPost(context) {
  const { request, env } = context;

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
    if (!apiKey) {
      console.error('SYSTEME_IO_API_KEY not set');
      return Response.redirect(new URL('/merci', request.url).toString(), 302);
    }

    // Add contact to Systeme.io
    const res = await fetch('https://api.systeme.io/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        email,
        fields: [],
        tags: ['refuge-autonome'],
      }),
    });

    if (!res.ok && res.status !== 409) {
      // 409 = contact already exists, that's fine
      const body = await res.text();
      console.error('Systeme.io error:', res.status, body);
    }

    // Always redirect to merci page
    return Response.redirect(new URL('/merci', request.url).toString(), 302);
  } catch (err) {
    console.error('newsletter function error:', err);
    return Response.redirect(new URL('/merci', request.url).toString(), 302);
  }
}
