// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="@vercel/og" />

import React from 'react';
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge'
};

const DEFAULT_TITLE = 'Crxanode Docs';
const DEFAULT_SUBTITLE = 'Validator Services & Guides';

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);

  const title = decodeURIComponent(searchParams.get('title') ?? DEFAULT_TITLE);
  const subtitle = decodeURIComponent(searchParams.get('subtitle') ?? DEFAULT_SUBTITLE);
  const badge = searchParams.get('badge');
  const hostHeader = req.headers.get('host') ?? 'docs.crxanode.me';
  const protocol = hostHeader.startsWith('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${hostHeader}`;
  const siteLogoUrl = `${baseUrl}/logo.png`;

  const rawChainSlug = searchParams.get('chain');
  const chainSlug = rawChainSlug ? rawChainSlug.toLowerCase().replace(/[^a-z0-9-]/g, '') : null;

  let chainLogoUrl: string | null = null;
  if (chainSlug) {
    const extensions = ['png', 'svg', 'jpg', 'jpeg', 'webp'];
    for (const ext of extensions) {
      const candidate = `https://explorer.crxanode.me/logos/${chainSlug}.${ext}`;
      try {
        const response = await fetch(candidate, { cache: 'no-store' });
        if (response.ok) {
          chainLogoUrl = candidate;
          if (response.body) {
            await response.body.cancel();
          }
          break;
        }
        if (response.body) {
          await response.body.cancel();
        }
      } catch {
        // ignore and try next extension
      }
    }
  }

  const badgeLabel = badge ? badge.toUpperCase() : null;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(145deg, #020617 0%, #0f172a 35%, #1f2937 100%)',
          color: '#e2e8f0',
          padding: '80px 100px',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: '24px',
                background: 'rgba(15,23,42,0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px',
                boxShadow: '0 24px 60px rgba(14,165,233,0.25)',
                border: '1px solid rgba(148, 163, 184, 0.25)'
              }}
            >
              <img
                src={siteLogoUrl}
                width={64}
                height={64}
                alt="Crxanode logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: 20, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#94a3b8' }}>
                Crxanode
              </span>
              <span style={{ fontSize: 32, fontWeight: 600, color: '#e2e8f0' }}>
                Validator Infrastructure
              </span>
            </div>
          </div>
          {chainLogoUrl ? (
            <div
              style={{
                width: 108,
                height: 108,
                borderRadius: '32px',
                background: 'rgba(15,23,42,0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                boxShadow: '0 24px 60px rgba(14,165,233,0.35)',
                border: '1px solid rgba(56, 189, 248, 0.35)'
              }}
            >
              <img
                src={chainLogoUrl}
                width={84}
                height={84}
                alt=""
                style={{ width: '84px', height: '84px', borderRadius: '24px', objectFit: 'cover' }}
              />
            </div>
          ) : null}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h1
            style={{
              fontSize: 68,
              lineHeight: 1.1,
              fontWeight: 700,
              color: '#f8fafc',
              margin: 0,
              textShadow: '0 10px 30px rgba(15,118,255,0.25)'
            }}
          >
            {title}
          </h1>
          <p style={{ fontSize: 32, lineHeight: 1.4, color: '#cbd5f5', margin: 0 }}>{subtitle}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#64748b', fontSize: 24 }}>
            <span>docs.crxanode.me</span>
            <span>Reliable Cosmos validator services & guides.</span>
          </div>
          {badgeLabel ? (
            <div
              style={{
                padding: '12px 28px',
                borderRadius: '9999px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                color: '#bae6fd',
                fontSize: 24,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.12em'
              }}
            >
              {badgeLabel}
            </div>
          ) : null}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}
