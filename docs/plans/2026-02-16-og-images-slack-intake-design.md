# Design: Dynamic OG Images + Intake Slack Notifications

**Date**: 2026-02-16
**Status**: Approved

---

## Feature 1: Dynamic OG Images

### Problem
No `og:image` is set on any page. Social shares on X/Farcaster have no card image.

### Approach
`@vercel/og` edge function that generates 1200x630 PNG images on-the-fly from query params. Cached at the edge after first request.

### Architecture
- **New API route**: `src/pages/api/og.ts` (`prerender = false`)
- **Input**: Query params `?title=...&type=note|essay|page`
- **Output**: 1200x630 PNG
- **Caching**: Vercel edge cache (immutable content, long TTL)

### Design Spec
- Background: warm neutral matching site (`#fafaf9` light)
- Text: DM Sans (loaded via Google Fonts arraybuffer)
- Layout: Title (large), "jordanlyall.com" (small, bottom), purple accent bar (top, `#8119b7`)
- For posts: title + topic tag
- For static pages: page title + site tagline

### Integration Points
- `Base.astro`: Construct OG URL from page title and pass to `ogImage` prop (already wired)
- Individual pages: No changes needed (Base handles meta tags)
- Twitter card: Upgrade from `summary` to `summary_large_image`

---

## Feature 2: Intake -> Slack Notification

### Problem
Proposals submitted via `/intake/proposal/` are only logged to Vercel console. No notification reaches Jordan.

### Approach
Use the existing Crew Slack bot token (`SLACK_BOT_TOKEN`) to POST a Block Kit message to `#crew-main` via `https://slack.com/api/chat.postMessage`. Same pattern as Crew's drip feed script. No new npm dependencies.

### Architecture
- **Modified file**: `src/pages/api/intake/proposal.ts`
- **Auth**: `SLACK_BOT_TOKEN` Vercel env var (same token Crew agents use)
- **Channel**: `#crew-main` (by name)
- **Error handling**: Non-blocking. Slack failure doesn't reject the proposal. Errors logged to console.

### Message Format (Block Kit)
```
------------------------------------
:mailbox_with_mail: New Proposal
------------------------------------
*From:* [who]
*Why:* [why]
*What:* [what]
*Timing:* [timing]
*Email:* [email or "not provided"]
*Links:* [links or "none"]
------------------------------------
ID: prop_xxx | Received: [timestamp]
------------------------------------
```

### Env Vars Required
- `SLACK_BOT_TOKEN` — Added to Vercel project env vars (same xoxb- token from Crew)

---

## Out of Scope
- Slack interactive buttons on proposals (future)
- Per-post custom OG artwork (future)
- OG image for dark mode variant (unnecessary)
- Storing proposals in KV/database (future)
