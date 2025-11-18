import dns from 'node:dns/promises';
import { promises as fs } from 'fs';
import path from 'path';

const ROOT_DOMAIN = 'crxanode.me';
const SUBDOMAIN_API = `https://api.subdomainfinder.in/?domain=${ROOT_DOMAIN}`;
const GOOGLE_DNS_ENDPOINT = 'https://dns.google/resolve';
const IP_API_ENDPOINT = 'http://ip-api.com/batch';
const OPEN_METEO_GEOCODER = 'https://geocoding-api.open-meteo.com/v1/search';

const coordinateCache = new Map();

const fetchSubdomains = async () => {
  const response = await fetch(SUBDOMAIN_API, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Subdomain API failed (${response.status})`);
  }

  const payload = await response.json();
  const list = payload.data?.map((item) => item.subdomain).filter(Boolean) ?? [];

  if (list.length === 0) {
    throw new Error('Subdomain API returned empty data.');
  }

  return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
};

const resolveIp = async (domain) => {
  try {
    const dohUrl = `${GOOGLE_DNS_ENDPOINT}?name=${encodeURIComponent(domain)}&type=A`;
    const response = await fetch(dohUrl, {
      headers: { Accept: 'application/dns-json' },
    });
    if (response.ok) {
      const data = await response.json();
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

const resolveIps = async (domains) => {
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

const fetchIpApiBatch = async (ips) => {
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

  const payload = await response.json();
  const map = {};
  payload.forEach((entry) => {
    map[entry.query] = entry;
  });
  return map;
};

const geocodeRegion = async (city, region, country) => {
  const queryParts = [city, region, country].filter(Boolean);
  if (queryParts.length === 0) {
    return null;
  }

  const key = queryParts.join('|');
  if (coordinateCache.has(key)) {
    return coordinateCache.get(key);
  }

  const url = `${OPEN_METEO_GEOCODER}?name=${encodeURIComponent(
    queryParts.join(', ')
  )}&count=1&language=en&format=json`;

  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    console.warn('Geocoding lookup failed', queryParts.join(', '), response.status);
    return null;
  }

  const payload = await response.json();
  const first = payload.results?.[0];
  if (!first || typeof first.latitude !== 'number' || typeof first.longitude !== 'number') {
    console.warn('Geocoding missing results', queryParts.join(', '), payload);
    return null;
  }

  const coordinates = [first.longitude, first.latitude];
  coordinateCache.set(key, coordinates);
  return coordinates;
};

const buildLocation = async (domain, ip, data) => {
  let latitude =
    typeof data.lat === 'number' ? Number(data.lat) : null;
  let longitude =
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

const rebuildPayload = async () => {
  const domains = await fetchSubdomains();
  const ipResults = await resolveIps(domains);

  const validIps = ipResults
    .filter((entry) => Boolean(entry.ip))
    .map((entry) => entry.ip);

  const ipApiMap = await fetchIpApiBatch(validIps);

  const locations = [];
  const errors = [];

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
        `${entry.domain}: ${
          error instanceof Error ? error.message : String(error ?? 'unknown error')
        }`
      );
    }
  }

  const payload = {
    locations,
    errors,
    lastUpdated: new Date().toISOString(),
  };

  return payload;
};

async function generate() {
  console.log('Generating server locations...');
  try {
    const payload = await rebuildPayload();
    const filePath = path.join(process.cwd(), 'public', 'server-locations.json');
    await fs.writeFile(filePath, JSON.stringify(payload, null, 2));
    console.log(`Successfully generated server locations at ${filePath}`);
  } catch (error) {
    console.error('Failed to generate server locations:', error);
    process.exit(1);
  }
}

generate();