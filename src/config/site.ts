const DEFAULT_SITE_URL = 'https://docs.crxanode.me';

const resolveSiteUrl = (): string => {
  let envUrl: string | undefined;
  if (typeof import.meta !== 'undefined') {
    envUrl =
      (import.meta.env?.VITE_SITE_BASE_URL as string | undefined) ||
      (import.meta.env?.SITE_BASE_URL as string | undefined);
  }

  if (!envUrl && typeof process !== 'undefined') {
    envUrl = process.env.VITE_SITE_BASE_URL || process.env.SITE_BASE_URL || undefined;
  }

  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }

  return DEFAULT_SITE_URL;
};

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = 'Crxanode Docs';
export const SITE_TAGLINE = 'Validator infrastructure & guides for Cosmos SDK chains.';
export const DEFAULT_DESCRIPTION = 'Comprehensive documentation for Crxanode validator services: API endpoints, node setup guides, snapshots, and infrastructure best practices for Cosmos SDK chains.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/api/og?title=${encodeURIComponent(SITE_NAME)}&subtitle=${encodeURIComponent(SITE_TAGLINE)}`;

export const buildCanonicalUrl = (path = '/') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (normalizedPath === '/') {
    return `${SITE_URL}/`;
  }

  return `${SITE_URL}${normalizedPath}`;
};
