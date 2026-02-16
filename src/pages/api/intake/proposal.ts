import type { APIRoute } from 'astro';

export const prerender = false;

const REQUIRED_FIELDS = ['who', 'why', 'what', 'timing'] as const;
const MAX_FIELD_LENGTH = 5000;
const MAX_LINKS = 10;

function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `prop_${ts}_${rand}`;
}

export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'Content-Type must be application/json' }), {
      status: 415,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate required fields
  for (const field of REQUIRED_FIELDS) {
    const val = body[field];
    if (typeof val !== 'string' || val.trim().length === 0) {
      return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (val.length > MAX_FIELD_LENGTH) {
      return new Response(JSON.stringify({ error: `Field "${field}" exceeds ${MAX_FIELD_LENGTH} characters` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Validate optional email
  if (body.email !== undefined) {
    if (typeof body.email !== 'string' || (body.email && !body.email.includes('@'))) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Validate optional links
  if (body.links !== undefined) {
    if (!Array.isArray(body.links)) {
      return new Response(JSON.stringify({ error: 'Links must be an array of URLs' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (body.links.length > MAX_LINKS) {
      return new Response(JSON.stringify({ error: `Maximum ${MAX_LINKS} links allowed` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  const id = generateId();

  const proposal = {
    id,
    received: new Date().toISOString(),
    who: (body.who as string).trim(),
    why: (body.why as string).trim(),
    what: (body.what as string).trim(),
    timing: (body.timing as string).trim(),
    email: body.email ? (body.email as string).trim() : undefined,
    links: body.links || undefined,
  };

  // Log for now -- replace with storage later (KV, email forward, etc.)
  console.log('[intake/proposal]', JSON.stringify(proposal));

  return new Response(JSON.stringify({ id, status: 'received' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
