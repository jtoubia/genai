export type Diet = 'Dairy-free' | 'Vegetarian' | 'Vegan' | 'Gluten-free';
export const DIETS: Diet[] = ['Dairy-free', 'Vegetarian', 'Vegan', 'Gluten-free'];

/** What an ingredient contains, used to check it against selected diets. */
export type Tag = 'dairy' | 'meat' | 'fish' | 'egg' | 'gluten' | 'honey';
export const FORBIDDEN: Record<Diet, Tag[]> = {
  'Dairy-free': ['dairy'],
  Vegetarian: ['meat', 'fish'],
  Vegan: ['meat', 'fish', 'dairy', 'egg', 'honey'],
  'Gluten-free': ['gluten'],
};

export type Spice = 'Mild' | 'Medium' | 'Spicy';
export const SPICE_FACTOR: Record<Spice, number> = { Mild: 0.5, Medium: 1, Spicy: 1.5 };

/** Where an ingredient is most likely shelved, by store category. */
export type SourceKind = 'general' | 'asian' | 'indian' | 'international';

export type IngLabel = 'Traditional' | 'Approximation' | 'Dairy-free alternative' | 'Diet alternative' | 'Does not meet your diet' | 'Spice adjusted';

export type IngredientSpec = {
  name: string;
  /** Amount for 2 servings; null when the amount is descriptive only. */
  amt: number | null;
  unit?: string;
  units?: string;
  /** Exact prepared wording for 2 and 4 servings (kept from the original prepared plans). */
  text?: { 2: string; 4: string };
  note: string;
  contains?: Tag[];
  specialty?: boolean;
  source?: SourceKind;
  label?: IngLabel;
  heat?: boolean;
};

export type DietSwap = {
  /** auto: safe, conventional swap applied when the diet is selected (and explained). Otherwise offered as a choice. */
  auto?: boolean;
  ing: IngredientSpec;
  why: string;
};

export type IngredientDef = IngredientSpec & {
  id: string;
  optional?: boolean;
  /** Extra words a cook might use for this ingredient ("I already have rice"). */
  k?: string[];
  swaps?: DietSwap[];
};

export type FallbackDef = {
  target: string;
  why: string;
  substitute: string;
  changes: string;
  omittable: string;
  /** null means: simply leave it out. */
  ing: IngredientSpec | null;
  alsoRemoves?: string[];
};

export type Step = {
  title: string;
  /** Use {ingredient-id} tokens; they render the current (adapted) ingredient. */
  text: string;
  minutes?: string;
  tip?: string;
  /** Shown only while the referenced ingredient is still meat, poultry, or egg. */
  safety?: { ing: string; text: string };
  heat?: Partial<Record<Spice, string>>;
  /** Replacement text used when the keyed ingredient is substituted or left out. */
  alt?: Record<string, string>;
};

export type Recipe = {
  id: string;
  name: string;
  cuisine: string;
  origin: string;
  image: string;
  alt: string;
  aliases: string[];
  summary: string;
  prep: number;
  cook: number;
  difficulty: 'Easy' | 'Moderate' | 'Involved';
  equipment: string[];
  ingredients: IngredientDef[];
  fallbacks: FallbackDef[];
  steps: Step[];
  dietaryNote: string;
  method?: string;
};

export const ing = (id: string, name: string, amt: number | null, unit: string, note: string, extra: Partial<IngredientDef> = {}): IngredientDef => ({ id, name, amt, unit, note, ...extra });
export const t = (two: string, four: string) => ({ 2: two, 4: four });
export const img = (file: string) => `${import.meta.env?.BASE_URL ?? "/"}images/${file}`;
