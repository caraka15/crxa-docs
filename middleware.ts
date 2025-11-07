// Edge Middleware to inject OG <meta> tags into the served HTML for the Vite SPA on Vercel.
// Strategy:
// - Untuk permintaan dokumen HTML, middleware mengambil respons upstream dan menyisipkan OG tags
//   di dekat placeholder di index.html sebelum dikirim.
// - Skrip inline di index.html tetap menjaga OG tags saat navigasi client-side, tetapi crawler
//   sudah menerima OG tags langsung di HTML awal.

export const config = {
  matcher: ['/((?!api|assets|static|build|dist|images|fonts|_next|favicon.ico|robots.txt|sitemap.xml|sw.js).*)'],
};

type NormalizedMeta = {
  title?: string;
  description?: string;
  canonical?: string;
  siteName?: string;
  robots?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogLocale?: string;
  ogImageType?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: Array<Record<string, unknown>>;
};

const SITE_NAME = 'Crxanode Docs';
const SITE_TAGLINE = 'Validator infrastructure & guides for Cosmos SDK chains.';
const DEFAULT_DESCRIPTION =
  'Comprehensive documentation for Crxanode validator services: API endpoints, node setup guides, snapshots, and infrastructure best practices for Cosmos SDK chains.';
const DEFAULT_OG_IMAGE =
  '/api/og?title=Crxanode%20Docs&subtitle=Validator%20infrastructure%20%26%20guides%20for%20Cosmos%20SDK%20chains.';
const DEFAULT_OG_LOCALE = 'en_US';
const DEFAULT_OG_IMAGE_TYPE = 'image/png';
const CHAIN_NAME_OVERRIDES: Record<string, string> = {
  safrochain: 'SAFROCHAIN',
  paxi: 'PAXI',
};

const HOME_KEYWORDS = [
  'crxanode',
  'cosmos validator documentation',
  'validator service',
  'cosmos node guide',
  'rpc endpoints',
  'snapshot service',
];

const withSiteName = (title?: string) => (title ? `${title} | ${SITE_NAME}` : SITE_NAME);

const formatChainName = (slug: string) =>
  slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const createOgImagePath = (
  title: string,
  subtitle: string,
  options: { chainSlug?: string; badge?: string } = {},
) => {
  const params = new URLSearchParams();
  params.set('title', title);
  params.set('subtitle', subtitle);
  if (options.chainSlug) params.set('chain', options.chainSlug);
  if (options.badge) params.set('badge', options.badge);
  return `/api/og?${params.toString()}`;
};

const getHomeMeta = (): NormalizedMeta => {
  const rawTitle = 'Crxa Validator Documentation';
  const title = withSiteName(rawTitle);
  const description = DEFAULT_DESCRIPTION;
  const ogTitle = `${SITE_NAME} - ${rawTitle}`;
  const ogImage = createOgImagePath(rawTitle, SITE_TAGLINE);
  const structuredData: Array<Record<string, unknown>> = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: '/',
      description,
      logo: '/logo.png',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: '/',
      description,
    },
  ];

  return {
    title,
    description,
    canonical: '/',
    siteName: SITE_NAME,
    ogTitle,
    ogDescription: description,
    ogImage,
    ogType: 'website',
    ogLocale: DEFAULT_OG_LOCALE,
    ogImageType: DEFAULT_OG_IMAGE_TYPE,
    twitterCard: 'summary_large_image',
    twitterTitle: ogTitle,
    twitterDescription: description,
    twitterImage: ogImage,
    keywords: HOME_KEYWORDS,
    structuredData,
  };
};

const getLicenseMeta = (): NormalizedMeta => {
  const rawTitle = 'Service License';
  const title = withSiteName(rawTitle);
  const description = 'CRXANODE service and documentation license terms.';

  return {
    title,
    description,
    canonical: '/license',
    siteName: SITE_NAME,
    ogTitle: title,
    ogDescription: description,
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    ogLocale: DEFAULT_OG_LOCALE,
    ogImageType: DEFAULT_OG_IMAGE_TYPE,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: DEFAULT_OG_IMAGE,
    robots: 'noindex, nofollow',
  };
};

