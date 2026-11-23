import { dietsViolated, type AdaptationCard } from '../chef-request';
import { SPICE_FACTOR, type Diet, type FallbackDef, type IngLabel, type IngredientSpec, type Recipe, type SourceKind, type Spice, type Tag } from '../data/types';

export type Strategy = 'simplest' | 'authentic';
export type SwapChoice = 'original' | 'substitute';
export type PlanInput = { recipe: Recipe; servings: number; diets: Diet[]; spice: Spice; strategy: Strategy };
export type Decisions = { swaps: Record<string, SwapChoice>; diet: Record<string, string> };

export type ItemStatus = 'buy' | 'home' | 'omitted' | 'conflict';
export type PlanItem = {
  id: string;
  /** Identity of what is currently on the list: ingredient id plus the variant in use, so a substitute never inherits the original's at-home state. */
  key: string;
  name: string;
  qty: string;
  note: string;
  label?: IngLabel;
  specialty: boolean;
  source: SourceKind;
  status: ItemStatus;
  contains: Tag[];
  origName: string;
  change: 'none' | 'diet' | 'fallback' | 'kept-conflict' | 'replaced';
  spiceChanged: boolean;
  optional: boolean;
  violates: Diet[];
};
export type ConflictView = { id: string; name: string; diets: Diet[]; options: { value: string; label: string; detail: string }[]; decision?: string };
export type FallbackView = FallbackDef & { originalName: string; current: SwapChoice; recommended: SwapChoice; blockedBy: Diet[]; available: boolean; reason?: string };
export type Seg = string | { id: string; name: string; state: 'ok' | 'omitted' | 'conflict' };
export type PlanStep = { n: number; title: string; segs: Seg[]; uses: { id: string; name: string; qty: string; state: 'ok' | 'omitted' | 'conflict' }[]; minutes?: string; tip?: string; safety?: string; heatNote?: string };
export type Plan = {
  recipe: Recipe;
  servings: number;
  diets: Diet[];
  effectiveSpice: Spice;
  items: PlanItem[];
  conflicts: ConflictView[];
  fallbacks: FallbackView[];
  steps: PlanStep[];
  cards: AdaptationCard[];
  unresolved: number;
};

