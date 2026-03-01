# OG Images + Slack Intake Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add dynamic per-page OG social card images and Slack notifications for intake proposals.

**Architecture:** OG images use `@vercel/og` as an Astro API route that renders JSX to 1200x630 PNG, cached at the edge. Slack notifications use a raw fetch to the Slack Web API with the existing Crew bot token, posted to #crew-main as a Block Kit message.

**Tech Stack:** @vercel/og, Astro API routes, Slack Web API (chat.postMessage), Vercel env vars

---

### Task 1: Install @vercel/og

**Files:**
- Modify: `package.json`

**Step 1: Install the package**

Run: `npm install @vercel/og`

**Step 2: Verify install**

Run: `npm ls @vercel/og`
Expected: Shows @vercel/og version

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @vercel/og for dynamic social card images"
```

---

### Task 2: Create OG image API route

**Files:**
- Create: `src/pages/api/og.ts`

**Step 1: Create the OG image endpoint**

```typescript
import { ImageResponse } from '@vercel/og';
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const title = url.searchParams.get('title') || 'Jordan Lyall';
  const subtitle = url.searchParams.get('subtitle') || 'Building and thinking about generative systems, AI agents, and sovereign infrastructure.';

  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#fafaf9',
          fontFamily: 'sans-serif',
          padding: '60px',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                backgroundColor: '#8119b7',
              },
              children: [],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                flex: 1,
                justifyContent: 'center',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: title.length > 40 ? '48px' : '56px',
                      fontWeight: 700,
                      color: '#18181b',
                      lineHeight: 1.2,
                      letterSpacing: '-0.025em',
                    },
                    children: title,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '24px',
                      color: '#71717a',
                      lineHeight: 1.5,
                      maxWidth: '900px',
                    },
                    children: subtitle.length > 120 ? subtitle.slice(0, 117) + '...' : subtitle,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '20px',
                      color: '#a1a1aa',
                      letterSpacing: '0.05em',
                    },
                    children: 'jordanlyall.com',
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
    },
  );
};
```

**Step 2: Test locally**

Run: `npm run dev`
Visit: `http://localhost:4321/api/og?title=Agents+Need+Surfaces&subtitle=AI+agents+have+nowhere+to+land`
Expected: 1200x630 PNG with title, subtitle, purple accent bar, jordanlyall.com footer

**Step 3: Commit**

```bash
git add src/pages/api/og.ts
git commit -m "feat: add dynamic OG image API route"
```

---

### Task 3: Wire OG images into Base.astro

**Files:**
- Modify: `src/layouts/Base.astro:7-17` (props + ogImage construction)
- Modify: `src/layouts/Base.astro:44` (og:image meta)
- Modify: `src/layouts/Base.astro:46` (twitter:card upgrade)

**Step 1: Update Base.astro to auto-generate OG URL**

In the frontmatter, after `const canonicalURL`, add OG URL construction:

```typescript
const ogImageUrl = ogImage || new URL(
  `/api/og?title=${encodeURIComponent(pageTitle)}&subtitle=${encodeURIComponent(description)}`,
  Astro.site
).toString();
```

Then update the meta tags:
- Line 44: Change `{ogImage && <meta ...>}` to always render: `<meta property="og:image" content={ogImageUrl} />`
- Line 46: Change `summary` to `summary_large_image` for the twitter:card
- Add `<meta name="twitter:image" content={ogImageUrl} />` after the twitter:description line

**Step 2: Build and verify meta tags**

Run: `npm run build`
Then check the built HTML: look for `og:image` meta tag in `dist/client/index.html`
Expected: `<meta property="og:image" content="https://jordanlyall.com/api/og?title=Jordan%20Lyall&subtitle=...">`

**Step 3: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "feat: wire OG image URL into all pages"
```

---

### Task 4: Pass OG metadata from Post.astro

**Files:**
- Modify: `src/layouts/Post.astro:33`

**Step 1: Update Post.astro to pass ogImage to Base**

Change line 33 from:
```astro
<Base title={title} description={summary}>
```
to:
```astro
<Base title={title} description={summary} ogImage={new URL(`/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(summary)}`, Astro.site).toString()}>
```

This gives posts their own title+summary on the social card instead of the page title format.

**Step 2: Build and verify**

Run: `npm run build`
Expected: Build succeeds, note pages have post-specific OG images

**Step 3: Commit**

```bash
git add src/layouts/Post.astro
git commit -m "feat: pass post-specific OG image from Post layout"
```

---

### Task 5: Add Slack notification to intake endpoint

**Files:**
- Modify: `src/pages/api/intake/proposal.ts`

**Step 1: Add Slack notification function and call it after logging**

Add this function before the `POST` handler:

```typescript
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
```

Then after line 91 (`console.log`), add:

```typescript
  // Notify Slack (non-blocking -- don't await in response path)
  notifySlack(proposal);
```

Note: We fire-and-forget intentionally. The proposal response returns immediately; Slack notification happens in the background. Vercel keeps the function alive long enough for the fetch to complete.

**Step 2: Build and verify**

Run: `npm run build`
Expected: Build succeeds with no type errors

**Step 3: Commit**

```bash
git add src/pages/api/intake/proposal.ts
git commit -m "feat: notify #crew-main on new intake proposals"
```

---

### Task 6: Add SLACK_BOT_TOKEN to Vercel env vars

**Step 1: Get the bot token**

The token is the same `SLACK_BOT_TOKEN` (xoxb-...) used by Crew agents. It's stored in `~/Projects/crew/.env`.

Run: `grep SLACK_BOT_TOKEN ~/Projects/crew/.env`

**Step 2: Add to Vercel**

Run: `npx vercel env add SLACK_BOT_TOKEN production`

Paste the token value when prompted. This makes it available as `import.meta.env.SLACK_BOT_TOKEN` in the serverless function.

**Step 3: Verify env var is set**

Run: `npx vercel env ls`
Expected: Shows `SLACK_BOT_TOKEN` for production

---

### Task 7: Deploy and verify end-to-end

**Step 1: Push all commits**

Run: `git push origin main`

**Step 2: Verify OG image**

After Vercel deploys, visit: `https://jordanlyall.com/api/og?title=Test`
Expected: PNG image renders with "Test" title

**Step 3: Verify OG meta tags**

Run: `curl -s https://jordanlyall.com/ | grep 'og:image'`
Expected: `<meta property="og:image" content="https://jordanlyall.com/api/og?title=...">`

**Step 4: Test Slack notification**

Submit a test proposal via the form at `/intake/proposal/` or via curl:

```bash
curl -X POST https://jordanlyall.com/api/intake/proposal \
  -H 'Content-Type: application/json' \
  -d '{"who":"Test User","why":"Testing Slack integration","what":"Verify notification arrives","timing":"Now"}'
```

Expected: Message appears in `#crew-main` with proposal details.

**Step 5: Verify social card preview**

Paste `https://jordanlyall.com/` into the Twitter Card Validator or share on X to confirm the card renders.
