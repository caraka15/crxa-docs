import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge'
};

const DEFAULT_TITLE = 'Crxanode Docs';
const DEFAULT_SUBTITLE = 'Validator Services & Guides';

export default async function handler(req) {
  const { searchParams } = new URL(req.url);

  const title = decodeURIComponent(searchParams.get('title') ?? DEFAULT_TITLE);
  const subtitle = decodeURIComponent(searchParams.get('subtitle') ?? DEFAULT_SUBTITLE);
  const badge = searchParams.get('badge');

  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(145deg, #020617 0%, #0f172a 35%, #1f2937 100%)',
          color: '#e2e8f0',
          padding: '80px 100px',
          fontFamily: 'Inter, sans-serif'
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', gap: '16px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: 72,
                      height: 72,
                      borderRadius: '9999px',
                      background: 'radial-gradient(circle at 30% 30%, #38bdf8 0%, #0ea5e9 45%, #2563eb 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#f8fafc',
                      fontWeight: 700,
                      fontSize: 36,
                      boxShadow: '0 24px 60px rgba(14,165,233,0.35)'
                    },
                    children: 'CR'
                  }
                },
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column', gap: '6px' },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: { fontSize: 20, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#94a3b8' },
                          children: 'Crxanode'
                        }
                      },
                      {
                        type: 'span',
                        props: {
                          style: { fontSize: 32, fontWeight: 600, color: '#e2e8f0' },
                          children: 'Validator Infrastructure'
                        }
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: '24px' },
              children: [
                {
                  type: 'h1',
                  props: {
                    style: {
                      fontSize: 68,
                      lineHeight: 1.1,
                      fontWeight: 700,
                      color: '#f8fafc',
                      margin: 0,
                      textShadow: '0 10px 30px rgba(15,118,255,0.25)'
                    },
                    children: title
                  }
                },
                {
                  type: 'p',
                  props: {
                    style: { fontSize: 32, lineHeight: 1.4, color: '#cbd5f5', margin: 0 },
                    children: subtitle
                  }
                }
              ]
            }
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column', gap: '8px', color: '#64748b', fontSize: 24 },
                    children: [
                      { type: 'span', props: { children: 'docs.crxanode.me' } },
                      { type: 'span', props: { children: 'Reliable Cosmos validator services & guides.' } }
                    ]
                  }
                },
                badge
                  ? {
                      type: 'div',
                      props: {
                        style: {
                          padding: '12px 28px',
                          borderRadius: '9999px',
                          background: 'rgba(56, 189, 248, 0.15)',
                          border: '1px solid rgba(56, 189, 248, 0.35)',
                          color: '#bae6fd',
                          fontSize: 24,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.12em'
                        },
                        children: badge
                      }
                    }
                  : null
              ]
            }
          }
        ]
      }
    },
    {
      width: 1200,
      height: 630
    }
  );
}

