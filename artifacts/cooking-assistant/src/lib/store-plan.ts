import { demoStores, parseLocation, type Availability, type DemoStore, type LocationResult } from '../data/stores';
import type { Plan, PlanItem, Strategy } from './plan-engine';

export type StoreStop = { store: DemoStore; role: 'Main stop' | 'Specialty stop' | 'Backup if needed'; items: { item: PlanItem; availability: Availability }[] };
export type StorePlan = { location: LocationResult; stops: StoreStop[]; advice: string[] };

const availability = (store: DemoStore, item: PlanItem): Availability => (store.carries.includes(item.source) ? 'Likely category' : 'Unknown');
const storeFor = (item: PlanItem) => demoStores.find((s) => s.carries.includes(item.source)) ?? demoStores[0];

export function buildStorePlan(plan: Plan, rawLocation: string, strategy: Strategy): StorePlan {
  const location = parseLocation(rawLocation);
  const toBuy = plan.items.filter((i) => i.status === 'buy' || i.status === 'conflict');
  const advice: string[] = [];

  for (const f of plan.fallbacks) {
    const it = plan.items.find((i) => i.id === f.target);
    if (!it || it.status !== 'buy' || f.current !== 'original' || !f.ing || f.blockedBy.length) continue;
    const store = storeFor(it);
    if (store.id === 'supermarket') continue;
    advice.push(`${f.originalName} may require a trip to an ${store.category.toLowerCase()}. If you prefer a single supermarket trip, ${f.substitute.toLowerCase()} is an easier alternative, although ${f.changes.charAt(0).toLowerCase()}${f.changes.slice(1)}`);
  }

  if (location.kind !== 'demo') return { location, stops: [], advice };

  const main = demoStores[0];
  const stops: StoreStop[] = [];
  if (strategy === 'simplest') {
    stops.push({ store: main, role: 'Main stop', items: toBuy.map((item) => ({ item, availability: availability(main, item) })) });
    const unknown = toBuy.filter((i) => !main.carries.includes(i.source));
    demoStores.slice(1).forEach((store) => {
      const its = unknown.filter((i) => store.carries.includes(i.source));
      if (its.length) stops.push({ store, role: 'Backup if needed', items: its.map((item) => ({ item, availability: availability(store, item) })) });
    });
  } else {
    const general = toBuy.filter((i) => main.carries.includes(i.source));
    demoStores.slice(1).forEach((store) => {
      const its = toBuy.filter((i) => store.carries.includes(i.source));
      if (its.length) stops.push({ store, role: 'Specialty stop', items: its.map((item) => ({ item, availability: availability(store, item) })) });
    });
    if (general.length) stops.push({ store: main, role: 'Main stop', items: general.map((item) => ({ item, availability: availability(main, item) })) });
  }
  return { location, stops, advice };
}
