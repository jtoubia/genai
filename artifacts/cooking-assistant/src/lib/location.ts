export const ZIP_MESSAGE = 'Enter a 5-digit ZIP code, like 46556.';

/** Small built-in lookup; only these ZIP codes are verified. Never guessed for others. */
const KNOWN_ZIPS: Record<string, string> = {
  '46601': 'South Bend, IN',
  '46556': 'Notre Dame, IN',
  '10001': 'New York, NY',
  '60601': 'Chicago, IL',
  '90210': 'Beverly Hills, CA',
  '33101': 'Miami, FL',
};

export type LocationResult =
  | { kind: 'empty' }
  | { kind: 'invalid'; message: string }
  | { kind: 'zip'; zip: string; place?: string }
  | { kind: 'city'; display: string };

export function parseLocation(raw: string): LocationResult {
  const s = raw.trim();
  if (!s) return { kind: 'empty' };
  const zip = s.match(/^(\d{5})(-\d{4})?$/);
  if (zip) return { kind: 'zip', zip: zip[1], place: KNOWN_ZIPS[zip[1]] };
  const cs = s.match(/^([a-zA-Z .'-]{2,}),\s*([a-zA-Z]{2})$/);
  if (cs) return { kind: 'city', display: `${cs[1].trim()}, ${cs[2].toUpperCase()}` };
  return { kind: 'invalid', message: ZIP_MESSAGE };
}

export function describeLocation(loc: LocationResult): { main: string; detail: string } | null {
  if (loc.kind === 'zip') return { main: loc.zip, detail: loc.place ? ` — ${loc.place}` : ' (city and state not verified)' };
  if (loc.kind === 'city') return { main: loc.display, detail: ' (not verified)' };
  return null;
}
