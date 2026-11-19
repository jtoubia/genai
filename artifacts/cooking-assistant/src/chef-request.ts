import { FORBIDDEN, type Diet, type IngredientDef, type Recipe, type Spice, type Tag } from './data/types';

/**
 * Prototype AI Simulation: keyword and phrase matching over the chef request
 * and the "already at home" field. It never invents an adaptation it does not
 * recognize; unknown requests are reported as not applied.
 */

export type CardKind = 'Already have' | 'Flavor' | 'Shopping' | 'Dietary' | 'Substitution' | 'Not applied' | 'Note';
export type AdaptationCard = { kind: CardKind; text: string };

export const UNRECOGNIZED_MESSAGE = "We couldn't confidently apply that request yet. Your standard shopping plan is shown below, and your request has not been applied.";

export type Interpretation = {
  hasRequest: boolean;
  understood: boolean;
  haveIds: string[];
  requestHaveIds: string[];
  unmatchedHome: string[];
  cantFindIds: string[];
  noFallbackIds: string[];
  easyShop: boolean;
  authentic: boolean;
  spiceReq: Spice | null;
  notes: AdaptationCard[];
};

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function keywordsFor(i: IngredientDef): string[] {
  const base = i.name.toLowerCase().replace(/\(.*?\)/g, '').replace(/[,:+].*$/, '').trim();
  return [...new Set([i.id.replace(/-/g, ' '), base, ...(i.k ?? [])])].filter((k) => k.length > 2);
}

/** Finds ingredient ids mentioned in text; longer phrases win ("lime leaves" over "lime"). */
export function matchIngredients(text: string, recipe: Recipe): string[] {
  const spans: { id: string; s: number; e: number }[] = [];
  for (const i of recipe.ingredients) {
    for (const kw of keywordsFor(i)) {
      const re = new RegExp(`\\b${esc(kw)}(?:e?s)?\\b`, 'g');
      let m: RegExpExecArray | null;
      while ((m = re.exec(text))) spans.push({ id: i.id, s: m.index, e: m.index + m[0].length });
    }
  }
  const keep = spans.filter((a) => !spans.some((b) => b.id !== a.id && b.s <= a.s && b.e >= a.e && b.e - b.s > a.e - a.s));
  return [...new Set(keep.map((k) => k.id))];
}

