import { promises as fs } from 'node:fs';
import path from 'node:path';

// Config
const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, 'src');
const CHAINS_SERVICE_DIR = path.join(SRC_DIR, 'chains', 'service');
const CHAINS_GUIDE_DIR = path.join(SRC_DIR, 'chains', 'guide');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'sitemap.xml');
const ROBOTS_FILE = path.join(PUBLIC_DIR, 'robots.txt');

// Base URL for absolute links in sitemap. Set via env for production deploys.
const SITE_BASE_URL = (process.env.SITE_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
const PING_SITEMAP = /^1|true$/i.test(String(process.env.PING_SITEMAP || ''));

async function readSlugsFromDir(dir, exts) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && exts.includes(path.extname(e.name).toLowerCase()))
      .map((e) => path.basename(e.name, path.extname(e.name)));
  } catch (err) {
    // Directory might not exist; treat as empty
    return [];
  }
}

function formatDate(date = new Date()) {
  // YYYY-MM-DD
  return date.toISOString().split('T')[0];
}

function url(loc, { lastmod, changefreq, priority } = {}) {
  const parts = [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    typeof priority === 'number' ? `    <priority>${priority.toFixed(1)}</priority>` : null,
    '  </url>',
  ].filter(Boolean);
  return parts.join('\n');
}

async function generate() {
  const today = formatDate();

  // Discover slugs from filesystem, aligned with how the app loads content
  const serviceSlugs = await readSlugsFromDir(CHAINS_SERVICE_DIR, ['.json']);
  const guideSlugs = new Set(await readSlugsFromDir(CHAINS_GUIDE_DIR, ['.md']));

  // Core static routes
  const entries = [
    url(`${SITE_BASE_URL}/`, { lastmod: today, changefreq: 'weekly', priority: 1.0 }),
    url(`${SITE_BASE_URL}/license`, { lastmod: today, changefreq: 'yearly', priority: 0.4 }),
  ];

  // Dynamic per-chain routes
  for (const slug of serviceSlugs.sort()) {
    entries.push(
      url(`${SITE_BASE_URL}/${slug}/service`, { lastmod: today, changefreq: 'daily', priority: 0.8 })
    );
    if (guideSlugs.has(slug)) {
      entries.push(
        url(`${SITE_BASE_URL}/${slug}/guide`, { lastmod: today, changefreq: 'weekly', priority: 0.6 })
      );
    }
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');

  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  await fs.writeFile(OUTPUT_FILE, xml, 'utf8');
  console.log(`Generated sitemap: ${OUTPUT_FILE}`);

  // Ensure robots.txt contains a single Sitemap line with absolute URL
  const sitemapUrl = `${SITE_BASE_URL}/sitemap.xml`;
  let robotsContent = '';
  try {
    robotsContent = await fs.readFile(ROBOTS_FILE, 'utf8');
  } catch (_) {
    robotsContent = 'User-agent: *\nAllow: /\n';
  }
  const lines = robotsContent
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0 && !/^sitemap\s*:/i.test(l));
  lines.push(`Sitemap: ${sitemapUrl}`);
  const newRobots = lines.join('\n') + '\n';
  await fs.writeFile(ROBOTS_FILE, newRobots, 'utf8');
  console.log(`Updated robots: ${ROBOTS_FILE}`);

  // Optionally notify search engines about updated sitemap
  if (PING_SITEMAP) {
    const sitemapUrlEnc = encodeURIComponent(sitemapUrl);
    const targets = [
      `https://www.google.com/ping?sitemap=${sitemapUrlEnc}`,
      `https://www.bing.com/ping?sitemap=${sitemapUrlEnc}`,
    ];
    for (const t of targets) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(t, { signal: controller.signal });
        clearTimeout(timeout);
        console.log(`Pinged: ${t} -> ${res.status}`);
      } catch (e) {
        console.warn(`Ping failed: ${t}`, e?.message || e);
      }
    }
  }
}

generate().catch((err) => {
  console.error('Failed to generate sitemap:', err);
  process.exit(1);
});
