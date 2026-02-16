# jordanlyall.com — Sovereign Personal Node

## What This Is
Canonical publishing surface + agent-readable identity node.
Not a blog, not a marketing site. Long-term personal infrastructure.

## Stack
- Astro 5.x + TypeScript + MDX
- Vercel (hybrid output: static pages + dynamic API routes)
- Content Collections for notes/essays
- @astrojs/rss for feeds
- Inter font, plain CSS (no framework), sidebar nav layout

## Content Model
- Notes: fast (100-400 words), in src/content/notes/
- Essays: durable (800-2500 words), in src/content/essays/
- Topics: 3 hubs (generative-art, ai-agents, sovereign-systems)
- Every post MUST have: title, summary, publishDate, topic, related links

## Routes
- / (homepage)
- /writing/ (combined index)
- /notes/ and /notes/[slug]/
- /essays/ and /essays/[slug]/
- /topics/[topic]/
- /now/
- /work-with-me/
- /intake/proposal (form + API POST)

## Machine Layer
- /.well-known/*.json files in public/
- RSS feeds at /notes/rss.xml, /essays/rss.xml, /writing/rss.xml

## Design Direction
- Reference: brianlovin.com
- Sidebar navigation, card-based content lists
- Inter font family, mono for metadata/tags
- Light default with polished dark mode
- Clean, refined, intentional. CPO/builder/investor aesthetic.

## Key Principles
- Every post needs "Why this matters" summary
- Stable URLs -- never change slugs
- Internal linking between posts and topic hubs
- No premature optimization or monetization
- Human-in-the-loop for all write actions
- Safe DOM methods only (no innerHTML with untrusted content)
