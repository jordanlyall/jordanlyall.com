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

async function notifySlack(proposal: Record<string, unknown>): Promise<void> {
  const token = import.meta.env.SLACK_BOT_TOKEN;
  if (!token) {
    console.warn('[intake/proposal] SLACK_BOT_TOKEN not set, skipping notification');
    return;
  }

  const blocks = [
    {
      type: 'header',
      text: { type: 'plain_text', text: ':mailbox_with_mail: New Proposal', emoji: true },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*From:*\n${proposal.who}` },
        { type: 'mrkdwn', text: `*Timing:*\n${proposal.timing}` },
      ],
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*Why:*\n${proposal.why}` },
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*What:*\n${proposal.what}` },
    },
    ...(proposal.email || proposal.links ? [{
      type: 'section',
      fields: [
        ...(proposal.email ? [{ type: 'mrkdwn' as const, text: `*Email:*\n${proposal.email}` }] : []),
        ...(proposal.links ? [{ type: 'mrkdwn' as const, text: `*Links:*\n${(proposal.links as string[]).join('\n')}` }] : []),
      ],
    }] : []),
    {
      type: 'context',
      elements: [
        { type: 'mrkdwn', text: `ID: \`${proposal.id}\` | ${proposal.received}` },
      ],
    },
  ];

  try {
    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        channel: 'crew-main',
        blocks,
        text: `New proposal from ${proposal.who}: ${proposal.what}`,
        username: 'jordanlyall.com',
        icon_emoji: ':globe_with_meridians:',
        unfurl_links: false,
      }),
    });
    const data = await res.json() as { ok: boolean; error?: string };
    if (!data.ok) {
      console.error('[intake/proposal] Slack error:', data.error);
    }
  } catch (err) {
    console.error('[intake/proposal] Slack notification failed:', err);
  }
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

  // Notify Slack (fire-and-forget, non-blocking)
  notifySlack(proposal);

  return new Response(JSON.stringify({ id, status: 'received' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
