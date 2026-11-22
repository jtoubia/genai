import { z } from "zod";

const tag = z.enum(["dairy", "meat", "fish", "egg", "gluten", "honey"]);
const source = z.enum(["general", "asian", "indian", "international"]);

const spec = z.object({
  name: z.string().min(1).max(120),
  amt: z.number().positive().max(5000).nullable(),
  unit: z.string().max(40).default(""),
  note: z.string().min(1).max(300),
  contains: z.array(tag).default([]),
  specialty: z.boolean().default(false),
  source: source.default("general"),
  heat: z.boolean().default(false),
});

const id = z.string().regex(/^[a-z][a-z0-9-]{0,29}$/);

export const generatedRecipeSchema = z.object({
  recognized: z.boolean(),
  reason: z.string().max(300).default(""),
  name: z.string().min(1).max(100),
  cuisine: z.string().min(1).max(60),
  origin: z.string().max(120).default(""),
  summary: z.string().min(1).max(400),
  prep: z.number().int().min(0).max(600),
  cook: z.number().int().min(0).max(900),
  difficulty: z.enum(["Easy", "Moderate", "Involved"]),
  equipment: z.array(z.string().max(80)).min(1).max(12),
  ingredients: z
    .array(
      spec.extend({
        id,
        optional: z.boolean().default(false),
        k: z.array(z.string().max(40)).max(6).default([]),
        swaps: z
          .array(z.object({ ing: spec, why: z.string().max(300) }))
          .max(3)
          .default([]),
      }),
    )
    .min(3)
    .max(30),
  fallbacks: z
    .array(
      z.object({
        target: id,
        why: z.string().max(300),
        substitute: z.string().max(120),
        changes: z.string().max(300),
        omittable: z.string().max(300),
        ing: spec.nullable(),
        alsoRemoves: z.array(id).default([]),
      }),
    )
    .max(8)
    .default([]),
  steps: z
    .array(
      z.object({
        title: z.string().min(1).max(80),
        text: z.string().min(10).max(700),
        minutes: z.string().max(30).optional(),
        tip: z.string().max(300).optional(),
        safety: z.object({ ing: z.string().max(60), text: z.string().max(300) }).optional(),
        heat: z
          .object({ Mild: z.string().max(250).optional(), Spicy: z.string().max(250).optional() })
          .optional(),
      }),
    )
    .min(4)
    .max(16),
  dietaryNote: z.string().max(500).default(""),
});

export type GeneratedRecipe = z.infer<typeof generatedRecipeSchema>;

/** Cross-field checks the schema alone cannot express. Returns a list of problems. */
export function checkRecipeConsistency(r: GeneratedRecipe): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const i of r.ingredients) {
    if (ids.has(i.id)) problems.push(`duplicate ingredient id ${i.id}`);
    ids.add(i.id);
  }
  for (const f of r.fallbacks) {
    if (!ids.has(f.target)) problems.push(`fallback targets unknown ingredient ${f.target}`);
    for (const a of f.alsoRemoves) if (!ids.has(a)) problems.push(`alsoRemoves unknown ${a}`);
  }
  const used = new Set<string>();
  for (const [n, s] of r.steps.entries()) {
    for (const m of s.text.matchAll(/\{([a-z0-9-]+)\}/g)) {
      used.add(m[1]);
      if (!ids.has(m[1])) problems.push(`step ${n + 1} references unknown ingredient {${m[1]}}`);
    }
    if (s.safety && !ids.has(s.safety.ing)) problems.push(`step ${n + 1} safety references unknown ingredient`);
    if (/\{[^}]*[^a-z0-9-}][^}]*\}/.test(s.text)) problems.push(`step ${n + 1} has a malformed token`);
  }
  for (const i of r.ingredients) {
    if (!i.optional && !used.has(i.id)) problems.push(`ingredient ${i.id} is never used in a step`);
  }
  return problems;
}

/**
 * Light, safe repairs to common model formatting slips before validation:
 * strips braces from safety ingredient ids, and when a safety note points at
 * no real ingredient, keeps the guidance by moving it into the step's tip.
 * Nothing is invented; unknown references are never guessed.
 */
export function normalizeRaw(json: unknown): unknown {
  if (!json || typeof json !== "object") return json;
  const r = json as { ingredients?: { id?: string }[]; fallbacks?: { target?: string; alsoRemoves?: string[] }[]; steps?: { safety?: { ing?: string; text?: string }; tip?: string }[] };
  const ids = new Set((r.ingredients ?? []).map((i) => i.id));
  // Normalize free-form category values the model sometimes produces.
  const SOURCES = new Set(["general", "asian", "indian", "international"]);
  const TAGS = new Set(["dairy", "meat", "fish", "egg", "gluten", "honey"]);
  const TAG_SYNONYMS: Record<string, string> = { shellfish: "fish", seafood: "fish", poultry: "meat", pork: "meat", beef: "meat", milk: "dairy", butter: "dairy", cheese: "dairy", eggs: "egg", wheat: "gluten" };
  const fix = (spec: unknown) => {
    if (!spec || typeof spec !== "object") return;
    const sp = spec as { source?: string; contains?: string[] };
    if (sp.source !== undefined && !SOURCES.has(sp.source)) sp.source = "international";
    if (Array.isArray(sp.contains)) {
      sp.contains = [...new Set(sp.contains.map((t) => TAG_SYNONYMS[String(t).toLowerCase()] ?? String(t).toLowerCase()).filter((t) => TAGS.has(t)))];
    }
  };
  for (const i of (r.ingredients ?? []) as { swaps?: { ing?: unknown }[] }[]) {
    fix(i);
    for (const sw of i.swaps ?? []) fix(sw.ing);
  }
  for (const f of (r.fallbacks ?? []) as { ing?: unknown }[]) fix(f.ing);
  // Drop optional extras that point at ingredients that do not exist (never guess a replacement).
  if (Array.isArray(r.fallbacks)) {
    r.fallbacks = r.fallbacks.filter((f) => ids.has(f.target));
    for (const f of r.fallbacks) if (Array.isArray(f.alsoRemoves)) f.alsoRemoves = f.alsoRemoves.filter((a) => ids.has(a));
  }
  for (const s of r.steps ?? []) {
    if (!s.safety) continue;
    const cleaned = String(s.safety.ing ?? "").replace(/[{}\s]/g, "");
    if (ids.has(cleaned)) {
      s.safety.ing = cleaned;
    } else {
      const text = s.safety.text;
      delete s.safety;
      if (text) s.tip = s.tip ? `${s.tip} ${text}` : text;
    }
  }
  return json;
}
