import type { Recipe } from './types';
import { recipes } from './recipes';

/**
 * A source that can turn a dish name into a structured Recipe.
 * Today only the prepared source exists. A future live-AI source should run
 * server-side (API keys never in the client), return the same Recipe shape,
 * and be validated before use. Swap it in via `liveAiRecipeSource`.
 */
export interface RecipeSource {
  readonly kind: 'prepared' | 'live-ai';
  readonly label: string;
  findRecipe(query: string): Recipe | null;
}

export const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

const haystack = (r: Recipe) => norm([r.name, r.cuisine, ...r.aliases].join(' '));

export const preparedRecipeSource: RecipeSource = {
  kind: 'prepared',
  label: 'Prepared prototype recipes',
  findRecipe(query) {
    const q = norm(query);
    if (!q) return null;
    const exact = recipes.find((r) => norm(r.name) === q || r.aliases.some((a) => norm(a) === q));
    if (exact) return exact;
    const hits = filterRecipes(query);
    return hits.length === 1 ? hits[0] : null;
  },
};

/** Not configured in this prototype. Never fake it. */
export const liveAiRecipeSource: RecipeSource | null = null;

export function filterRecipes(query: string): Recipe[] {
  const q = norm(query);
  if (!q) return recipes;
  const tokens = q.split(' ');
  return recipes.filter((r) => {
    const h = haystack(r);
    return h.includes(q) || tokens.every((tk) => h.includes(tk));
  });
}

/** Dishes we recognize by name but have no prepared recipe for. */
const knownDishes: { name: string; cuisine: string; keys: string[] }[] = [
  { name: 'Ramen', cuisine: 'Japanese', keys: ['ramen'] },
  { name: 'Sushi', cuisine: 'Japanese', keys: ['sushi', 'maki'] },
  { name: 'Teriyaki chicken', cuisine: 'Japanese', keys: ['teriyaki'] },
  { name: 'Gyoza', cuisine: 'Japanese', keys: ['gyoza'] },
  { name: 'Pho', cuisine: 'Vietnamese', keys: ['pho'] },
  { name: 'Banh mi', cuisine: 'Vietnamese', keys: ['banh mi'] },
  { name: 'Pad see ew', cuisine: 'Thai', keys: ['pad see ew', 'see ew'] },
  { name: 'Tom yum', cuisine: 'Thai', keys: ['tom yum', 'tom yam'] },
  { name: 'Massaman curry', cuisine: 'Thai', keys: ['massaman'] },
  { name: 'Red curry', cuisine: 'Thai', keys: ['red curry'] },
  { name: 'Palak paneer', cuisine: 'Indian', keys: ['palak', 'saag'] },
  { name: 'Dal', cuisine: 'Indian', keys: ['dal', 'daal', 'dhal'] },
  { name: 'Chana masala', cuisine: 'Indian', keys: ['chana'] },
  { name: 'Samosas', cuisine: 'Indian', keys: ['samosa'] },
  { name: 'Kimchi jjigae', cuisine: 'Korean', keys: ['kimchi', 'jjigae'] },
  { name: 'Japchae', cuisine: 'Korean', keys: ['japchae'] },
  { name: 'Tteokbokki', cuisine: 'Korean', keys: ['tteokbokki', 'topokki'] },
  { name: 'Falafel', cuisine: 'Middle Eastern', keys: ['falafel'] },
  { name: 'Hummus', cuisine: 'Middle Eastern', keys: ['hummus'] },
  { name: 'Shakshuka', cuisine: 'Middle Eastern', keys: ['shakshuka'] },
  { name: 'Enchiladas', cuisine: 'Mexican', keys: ['enchilada'] },
  { name: 'Pozole', cuisine: 'Mexican', keys: ['pozole'] },
  { name: 'Mole', cuisine: 'Mexican', keys: ['mole'] },
  { name: 'Carnitas', cuisine: 'Mexican', keys: ['carnitas'] },
  { name: 'Lumpia', cuisine: 'Filipino', keys: ['lumpia'] },
  { name: 'Sinigang', cuisine: 'Filipino', keys: ['sinigang'] },
  { name: 'Pancit', cuisine: 'Filipino', keys: ['pancit'] },
  { name: 'Lasagna', cuisine: 'Italian', keys: ['lasagna', 'lasagne'] },
  { name: 'Risotto', cuisine: 'Italian', keys: ['risotto'] },
  { name: 'Pizza', cuisine: 'Italian', keys: ['pizza'] },
  { name: 'Paella', cuisine: 'Spanish', keys: ['paella'] },
  { name: 'Kung pao chicken', cuisine: 'Chinese', keys: ['kung pao'] },
  { name: 'Fried rice', cuisine: 'Chinese', keys: ['fried rice'] },
  { name: 'Dumplings', cuisine: 'Chinese', keys: ['dumpling', 'jiaozi'] },
  { name: 'Mapo tofu', cuisine: 'Chinese', keys: ['mapo'] },
  { name: 'Jollof rice', cuisine: 'West African', keys: ['jollof'] },
  { name: 'Doro wat', cuisine: 'Ethiopian', keys: ['doro wat', 'doro wot'] },
  { name: 'Tagine', cuisine: 'Moroccan', keys: ['tagine', 'tajine'] },
];

export type LookupResult =
  | { kind: 'empty' }
  | { kind: 'match'; recipe: Recipe; source: RecipeSource['kind'] }
  | { kind: 'unfamiliar'; dishName: string; cuisine: string; related: Recipe[] }
  | { kind: 'unsupported'; related: Recipe[] };

function related(query: string, cuisine?: string): Recipe[] {
  if (cuisine) {
    const same = recipes.filter((r) => r.cuisine === cuisine || (cuisine === 'Vietnamese' && r.cuisine === 'Thai'));
    if (same.length) return same.slice(0, 3);
  }
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

export function lookupDish(query: string): LookupResult {
  const q = norm(query);
  if (!q) return { kind: 'empty' };
  const prepared = preparedRecipeSource.findRecipe(query);
  if (prepared) return { kind: 'match', recipe: prepared, source: 'prepared' };
  if (liveAiRecipeSource) {
    const live = liveAiRecipeSource.findRecipe(query);
    if (live) return { kind: 'match', recipe: live, source: 'live-ai' };
  }
  const known = knownDishes.find((d) => d.keys.some((k) => q.includes(k)));
  if (known) return { kind: 'unfamiliar', dishName: known.name, cuisine: known.cuisine, related: related(query, known.cuisine) };
  return { kind: 'unsupported', related: related(query) };
}