const buildServiceMeta = (slug: string): NormalizedMeta => {
  const chainDisplay = CHAIN_NAME_OVERRIDES[slug] ?? formatChainName(slug);
  const rawTitle = `${chainDisplay} Service`;
  const title = withSiteName(chainDisplay ? rawTitle : 'Validator Service');
  const description = chainDisplay
    ? `Access RPC, API, gRPC, peer, snapshot, and validator resources for ${chainDisplay} provided by Crxanode.`
    : 'Browse Crxanode validator endpoints: RPC, API, gRPC, snapshots, and infrastructure resources for Cosmos SDK networks.';
  const ogTitle = chainDisplay
    ? `${chainDisplay} Service Endpoints`
    : 'Validator Service Endpoints';
  const ogSubtitle = chainDisplay
    ? 'RPC, API, gRPC, peers, and snapshots by Crxanode'
    : 'Crxanode infrastructure endpoints for Cosmos SDK chains';
  const ogImage = createOgImagePath(ogTitle, ogSubtitle, { chainSlug: slug, badge: 'SERVICE' });

  return {
    title,
    description,
    canonical: `/${slug}/service`,
    siteName: SITE_NAME,
    ogTitle,
    ogLocale: DEFAULT_OG_LOCALE,
    ogImageType: DEFAULT_OG_IMAGE_TYPE,
    ogDescription: description,
    ogImage,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: ogTitle,
    twitterDescription: description,
    twitterImage: ogImage,
  };
};

const buildGuideMeta = (slug: string): NormalizedMeta => {
  const chainDisplay = CHAIN_NAME_OVERRIDES[slug] ?? formatChainName(slug);
  const rawTitle = chainDisplay ? `${chainDisplay} Guide` : 'Validator Guide';
  const title = withSiteName(rawTitle);
  const description = chainDisplay
    ? `Follow Crxanode's end-to-end guide for ${chainDisplay}: node installation, validator configuration, RPC/API endpoints, snapshots, and operations checklists.`
    : "Explore Crxanode validator guides: node installation, validator configuration, and best practices for Cosmos SDK networks.";
  const ogTitle = rawTitle;
  const ogSubtitle = chainDisplay
    ? 'Step-by-step validator operations with Crxanode'
    : 'Infrastructure documentation by Crxanode';
  const ogImage = createOgImagePath(ogTitle, ogSubtitle, { chainSlug: slug, badge: 'GUIDE' });

  return {
    title,
    description,
    canonical: `/${slug}/guide`,
    siteName: SITE_NAME,
    ogTitle,
    ogLocale: DEFAULT_OG_LOCALE,
    ogImageType: DEFAULT_OG_IMAGE_TYPE,
    ogDescription: description,
    ogImage,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: ogTitle,
    twitterDescription: description,
    twitterImage: ogImage,
  };
};

const getFallbackMeta = (pathname: string): NormalizedMeta => {
  const canonical = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const title = withSiteName();
  return {
    title,
    description: DEFAULT_DESCRIPTION,
    canonical,
    siteName: SITE_NAME,
    ogTitle: title,
    ogDescription: DEFAULT_DESCRIPTION,
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    ogLocale: DEFAULT_OG_LOCALE,
    ogImageType: DEFAULT_OG_IMAGE_TYPE,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: DEFAULT_DESCRIPTION,
    twitterImage: DEFAULT_OG_IMAGE,
  };
};

