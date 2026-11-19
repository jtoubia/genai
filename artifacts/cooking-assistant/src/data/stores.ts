import type { SourceKind } from './types';

export const DEMO_STORE_LABEL = 'Illustrative example store data - not real businesses';
export const DEMO_LOCATION = 'South Bend, Indiana (ZIP 46601)';

export type Availability = 'Confirmed' | 'Likely category' | 'Unknown';
/** No inventory source exists, so 'Confirmed' is never produced. Kept in the type for a future verified source. */
export const AVAILABILITY_HELP: Record<Availability, string> = {
  Confirmed: 'Verified in-stock information. Not available in this prototype.',
  'Likely category': 'Stores of this type commonly carry this kind of ingredient. Not a stock claim.',
  Unknown: 'No reliable signal either way. Call ahead or check in store.',
};

export type DemoStore = { id: string; name: string; category: string; carries: SourceKind[]; strengths: string };

export const demoStores: DemoStore[] = [
  { id: 'supermarket', name: 'Demo Neighborhood Supermarket', category: 'General supermarket', carries: ['general'], strengths: 'Produce, meat, rice, pantry staples, common spices' },
  { id: 'asian', name: 'Demo Asian Grocery', category: 'Asian grocery', carries: ['asian'], strengths: 'Thai, Korean, Japanese and Filipino sauces, herbs and noodles' },
  { id: 'international', name: 'Demo Indian & International Market', category: 'Indian & international market', carries: ['indian', 'international'], strengths: 'Indian spice blends, Middle Eastern and Latin American pantry items' },
];

export type LocationResult =
  | { kind: 'empty' }
  | { kind: 'invalid' }
  | { kind: 'demo'; display: string }
  | { kind: 'other'; display: string };

export function parseLocation(raw: string): LocationResult {
  const s = raw.trim();
  if (!s) return { kind: 'empty' };
  const zip = s.match(/^(\d{5})(-\d{4})?$/);
  if (zip) return zip[1] === '46601' ? { kind: 'demo', display: DEMO_LOCATION } : { kind: 'other', display: `ZIP ${zip[1]}` };
  const cs = s.match(/^([a-zA-Z .'-]{2,}),?\s+([a-zA-Z]{2}|[a-zA-Z ]{4,})$/);
  if (cs) {
    const city = cs[1].trim().toLowerCase();
    const state = cs[2].trim().toLowerCase();
    if (city === 'south bend' && (state === 'in' || state === 'indiana')) return { kind: 'demo', display: DEMO_LOCATION };
    return { kind: 'other', display: `${cs[1].trim()}, ${cs[2].trim()}` };
  }
  return { kind: 'invalid' };
}
