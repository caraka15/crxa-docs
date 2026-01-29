import dns from 'node:dns/promises';

const ROOT_DOMAIN = 'crxanode.com';
const SUBDOMAIN_API = `https://api.subdomainfinder.in/?domain=${ROOT_DOMAIN}`;
const GOOGLE_DNS_ENDPOINT = 'https://dns.google/resolve';
const IP_API_ENDPOINT = 'http://ip-api.com/batch';
const OPEN_METEO_GEOCODER = 'https://geocoding-api.open-meteo.com/v1/search';

interface SubdomainApiResponse {
  status: string;
  data?: { subdomain: string }[];
}

interface IpApiBatchResponse {
  status: 'success' | 'fail';
  message?: string;
  query: string;
  country?: string;
  regionName?: string;
  city?: string;
  lat?: number;
  lon?: number;
}

interface GeocodeResponse {
  results?: Array<{
    name?: string;
    latitude?: number;
    longitude?: number;
    country?: string;
  }>;
}

interface ServerLocationPayload {
  name: string;
  endpoint: string;
  ip: string;
  coordinates: [number, number];
  city: string;
  country: string;
}

interface ServerLocationsResponse {
  locations: ServerLocationPayload[];
  errors: string[];
  lastUpdated: string;
}

const coordinateCache = new Map<string, [number, number]>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const cache = {
  data: null as { expires: number; payload: ServerLocationsResponse } | null,
};

const sendJson = (res: any, status: number, payload: unknown) => {
  res.statusCode = status;
  res.setHeader?.('Content-Type', 'application/json');
  res.end?.(JSON.stringify(payload));
};

