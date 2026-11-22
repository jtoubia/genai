import type { FallbackDef, IngredientDef, IngredientSpec, Recipe, SourceKind, Step, Tag } from './types';

/** Mirrors GeneratedRecipe in artifacts/api-server/src/lib/recipe-schema.ts (already server-validated). */
type GenSpec = {
  name: string;
  amt: number | null;
  unit?: string;
  note: string;
  contains?: Tag[];
  specialty?: boolean;
  source?: SourceKind;
  heat?: boolean;
};
export type GeneratedRecipe = {
  recognized: boolean;
  reason?: string;
  name: string;
  cuisine: string;
  origin?: string;
  summary: string;
  prep: number;
  cook: number;
  difficulty: 'Easy' | 'Moderate' | 'Involved';
  equipment: string[];
  ingredients: (GenSpec & { id: string; optional?: boolean; k?: string[]; swaps?: { ing: GenSpec; why: string }[] })[];
  fallbacks?: { target: string; why: string; substitute: string; changes: string; omittable: string; ing: GenSpec | null; alsoRemoves?: string[] }[];
  steps: { title: string; text: string; minutes?: string; tip?: string; safety?: { ing: string; text: string }; heat?: { Mild?: string; Spicy?: string } }[];
  dietaryNote?: string;
};

export type GenerateResponse =
  | { status: 'ok'; model: string; recipe: GeneratedRecipe }
  | { status: 'unrecognized'; message: string }
  | { status: string; message?: string };

export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'dish';

const spec = (g: GenSpec): IngredientSpec => ({
  name: g.name,
  amt: g.amt,
  unit: g.unit ?? '',
  note: g.note,
  contains: g.contains ?? [],
  specialty: !!g.specialty,
  source: g.source ?? 'general',
  heat: !!g.heat,
});

export function toRecipe(g: GeneratedRecipe, model: string): Recipe {
  const ingredients: IngredientDef[] = g.ingredients.map((i) => ({
    ...spec(i),
    id: i.id,
    optional: !!i.optional,
    k: i.k ?? [],
    // Diet swaps from the model are always offered as a choice, never applied silently.
    swaps: (i.swaps ?? []).map((s) => ({ ing: spec(s.ing), why: s.why })),
  }));
  const fallbacks: FallbackDef[] = (g.fallbacks ?? []).map((f) => ({
    target: f.target,
    why: f.why,
    substitute: f.substitute,
    changes: f.changes,
    omittable: f.omittable,
    ing: f.ing ? { ...spec(f.ing), label: 'Approximation' } : null,
    alsoRemoves: f.alsoRemoves ?? [],
  }));
  // Only the step body is token-rendered by the plan engine; in tips, safety and heat notes use plain names.
  const names = new Map(g.ingredients.map((i) => [i.id, i.name]));
  const plain = (t?: string) => (t === undefined ? t : t.replace(/\{([a-z0-9-]+)\}/g, (_m, id: string) => names.get(id) ?? id));
  const steps: Step[] = g.steps.map((s) => ({
    title: s.title,
    text: s.text,
    minutes: s.minutes,
    tip: plain(s.tip),
    safety: s.safety ? { ing: s.safety.ing, text: plain(s.safety.text) as string } : undefined,
    heat: s.heat ? { Mild: plain(s.heat.Mild), Spicy: plain(s.heat.Spicy) } : undefined,
  }));
  return {
    id: `ai-${slugify(g.name)}`,
    name: g.name,
    cuisine: g.cuisine,
    origin: g.origin || g.cuisine,
    alt: `Illustrated tile for ${g.name}, a ${g.cuisine} dish (no photo for AI-written recipes)`,
    aliases: [],
    summary: g.summary,
    prep: g.prep,
    cook: g.cook,
    difficulty: g.difficulty,
    equipment: g.equipment,
    ingredients,
    fallbacks,
    steps,
    dietaryNote: g.dietaryNote || 'Written by live AI from the dish name. Check every ingredient and packaged label against your needs.',
    source: { kind: 'live-ai', model },
  };
}
