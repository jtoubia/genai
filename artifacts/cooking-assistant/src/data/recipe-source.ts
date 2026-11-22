import type { Recipe } from './types';
import { recipes } from './recipes';

/**
 * Prepared recipes are hand-written and always take priority. Dishes outside
 * the prepared set are written by the server-side live AI route
 * (POST api/recipes/generate), validated, and converted in live-recipe.ts.
 */
export const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

const haystack = (r: Recipe) => norm([r.name, r.cuisine, ...r.aliases].join(' '));

export function filterRecipes(query: string): Recipe[] {
  const q = norm(query);
  if (!q) return recipes;
  const tokens = q.split(' ');
  return recipes.filter((r) => {
    const h = haystack(r);
    return h.includes(q) || tokens.every((tk) => h.includes(tk));
  });
}

/** A prepared recipe that clearly matches the typed dish, or null. */
export function findPrepared(query: string): Recipe | null {
  const q = norm(query);
  if (!q) return null;
  const exact = recipes.find((r) => norm(r.name) === q || r.aliases.some((a) => norm(a) === q));
  if (exact) return exact;
  const hits = filterRecipes(query);
  return hits.length === 1 ? hits[0] : null;
}

/** Prepared recipes loosely related to a query, for suggestions. */
export function relatedRecipes(query: string): Recipe[] {
  const tokens = norm(query).split(' ').filter((t) => t.length > 2);
  const scored = recipes
    .map((r) => {
      const h = norm([r.name, r.cuisine, ...r.aliases, ...r.ingredients.map((i) => i.name)].join(' '));
      return { r, score: tokens.filter((t) => h.includes(t)).length };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return (scored.length ? scored.map((x) => x.r) : recipes).slice(0, 3);
}