const fetchSubdomains = async (): Promise<string[]> => {
  const response = await fetch(SUBDOMAIN_API, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Subdomain API failed (${response.status})`);
  }

  const payload = (await response.json()) as SubdomainApiResponse;
  const list = payload.data?.map((item) => item.subdomain).filter(Boolean) ?? [];

  if (list.length === 0) {
    throw new Error('Subdomain API returned empty data.');
  }

  return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
};

const resolveIp = async (domain: string): Promise<string> => {
  try {
    const dohUrl = `${GOOGLE_DNS_ENDPOINT}?name=${encodeURIComponent(domain)}&type=A`;
    const response = await fetch(dohUrl, {
      headers: { Accept: 'application/dns-json' },
    });
    if (response.ok) {
      const data = (await response.json()) as { Answer?: { data: string; type: number }[] };
      const answer = data.Answer?.find(
        (record) => record.type === 1 && typeof record.data === 'string'
      );
      if (answer?.data) {
        return answer.data;
      }
    }
  } catch (error) {
    console.warn('DoH lookup failed, falling back to system DNS', domain, error);
  }

  const lookupResult = await dns.lookup(domain);
  return lookupResult.address;
};

const resolveIps = async (domains: string[]) => {
  const results = await Promise.allSettled(domains.map((domain) => resolveIp(domain)));
  return results.map((result, index) => {
    const domain = domains[index];
    if (result.status === 'fulfilled') {
      return { domain, ip: result.value };
    }
    return {
      domain,
      ip: null,
      error:
        result.reason instanceof Error ? result.reason.message : String(result.reason ?? 'Error'),
    };
  });
};

const fetchIpApiBatch = async (
  ips: string[]
): Promise<Record<string, IpApiBatchResponse>> => {
  if (ips.length === 0) {
    return {};
  }

  const body = JSON.stringify(ips);
  const response = await fetch(IP_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`ip-api batch failed (${response.status})`);
  }

  const payload = (await response.json()) as IpApiBatchResponse[];
  const map: Record<string, IpApiBatchResponse> = {};
  payload.forEach((entry) => {
    map[entry.query] = entry;
  });
  return map;
};

const geocodeRegion = async (
  city?: string,
  region?: string,
  country?: string
): Promise<[number, number] | null> => {
  const queryParts = [city, region, country].filter(Boolean);
  if (queryParts.length === 0) {
    return null;
  }

  const key = queryParts.join('|');
  if (coordinateCache.has(key)) {
    return coordinateCache.get(key)!;
  }

  const url = `${OPEN_METEO_GEOCODER}?name=${encodeURIComponent(
    queryParts.join(', ')
  )}&count=1&language=en&format=json`;

  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    console.warn('Geocoding lookup failed', queryParts.join(', '), response.status);
    return null;
  }

  const payload = (await response.json()) as GeocodeResponse;
  const first = payload.results?.[0];
  if (!first || typeof first.latitude !== 'number' || typeof first.longitude !== 'number') {
    console.warn('Geocoding missing results', queryParts.join(', '), payload);
    return null;
  }

  const coordinates: [number, number] = [first.longitude, first.latitude];
  coordinateCache.set(key, coordinates);
  return coordinates;
};

const buildLocation = async (
  domain: string,
  ip: string,
  data: IpApiBatchResponse
): Promise<ServerLocationPayload> => {
  let latitude: number | null =
    typeof data.lat === 'number' ? Number(data.lat) : null;
  let longitude: number | null =
    typeof data.lon === 'number' ? Number(data.lon) : null;

  if (latitude === null || longitude === null) {
    const geocoded = await geocodeRegion(data.city, data.regionName, data.country);
    if (!geocoded) {
      throw new Error('Coordinates not provided by ip-api.');
    }
    [longitude, latitude] = geocoded;
  }

  const city = data.city || data.regionName || 'Unknown';
  const country = data.country || 'Unknown';

  return {
    name: domain,
    endpoint: domain,
    ip,
    coordinates: [longitude ?? 0, latitude ?? 0],
    city,
    country,
  };
};

export const config = {
  runtime: 'nodejs',
};

const rebuildPayload = async (): Promise<ServerLocationsResponse> => {
  const domains = await fetchSubdomains();
  const ipResults = await resolveIps(domains);

  const validIps = ipResults
    .filter((entry): entry is { domain: string; ip: string } => Boolean(entry.ip))
    .map((entry) => entry.ip);

  const ipApiMap = await fetchIpApiBatch(validIps);

  const locations: ServerLocationPayload[] = [];
  const errors: string[] = [];

  for (const entry of ipResults) {
    if (!entry.ip) {
      errors.push(`${entry.domain}: ${entry.error ?? 'IP lookup failed'}`);
      continue;
    }

    const meta = ipApiMap[entry.ip];
    if (!meta) {
      errors.push(`${entry.domain}: ip-api data missing`);
      continue;
    }

    if (meta.status !== 'success') {
      errors.push(`${entry.domain}: ${meta.message ?? 'ip-api lookup failed'}`);
      continue;
    }

    try {
      const location = await buildLocation(entry.domain, entry.ip, meta);
      locations.push(location);
    } catch (error) {
      errors.push(
        `${entry.domain}: ${error instanceof Error ? error.message : String(error ?? 'unknown error')
        }`
      );
    }
  }

  const payload: ServerLocationsResponse = {
    locations,
    errors,
    lastUpdated: new Date().toISOString(),
  };

  cache.data = {
    expires: Date.now() + CACHE_TTL_MS,
    payload,
  };

  return payload;
};

const getSearchParams = (req: any) => {
  try {
    const host = req.headers?.host ?? 'localhost';
    const protocol = req.headers?.['x-forwarded-proto'] ?? 'http';
    const absoluteUrl = new URL(req.url ?? '/', `${protocol}://${host}`);
    return absoluteUrl.searchParams;
  } catch {
    return new URLSearchParams();
  }
};

export default async function handler(req: any, res: any) {
  if (req.method && req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const searchParams = getSearchParams(req);
  const forceRefresh =
    searchParams.get('force') === '1' ||
    searchParams.get('refresh') === '1' ||
    searchParams.get('force') === 'true';

  try {
    const now = Date.now();
    if (!forceRefresh && cache.data && cache.data.expires > now) {
      res.setHeader?.('Cache-Control', 'public, max-age=60, s-maxage=600');
      sendJson(res, 200, cache.data.payload);
      return;
    }

    const payload = await rebuildPayload();
    res.setHeader?.('Cache-Control', 'public, max-age=60, s-maxage=600');
    sendJson(res, 200, payload);
  } catch (error) {
    console.error('Failed to resolve server locations:', error);
    sendJson(res, 500, {
      error: 'Failed to resolve server locations',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