/* ---------- quantities ---------- */
const FR: [number, string][] = [[0, ''], [0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾'], [1, '']];
export function fmtNum(n: number): string {
  if (n <= 0) return '0';
  if (n >= 10) return String(Math.round(n));
  let w = Math.floor(n);
  let best = FR[0];
  for (const c of FR) if (Math.abs(c[0] - (n - w)) < Math.abs(best[0] - (n - w))) best = c;
  if (best[0] === 1) { w += 1; best = FR[0]; }
  if (w === 0 && !best[1]) return '¼';
  return `${w || ''}${best[1]}`;
}
function fmtQty(n: number, unit = '', units?: string) {
  if (unit === 'g' || unit === 'ml') return `${n < 20 ? Math.round(n) : Math.round(n / 5) * 5} ${unit}`;
  const label = n > 1 && units ? units : unit;
  return label ? `${fmtNum(n)} ${label}` : fmtNum(n);
}
export function quantity(spec: IngredientSpec, servings: number, factor = 1): string {
  if (spec.amt == null) {
    if (!spec.text) return 'To taste';
    const base = servings === 2 || servings === 4 ? spec.text[servings] : `${spec.text[2]} per 2 servings (scale ×${fmtNum(servings / 2)})`;
    if (factor < 1) return `${base}, use about half`;
    if (factor > 1) return `${base}, use about 1½×`;
    return base;
  }
  if (factor === 1 && spec.text && (servings === 2 || servings === 4)) return spec.text[servings];
  const n = (spec.amt * servings * factor) / 2;
  // Eggs can't be split sensibly; round up to whole eggs.
  return fmtQty(!spec.unit && /\begg/i.test(spec.name) ? Math.ceil(n) : n, spec.unit, spec.units);
}

/* ---------- recommendations ---------- */
function fallbackBlocked(f: FallbackDef, diets: Diet[]) {
  return f.ing ? dietsViolated(f.ing.contains, diets) : [];
}

export function recommendedSwaps(input: PlanInput): Record<string, SwapChoice> {
  const out: Record<string, SwapChoice> = {};
  for (const f of input.recipe.fallbacks) {
    const target = input.recipe.ingredients.find((i) => i.id === f.target);
    const applicable = !!target && dietsViolated(target.contains, input.diets).length === 0 && fallbackBlocked(f, input.diets).length === 0;
    const wantSub = input.strategy === 'simplest';
    out[f.target] = applicable && wantSub ? 'substitute' : 'original';
  }
  return out;
}

export function initialDecisions(input: PlanInput): Decisions {
  const diet: Record<string, string> = {};
  input.recipe.ingredients.forEach((i) => {
    if (i.optional && dietsViolated(i.contains, input.diets).length) diet[i.id] = 'omit';
  });
  return { swaps: recommendedSwaps(input), diet };
}

/* ---------- plan ---------- */
const lcFirst = (s: string) => (/^[A-Z][a-z]/.test(s) && !/^(Thai|Asian|Korean|Japanese|Filipino|Kashmiri|Pecorino|English|Dijon|Bosc|Fresno|Garam|Kasuri|Tamari|Gochujang|Gochugaru|Karashi|Achiote|Makrut)\b/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);

export function buildPlan(input: PlanInput, decisions: Decisions, home: ReadonlySet<string> = new Set()): Plan {
  const { recipe, servings, diets } = input;
  const cards: AdaptationCard[] = [];
  const effectiveSpice = input.spice;
  const factor = SPICE_FACTOR[effectiveSpice];

  // Which fallbacks are applied, and which items they make unnecessary.
  const fallbackViews: FallbackView[] = [];
  const applied = new Map<string, FallbackDef>();
  const removed = new Set<string>();
  for (const f of recipe.fallbacks) {
    const target = recipe.ingredients.find((i) => i.id === f.target);
    if (!target) continue;
    const targetViolates = dietsViolated(target.contains, diets);
    const blockedBy = fallbackBlocked(f, diets);
    const available = targetViolates.length === 0;
    const rec = recommendedSwaps(input)[f.target] ?? 'original';
    let current = decisions.swaps[f.target] ?? rec;
    if (blockedBy.length || !available) current = 'original';
    fallbackViews.push({ ...f, originalName: target.name, current, recommended: rec, blockedBy, available, reason: !available ? `The original conflicts with ${targetViolates.join(' + ')}; resolve it under "Needs your decision".` : undefined });
    if (current === 'substitute') {
      applied.set(f.target, f);
      f.alsoRemoves?.forEach((r) => removed.add(r));
    }
  }

  const conflicts: ConflictView[] = [];
  const dietCards: string[] = [];
  const subCards: string[] = [];
  const spiceChanges: string[] = [];
  const items: PlanItem[] = recipe.ingredients.map((def) => {
    let spec: IngredientSpec = def;
    let change: PlanItem['change'] = 'none';
    let status: ItemStatus = 'buy';
    let label: IngLabel | undefined = def.label;
    const violates = dietsViolated(def.contains, diets);

    if (violates.length) {
      const compatible = (def.swaps ?? []).map((s, idx) => ({ s, idx })).filter((x) => dietsViolated(x.s.ing.contains, diets).length === 0);
      const auto = compatible.find((x) => x.s.auto);
      if (auto) {
        spec = auto.s.ing;
        change = 'diet';
        label = auto.s.ing.label ?? 'Diet alternative';
        dietCards.push(`Replaced ${lcFirst(def.name)} with ${lcFirst(auto.s.ing.name)} for ${violates.join(' + ')}. ${auto.s.why}`);
      } else {
        const decision = decisions.diet[def.id];
        conflicts.push({
          id: def.id,
          name: def.name,
          diets: violates,
          decision,
          options: [
            ...compatible.map((x) => ({ value: `swap-${x.idx}`, label: `Use ${x.s.ing.name}`, detail: x.s.why })),
            { value: 'omit', label: 'Leave it out', detail: def.optional ? 'It is optional; the dish is complete without it.' : 'The dish will taste noticeably different without it.' },
            { value: 'keep', label: 'Keep the original', detail: `Does not meet ${violates.join(' + ')}. Choose only if that is right for you.` },
          ],
        });
        if (!decision) {
          status = 'conflict';
          dietCards.push(`Needs your decision: ${def.name} does not fit ${violates.join(' + ')} and has no safe automatic swap. Nothing has been changed silently.`);
        } else if (decision === 'omit') {
          status = 'omitted';
          dietCards.push(`Left out ${lcFirst(def.name)} because it does not fit ${violates.join(' + ')}${def.optional ? ' (it is optional)' : ''}.`);
        } else if (decision === 'keep') {
          change = 'kept-conflict';
          label = 'Does not meet your diet';
          dietCards.push(`Kept ${lcFirst(def.name)} at your request. This does not meet ${violates.join(' + ')}.`);
        } else {
          const swap = def.swaps?.[Number(decision.replace('swap-', ''))];
          if (swap) {
            spec = swap.ing;
            change = 'diet';
            label = swap.ing.label ?? 'Diet alternative';
            dietCards.push(`Replaced ${lcFirst(def.name)} with ${lcFirst(swap.ing.name)} for ${violates.join(' + ')} (your choice). ${swap.why}`);
          }
        }
      }
    }

    if (change === 'none' && status === 'buy') {
      const f = applied.get(def.id);
      if (f) {
        if (f.ing) { spec = { specialty: false, source: 'general', ...f.ing }; change = 'fallback'; label = 'Approximation'; subCards.push(`Using ${lcFirst(f.ing.name)} instead of ${lcFirst(def.name)}: ${f.changes}`); }
        else { status = 'omitted'; subCards.push(`Leaving out ${lcFirst(def.name)}: ${f.changes}`); }
      } else if (removed.has(def.id)) {
        status = 'omitted';
        change = 'replaced';
      }
    }

    const heat = spec.heat ?? def.heat;
    const spiceChanged = !!heat && factor !== 1 && status !== 'omitted';
    const qty = quantity(spec, servings, heat ? factor : 1);
    if (spiceChanged) spiceChanges.push(spec.amt != null ? `${spec.name}: ${quantity(spec, servings)} to ${qty}` : `${spec.name}: ${qty.split(', ').pop()}`);
    if (spiceChanged && !label) label = 'Spice adjusted';
    const key = `${def.id}::${spec.name}`;
    if (status === 'buy' && home.has(key)) status = 'home';

    return {
      id: def.id,
      key,
      name: spec.name,
      qty,
      note: spec.note,
      label,
      specialty: spec.specialty ?? def.specialty ?? false,
      source: spec.source ?? (spec === def ? def.source : undefined) ?? (spec.specialty ? 'asian' : 'general'),
      status,
      contains: spec.contains ?? [],
      origName: def.name,
      change,
      spiceChanged,
      optional: !!def.optional,
      violates: change === 'kept-conflict' || status === 'conflict' ? violates : [],
    };
  });

  // Request-driven cards, in the order a cook reads them.
  if (spiceChanges.length) cards.push({ kind: 'Flavor', text: `${effectiveSpice === 'Mild' ? 'Reduced' : 'Increased'} the heat to match a ${effectiveSpice.toLowerCase()} preference: ${spiceChanges.join('; ')}. Aromatics and herbs are unchanged so the dish keeps its character.` });
  dietCards.forEach((text) => cards.push({ kind: 'Dietary', text }));
  if (subCards.length) {
    const why = input.strategy === 'simplest' ? 'You chose the simplest shopping trip, so easier-to-find alternatives are recommended.' : '';
    cards.push({ kind: 'Shopping', text: `${why} These are somewhat less authentic but let you complete the meal without extra specialty stops; you can keep any original below.`.trim() });
    subCards.forEach((text) => cards.push({ kind: 'Substitution', text }));
  }

  // Steps reflect every change above.
  const byId = new Map(items.map((i) => [i.id, i]));
  const state = (id: string): 'ok' | 'omitted' | 'conflict' => {
    const it = byId.get(id);
    if (!it) return 'ok';
    return it.status === 'omitted' ? 'omitted' : it.status === 'conflict' ? 'conflict' : 'ok';
  };
  const steps: PlanStep[] = recipe.steps.map((s, idx) => {
    const altKey = Object.keys(s.alt ?? {}).find((id) => {
      const it = byId.get(id);
      return !!it && (it.status === 'omitted' || it.change === 'fallback' || it.change === 'diet');
    });
    const text = altKey ? s.alt![altKey] : s.text;
    const segs: Seg[] = [];
    const uses: PlanStep['uses'] = [];
    let last = 0;
    for (const m of text.matchAll(/\{([a-z0-9-]+)\}/g)) {
      segs.push(text.slice(last, m.index));
      const it = byId.get(m[1]);
      segs.push({ id: m[1], name: it ? lcFirst(it.name) : m[1], state: state(m[1]) });
      if (it && !uses.some((u) => u.id === it.id)) uses.push({ id: it.id, name: it.name, qty: it.qty, state: state(it.id) });
      last = (m.index ?? 0) + m[0].length;
    }
    segs.push(text.slice(last));
    const safeIt = s.safety ? byId.get(s.safety.ing) : undefined;
    const showSafety = !!safeIt && safeIt.status !== 'omitted' && safeIt.contains.some((c) => c === 'meat' || c === 'egg' || c === 'fish');
    return { n: idx + 1, title: s.title, segs, uses, minutes: s.minutes, tip: s.tip, safety: showSafety ? s.safety!.text : undefined, heatNote: s.heat?.[effectiveSpice] };
  });

  return {
    recipe, servings, diets, effectiveSpice, items, conflicts, fallbacks: fallbackViews, steps, cards,
    unresolved: items.filter((i) => i.status === 'conflict').length,
  };
}