const NEG = /(can'?t find|cannot find|could ?n'?t find|can not find|don'?t have|do not have|no access|unavailable|hard to find|not available|out of|missing|can'?t get|cannot get)/;
const HAVE = /(already have|i have|i've got|ive got|i got|have some|at home)/;
const MILD = /(mild|less spicy|not (too |very )?spicy|no heat|less heat|gentle|not hot|less hot|low spice|tone down)/;
const SPICY = /(spicier|extra spicy|more spicy|very spicy|hotter|more heat|make it spicy|like it spicy|extra hot)/;
const EASY = /(one store|1 store|single store|one shop|one trip|only one|easy to find|easier to find|easiest|simple shopping|simplest|supermarket only|only.*supermarket|regular (grocery|store)|common ingredients)/;
const AUTHENTIC = /(authentic|traditional)/;
const ADD = /\b(add|use|using|with|extra|include|put|instead|swap|replace|want)\b/;

const CONFLICT_TERMS: [RegExp, Tag, string][] = [
  [/(?<!plant-based |plant |vegan |peanut |non-dairy )\bbutter\b/, 'dairy', 'butter'],
  [/(?<!coconut |cashew |oat |non-dairy )\bcream\b/, 'dairy', 'cream'],
  [/\b(cheese|paneer|parmesan|pecorino)\b/, 'dairy', 'cheese'],
  [/\bghee\b/, 'dairy', 'ghee'],
  [/(?<!coconut |almond |oat |soy |plant |non-dairy )\bmilk\b/, 'dairy', 'milk'],
  [/(?<!non-dairy |plant |coconut |vegan )\byogh?urt\b/, 'dairy', 'yogurt'],
  [/\b(chicken|beef|pork|bacon|lamb|meat|guanciale|pancetta)\b/, 'meat', 'meat'],
  [/\b(fish sauce|shrimp|prawns?|anchov(y|ies)|oyster sauce)\b/, 'fish', 'fish or shellfish'],
  [/\beggs?\b/, 'egg', 'egg'],
  [/\bhoney\b/, 'honey', 'honey'],
  [/\b(flour|wheat|bread|regular soy sauce|regular pasta)\b/, 'gluten', 'wheat'],
];

export function dietsViolated(contains: Tag[] | undefined, diets: Diet[]): Diet[] {
  if (!contains?.length) return [];
  return diets.filter((d) => FORBIDDEN[d].some((tag) => contains.includes(tag)));
}

export function interpret(recipe: Recipe, request: string, atHome: string, diets: Diet[]): Interpretation {
  const text = request.trim().toLowerCase().replace(/[’]/g, "'");
  const notes: AdaptationCard[] = [];
  const haveIds = new Set<string>();
  const requestHave = new Set<string>();
  const unmatchedHome: string[] = [];

  // Field: ingredients already at home.
  atHome.toLowerCase().split(/,|;|\n|\band\b|\//).map((s) => s.trim()).filter(Boolean).forEach((token) => {
    const ids = matchIngredients(token, recipe);
    if (ids.length) ids.forEach((id) => haveIds.add(id));
    else if (token.length > 1) unmatchedHome.push(token);
  });

  const cantFind = new Set<string>();
  const noFallback = new Set<string>();
  if (text) {
    const clauses = text.split(/[.;!?\n]|,|\bbut\b|\band (?:i|make|help|please)\b/).map((c) => c?.trim()).filter(Boolean) as string[];
    const fbTargets = recipe.fallbacks.map((f) => f.target);
    let negContext = false;
    for (const clause of clauses) {
      const neg = NEG.test(clause);
      const have = HAVE.test(clause);
      if (neg) negContext = true;
      else if (have) negContext = false;
      const isNeg = neg || (negContext && !have && /^(or |and )?[\w\s'-]+$/.test(clause) && !MILD.test(clause) && !EASY.test(clause) && !ADD.test(clause));
      if (isNeg) {
        const ids = matchIngredients(clause, recipe);
        if (/specialty|special ingredients|hard[- ]to[- ]find ingredients/.test(clause)) fbTargets.forEach((id) => cantFind.add(id));
        ids.forEach((id) => (fbTargets.includes(id) ? cantFind.add(id) : noFallback.add(id)));
        continue;
      }
      if (have) {
        matchIngredients(clause, recipe).forEach((id) => { haveIds.add(id); requestHave.add(id); });
        continue;
      }
      if (ADD.test(clause)) {
        for (const [re, tag, label] of CONFLICT_TERMS) {
          if (!re.test(clause)) continue;
          const v = dietsViolated([tag], diets);
          if (v.length) notes.push({ kind: 'Not applied', text: `Your request mentions ${label}, which conflicts with your ${v.join(' + ')} selection, so it was not added. Your restriction stays in place; see Ingredient Substitutions for compatible options.` });
        }
      }
    }
  }
  noFallback.forEach((id) => {
    const name = recipe.ingredients.find((i) => i.id === id)?.name ?? id;
    notes.push({ kind: 'Note', text: `There is no prepared fallback for ${name} yet, so it stays on your list. Ask at the store or check a specialty grocer.` });
  });

  const spiceReq: Spice | null = text ? (MILD.test(text) ? 'Mild' : SPICY.test(text) ? 'Spicy' : null) : null;
  const easyShop = EASY.test(text);
  const authentic = !!text && AUTHENTIC.test(text);
  const understood = !!text && (requestHave.size > 0 || cantFind.size > 0 || easyShop || authentic || !!spiceReq || notes.length > 0);

  return {
    hasRequest: !!text,
    understood,
    haveIds: [...haveIds],
    requestHaveIds: [...requestHave],
    unmatchedHome,
    cantFindIds: [...cantFind],
    noFallbackIds: [...noFallback],
    easyShop,
    authentic,
    spiceReq,
    notes,
  };
}
