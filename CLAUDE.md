# jordanlyall.com -- Sovereign Personal Node

## What This Is
Canonical publishing surface + agent-readable identity node.
Not a blog, not a marketing site. Long-term personal infrastructure.
Serves two audiences: humans (clean reading experience) and AI agents (structured manifests, feeds, intake).

## Stack
- Astro 5.x + TypeScript + MDX
- Vercel (static pages + serverless API routes via `export const prerender = false`)
- Content Collections with Zod schemas and glob loader
- @astrojs/rss for feeds
- DM Sans + DM Mono (Google Fonts), plain CSS (no framework)
- No Astro `output` config needed -- static is default in Astro 5

## Content Model
- Notes: fast (100-400 words), in src/content/notes/
- Essays: durable (800-2500 words), in src/content/essays/
- Topics: 3 hubs defined in src/data/topics.ts (generative-art, ai-agents, sovereign-systems)
- Every post MUST have: title, summary, publishDate, topic, related links

## Routes
- / (homepage)
- /writing/ (combined index)
- /notes/ and /notes/[slug]/
- /essays/ and /essays/[slug]/
- /topics/[topic]/
- /now/
- /work-with-me/
- /intake/proposal/ (form + API POST)

## Machine Layer
- /.well-known/agent.json -- agent capabilities + discovery links
- /.well-known/profile.json -- structured identity
- /.well-known/feeds.json -- feed discovery
- /.well-known/now.json -- current state
- /.well-known/intake.json -- proposal schema
- /api/intake/proposal -- serverless POST endpoint (JSON validation)
- RSS feeds at /notes/rss.xml, /essays/rss.xml, /writing/rss.xml
- JSON-LD Person schema, OpenGraph, Twitter Cards, microformats (h-card, h-entry)

## Design Direction
- Reference: brianlovin.com
- Sidebar navigation (240px fixed, collapses on mobile at 768px)
- Card-based content lists
- DM Sans for body, DM Mono for metadata/tags
- Light default with dark mode (prefers-color-scheme)
- Warm neutral palette (#fafaf9 / #18181b light, #09090b / #fafaf9 dark)
- Clean, refined, intentional. CPO/builder/investor aesthetic.

## Writing Voice
- **MUST READ** `docs/voice-guide.md` before drafting or editing any content for the site
- Voice: Direct. Earned. Builder. Not a thought leader performing insight.
- tl;dr sections up front on longer pieces. Specific details, not abstractions.
- Never use AI-tell words (delve, robust, leverage, landscape, etc.) -- see full list in voice guide
- Jordan brings the thinking (specific observations, earned insights). Claude brings structure.
- If a note could have been written by anyone who read about the topic, it's not ready.

## Key Principles
- Every post needs "Why this matters" summary
- Stable URLs -- never change slugs
- Internal linking between posts and topic hubs
- No premature optimization or monetization
- Human-in-the-loop for all write actions
- Safe DOM methods only (no innerHTML with untrusted content)
- Density before product -- 6-12 months of publishing first

## Key Files
- src/layouts/Base.astro -- main layout with sidebar, JSON-LD, meta
- src/layouts/Post.astro -- post layout with h-entry microformat
- src/styles/global.css -- full design system (CSS custom properties)
- src/content.config.ts -- content collection schemas
- src/data/topics.ts -- topic hub definitions
- public/.well-known/ -- all agent manifests (static JSON)

## Deployment
- Vercel project: jordanlyall-com (scope: jordanlyalls-projects)
- GitHub: jordanlyall/jordanlyall.com
- Auto-deploys on push to main
- NEVER commit .vercel/ directory (causes prebuilt artifact issues)
- Domain DNS at GoDaddy (A record -> 76.76.21.21)

## Upcoming Work
- Groundskeeper site audit skill (plan at ~/.claude/plans/gentle-munching-stallman.md)
- Content seeding -- 8-12 more notes for density (target: 15 total)
- Design polish (typography, spacing, dark mode refinement)
- Full roadmap in Obsidian: 1-Projects/Current/sovereign-node-jordanlyall.md

## Recently Shipped
- Dynamic OG images via @vercel/og at /api/og (Feb 16)
- Slack notifications on intake proposals to #crew-main (Feb 16)
- Mobile layout fix + mobile footer (Feb 16)
- Vercel env note: use `process.env` for secrets in serverless, NOT `import.meta.env`