function chooseMeta(pathname: string): NormalizedMeta | null {
  if (!pathname) return null;

  let normalized = pathname;
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  if (normalized === '') normalized = '/';

  switch (normalized) {
    case '/':
      return getHomeMeta();
    case '/license':
      return getLicenseMeta();
    default:
      break;
  }

  const serviceMatch = normalized.match(/^\/([^/]+)\/service$/);
  if (serviceMatch) {
    return buildServiceMeta(serviceMatch[1]);
  }

  const guideMatch = normalized.match(/^\/([^/]+)\/guide$/);
  if (guideMatch) {
    return buildGuideMeta(guideMatch[1]);
  }

  return getFallbackMeta(normalized);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJsonForHtml(json: string) {
  return json.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

function buildInjection(meta: NormalizedMeta, req: Request): string {
  const url = new URL(req.url);
  const origin = url.origin;
  const abs = (url?: string) => {
    if (!url) return undefined;
    if (/^https?:\/\//i.test(url)) return url;
    const normalized = url.startsWith('/') ? url : `/${url}`;
    return origin + normalized;
  };
  const absolutize = (value: unknown): unknown => {
    if (typeof value === 'string') {
      return abs(value) ?? value;
    }
    if (Array.isArray(value)) {
      return value.map((item) => absolutize(item));
    }
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, val]) => [
          key,
          absolutize(val),
        ]),
      );
    }
    return value;
  };

  const title = meta.title ? escapeHtml(meta.title) : undefined;
  const description = meta.description ? escapeHtml(meta.description) : undefined;
  const siteName = meta.siteName ? escapeHtml(meta.siteName) : undefined;
  const canonical = abs(meta.canonical ?? url.pathname);
  const canonicalEscaped = canonical ? escapeHtml(canonical) : undefined;

  const ogTitleRaw = meta.ogTitle ?? meta.title;
  const ogDescriptionRaw = meta.ogDescription ?? meta.description;
  const ogTypeRaw = meta.ogType ?? 'website';
  const ogImageAbs = abs(meta.ogImage);

  const ogTitle = ogTitleRaw ? escapeHtml(ogTitleRaw) : undefined;
  const ogDescription = ogDescriptionRaw ? escapeHtml(ogDescriptionRaw) : undefined;
  const ogType = ogTypeRaw ? escapeHtml(ogTypeRaw) : undefined;
  const ogImage = ogImageAbs ? escapeHtml(ogImageAbs) : undefined;
  const ogLocale = meta.ogLocale ? escapeHtml(meta.ogLocale) : undefined;
  const ogImageType = meta.ogImageType ? escapeHtml(meta.ogImageType) : undefined;

  const twitterCard = meta.twitterCard || 'summary_large_image';
  const twitterTitleRaw = meta.twitterTitle ?? ogTitleRaw ?? meta.title;
  const twitterDescriptionRaw = meta.twitterDescription ?? ogDescriptionRaw ?? meta.description;
  const twitterImageAbs = abs(meta.twitterImage ?? meta.ogImage);
  const twitterTitle = twitterTitleRaw ? escapeHtml(twitterTitleRaw) : undefined;
  const twitterDescription = twitterDescriptionRaw ? escapeHtml(twitterDescriptionRaw) : undefined;
  const twitterImage = twitterImageAbs ? escapeHtml(twitterImageAbs) : undefined;

  const keywordsValue =
    meta.keywords && meta.keywords.length > 0 ? escapeHtml(meta.keywords.join(', ')) : undefined;
  const robots = meta.robots ? escapeHtml(meta.robots) : undefined;

  const tags = [
    title && `<title>${title}</title>`,
    description && `<meta name="description" content="${description}">`,
    siteName && `<meta property="og:site_name" content="${siteName}">`,
    ogTitle && `<meta property="og:title" content="${ogTitle}">`,
    ogDescription && `<meta property="og:description" content="${ogDescription}">`,
    ogType && `<meta property="og:type" content="${ogType}">`,
    canonicalEscaped && `<link rel="canonical" href="${canonicalEscaped}">`,
    canonicalEscaped && `<meta property="og:url" content="${canonicalEscaped}">`,
    ogImage && `<meta property="og:image" content="${ogImage}">`,
    ogImage && `<meta property="og:image:width" content="1200">`,
    ogImage && `<meta property="og:image:height" content="630">`,
    ogImageType && `<meta property="og:image:type" content="${ogImageType}">`,
    ogLocale && `<meta property="og:locale" content="${ogLocale}">`,
    twitterCard && `<meta name="twitter:card" content="${twitterCard}">`,
    twitterTitle && `<meta name="twitter:title" content="${twitterTitle}">`,
    twitterDescription && `<meta name="twitter:description" content="${twitterDescription}">`,
    twitterImage && `<meta name="twitter:image" content="${twitterImage}">`,
    canonicalEscaped && `<meta name="twitter:url" content="${canonicalEscaped}">`,
    keywordsValue && `<meta name="keywords" content="${keywordsValue}">`,
    robots && `<meta name="robots" content="${robots}">`,
  ];

  const structured = (meta.structuredData ?? []).map((entry) => {
    const expanded = absolutize(entry) as Record<string, unknown>;
    const json = escapeJsonForHtml(JSON.stringify(expanded));
    return `<script type="application/ld+json">${json}</script>`;
  });

  const allTags = tags
    .filter(Boolean)
    .concat(structured)
    .join('\n');

  return `\n<!-- OG INJECT START -->\n${allTags}\n<!-- OG INJECT END -->\n`;
}

export default async function middleware(req: Request) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  const accept = req.headers.get('accept') || '';
  const isDocument =
    !accept ||
    accept.includes('text/html') ||
    accept === '*/*' ||
    accept.includes('*/*');
  if (!isDocument) return fetch(req);

  const meta = chooseMeta(pathname);
  if (!meta) return fetch(req);

  const res = await fetch(req);
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return res;

  const html = await res.text();

  const injection = buildInjection(meta, req);
  let transformed = html;
  const placeholder = '<!--__OG_META_INJECTION__-->';
  if (html.includes(placeholder)) {
    transformed = html.replace(placeholder, `${placeholder}${injection}`);
  } else {
    transformed = html.replace('</head>', `${injection}</head>`);
  }

  const headers = new Headers(res.headers);
  headers.delete('content-encoding');
  headers.set('content-type', 'text/html; charset=utf-8');
  const length = new TextEncoder().encode(transformed).length.toString();
  headers.set('content-length', length);

  return new Response(transformed, {
    status: res.status,
    headers,
  });
}
