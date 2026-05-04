export default {
  async fetch(request, env) {
    const url    = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    // CORS
    const allowed = [
      'http://localhost',
      'http://127.0.0.1',
      'https://yourpages.pages.dev', // Example for Cloudflare Pages
      'https://yourdomain.com', // Replace with your actual domain
      'https://www.yourdomain.com', // Replace with your actual domain
    ];

    const corsOrigin =
      !origin ||
      origin === 'null' ||
      allowed.some(o => origin.startsWith(o))
        ? origin || '*'
        : '';

    const corsHeaders = {
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Origin': corsOrigin,
    };

    // Router
    if (url.pathname === '/api/presence') {
      try {
        const res  = await fetch(`${env.LANYARD_API_URL}/v1/users/${env.DISCORD_ID}`);
        if (!res.ok) return jsonError(502, 'Lanyard returned a non-OK response', corsHeaders);
        const data = await res.json();
        return json(data, corsHeaders);
      } catch (err) {
        return jsonError(500, 'Failed to fetch presence', corsHeaders);
      }
    }

    if (url.pathname === '/api/nowplaying') {
      try {
        const lfmUrl = new URL('https://ws.audioscrobbler.com/2.0/');
        lfmUrl.searchParams.set('method',  'user.getrecenttracks');
        lfmUrl.searchParams.set('user',    env.LASTFM_USERNAME);
        lfmUrl.searchParams.set('api_key', env.LASTFM_API_KEY);
        lfmUrl.searchParams.set('format',  'json');
        lfmUrl.searchParams.set('limit',   '1');

        const res  = await fetch(lfmUrl.toString());
        if (!res.ok) return jsonError(502, 'Last.fm returned a non-OK response', corsHeaders);

        const data  = await res.json();
        const track = data?.recenttracks?.track?.[0];
        if (!track) return jsonError(404, 'No recent tracks found', corsHeaders);

        return json({
          nowPlaying: track['@attr']?.nowplaying === 'true',
          name:       track.name,
          artist:     track.artist['#text'],
          album:      track.album['#text'],
          art:        track.image?.find(i => i.size === 'medium')?.['#text'] || '',
          url:        track.url,
        }, corsHeaders);
      } catch (err) {
        return jsonError(500, 'Failed to fetch now playing', corsHeaders);
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  },
};

// Helpers
function json(data, headers = {}) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

function jsonError(status, message, headers = {}) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}