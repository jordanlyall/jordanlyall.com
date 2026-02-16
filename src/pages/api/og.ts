import type { APIRoute } from 'astro';
import { ImageResponse } from '@vercel/og';

export const prerender = false;

const DEFAULT_TITLE = 'Jordan Lyall';
const DEFAULT_SUBTITLE =
  'Building and thinking about generative systems, AI agents, and sovereign infrastructure.';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const title = url.searchParams.get('title') || DEFAULT_TITLE;
  const rawSubtitle = url.searchParams.get('subtitle') || DEFAULT_SUBTITLE;
  const subtitle =
    rawSubtitle.length > 120 ? rawSubtitle.slice(0, 117) + '...' : rawSubtitle;

  const titleFontSize = title.length > 40 ? 48 : 56;

  const html = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: '#fafaf9',
        position: 'relative',
      },
      children: [
        // Purple accent bar
        {
          type: 'div',
          props: {
            style: {
              width: '100%',
              height: '6px',
              backgroundColor: '#8119b7',
            },
          },
        },
        // Main content area
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              flexGrow: 1,
              padding: '60px',
              paddingTop: '0px',
              paddingBottom: '0px',
            },
            children: [
              // Title
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: `${titleFontSize}px`,
                    fontWeight: 700,
                    color: '#18181b',
                    letterSpacing: '-0.025em',
                    lineHeight: 1.2,
                  },
                  children: title,
                },
              },
              // Subtitle
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '24px',
                    color: '#71717a',
                    marginTop: '16px',
                    lineHeight: 1.5,
                  },
                  children: subtitle,
                },
              },
            ],
          },
        },
        // Footer
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              padding: '60px',
              paddingTop: '0px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '20px',
                    color: '#a1a1aa',
                  },
                  children: 'jordanlyall.com',
                },
              },
            ],
          },
        },
      ],
    },
  };

  return new ImageResponse(html, {
    width: 1200,
    height: 630,
  });
};
