import type { DishId, Diet, Ingredient, PreparedPlan } from './prepared-plans';

export type SwapChoice = 'original' | 'substitute';

export type Fallback = {
  id: string;
  original: string;
  why: string;
  substitute: string;
  changes: string;
  omittable: string;
  /** Item that goes on the supermarket list when the substitute is used; null means simply omit. */
  sub: Ingredient | null;
  /** Specialty items that disappear when the substitute is used (beyond the original itself). */
  alsoRemoves?: string[];
};

export type AdaptationCard = { kind: 'Already have' | 'Flavor' | 'Shopping' | 'Dietary'; text: string };

export type ChefInterpretation = {
  hasRequest: boolean;
  understood: boolean;
  cards: AdaptationCard[];
  haveIds: string[];
  mild: boolean;
  easyShop: boolean;
  cantFindIds: string[];
};

const sub = (id: string, name: string, two: string, four: string, explanation: string): Ingredient => ({
  id, name, quantity: { 2: two, 4: four }, explanation, label: 'Approximation',
});

export const fallbacks: Record<DishId, Fallback[]> = {
  'green-curry': [
    {
      id: 'basil',
      original: 'Thai basil',
      why: 'Its anise-like, peppery aroma is the fresh finish that defines the curry.',
      substitute: 'Regular (Italian) basil plus a few mint leaves',
      changes: 'It will not taste identical: sweeter and less anise-forward, but it keeps a fresh herbal character.',
      omittable: 'Can be omitted, though the curry will taste flatter without a fresh herb.',
      sub: sub('basil-sub', 'Regular basil + a little mint', '¼ cup basil + 4 mint leaves', '½ cup basil + 8 mint leaves', 'Supermarket-friendly stand-in for Thai basil; stir in at the end.'),
    },
    {
      id: 'lime-leaves',
      original: 'Makrut lime leaves',
      why: 'They perfume the sauce with a deep, floral citrus note.',
      substitute: 'Lime zest',
      changes: 'Changes the aroma: brighter and less floral, but the dish can still be completed.',
      omittable: 'Can be omitted; add an extra squeeze of lime at the end.',
      sub: sub('lime-leaves-sub', 'Lime zest', 'Zest of ½ lime', 'Zest of 1 lime', 'Stir in near the end of simmering in place of makrut lime leaves.'),
    },
  ],
  biryani: [
    {
      id: 'biryani-spice',
      original: 'Biryani masala',
      why: 'A balanced blend that gives biryani its layered warm-spice flavor.',
      substitute: 'Garam masala plus a pinch of ground turmeric',
      changes: 'Warm and aromatic, but less complex and less specifically "biryani".',
      omittable: 'Not recommended to omit; it carries most of the flavor.',
      sub: sub('biryani-spice-sub', 'Garam masala + pinch of turmeric', '1½ tbsp + ¼ tsp', '3 tbsp + ½ tsp', 'Common supermarket spice blend standing in for biryani masala.'),
    },
    {
      id: 'whole-spices',
      original: 'Whole cinnamon, cardamom, cloves',
      why: 'They slowly infuse the rice as it steams.',
      substitute: 'Ground cinnamon and ground cardamom',
      changes: 'Flavor is less layered and can turn slightly muddy if overused; use sparingly.',
      omittable: 'Can be omitted if your masala is fragrant.',
      sub: sub('whole-spices-sub', 'Ground cinnamon + ground cardamom', '¼ tsp each', '½ tsp each', 'Stir into the rice with the water; easier to find than whole spices.'),
    },
    {
      id: 'saffron',
      original: 'Saffron threads',
      why: 'Adds floral aroma and golden streaks.',
      substitute: 'Skip it (no close substitute)',
      changes: 'You lose the floral aroma and gold color; the dish is still complete.',
      omittable: 'Yes, it is already optional.',
      sub: null,
    },
  ],
  'pad-kra-pao': [
    {
      id: 'holy-basil',
      original: 'Thai holy basil (kra pao)',
      why: 'The peppery, clove-like herb the dish is named after.',
      substitute: 'Thai sweet basil or regular basil',
      changes: 'Sweeter and softer, with less peppery bite; it does not closely reproduce holy basil.',
      omittable: 'Not recommended to omit; use a substitute basil instead.',
      sub: sub('holy-basil-sub', 'Thai sweet basil or regular basil', '1 packed cup leaves', '2 packed cups leaves', 'Approximation for holy basil; toss in just until wilted.'),
      alsoRemoves: ['sweet-basil'],
    },
    {
      id: 'chili',
      original: 'Thai chilies',
      why: 'Sharp, clean heat that balances the salty sauce.',
      substitute: 'Fresno or serrano chili, or red pepper flakes',
      changes: 'Usually milder and less fruity-sharp; adjust to taste.',
      omittable: 'Can be omitted for a no-heat version.',
      sub: sub('chili-sub', 'Fresno chili or red pepper flakes', '1 chili or ½ tsp flakes', '2 chilies or 1 tsp flakes', 'Supermarket-friendly heat in place of Thai chilies.'),
    },
    {
      id: 'oyster',
      original: 'Oyster sauce',
      why: 'Savory-sweet gloss that thickens the sauce.',
      substitute: 'Extra soy sauce plus a little more sugar',
      changes: 'Thinner and less rounded; the sauce will be saltier and less glossy.',
      omittable: 'Can be omitted with the soy-and-sugar adjustment.',
      sub: sub('oyster-sub', 'Extra soy sauce + sugar', '1 tsp soy + ½ tsp sugar', '2 tsp soy + 1 tsp sugar', 'Approximates oyster sauce; many supermarkets also stock oyster sauce.'),
    },
  ],
};

const keywords: Record<string, RegExp> = {
  chicken: /\bchicken\b/, rice: /\brice\b/, basmati: /\b(basmati|rice)\b/, 'coconut-milk': /\bcoconut\b/,
  pepper: /\bbell peppers?\b/, zucchini: /\bzucchini\b/, lime: /\blimes?\b(?!\s+leaves?)/, oil: /\boil\b/,
  'fish-sauce': /\bfish sauce\b/, onion: /\bonions?\b/, tomato: /\btomato(es)?\b/, 'ginger-garlic': /\bginger\b/,
  yogurt: /\byogh?urt\b/, ghee: /\bghee\b/, cilantro: /\b(cilantro|coriander leaves)\b/, mint: /\bmint\b/,
  garlic: /\bgarlic\b/, soy: /\bsoy\b/, sugar: /\bsugar\b/, egg: /\beggs?\b/, 'green-paste': /\bcurry paste\b/,
  basil: /\b(thai )?basil\b/, 'lime-leaves': /\b(makrut|kaffir|lime leaf|lime leaves)\b/, 'biryani-spice': /\b(masala|biryani spice)/,
  'whole-spices': /\b(whole spices|cardamom|cinnamon|cloves?)\b/, saffron: /\bsaffron\b/, chili: /\b(chil(i|e|li)(e?s)?|chillies)\b/,
  oyster: /\boyster\b/, 'holy-basil': /\b(holy basil|kra pao|basil)\b/, 'sweet-basil': /\bsweet basil\b/,
};

const NEG = /(can'?t find|cannot find|could ?n'?t find|can not find|don'?t have|do not have|no access|unavailable|hard to find|not available|out of|missing|can'?t get|cannot get)/;
const HAVE = /(already have|i have|i've got|ive got|i got|have some|at home)/;
const MILD = /(mild|less spicy|not (too |very )?spicy|no heat|less heat|gentle|not hot|less hot|low spice|tone down)/;
const EASY = /(one store|1 store|single store|one shop|one trip|only one|easy to find|easier to find|easiest|simple shopping|simplest|supermarket only|only.*supermarket|regular (grocery|store)|common ingredients)/;

export function interpretRequest(raw: string, plan: PreparedPlan, diet: Diet): ChefInterpretation {
  const text = raw.trim().toLowerCase().replace(/[’]/g, "'");
  const empty: ChefInterpretation = { hasRequest: false, understood: false, cards: [], haveIds: [], mild: false, easyShop: false, cantFindIds: [] };
  if (!text) return empty;
  const clauses = text.split(/[.;!?\n]|,|\bbut\b|\band (?:i|make|help|please)\b/).map((c) => c?.trim()).filter(Boolean) as string[];
  const items = [...plan.common, ...plan.specialty];
  const dishFallbacks = fallbacks[plan.id];
  const haveIds = new Set<string>();
  const cantFind = new Set<string>();
  let negContext = false;
  for (const clause of clauses) {
    if (NEG.test(clause)) negContext = true;
    else if (HAVE.test(clause)) negContext = false;
    const isNeg = NEG.test(clause) || (negContext && !HAVE.test(clause) && /^(or |and )?[\w\s]+$/.test(clause) && !MILD.test(clause) && !EASY.test(clause));
    if (isNeg) {
      dishFallbacks.forEach((f) => { if (keywords[f.id]?.test(clause)) cantFind.add(f.id); });
    } else if (HAVE.test(clause)) {
      items.forEach((i) => { if (i.id !== 'water' && keywords[i.id]?.test(clause)) haveIds.add(i.id); });
    }
  }
  // Pad kra pao: "basil" in a have-clause shouldn't remove both basils ambiguously; keep holy basil if only generic basil mentioned.
  const mild = MILD.test(text);
  const easyShop = EASY.test(text);
  const cards: AdaptationCard[] = [];
  const nameOf = (id: string) => items.find((i) => i.id === id)?.name ?? id;
  if (haveIds.size) {
    const names = [...haveIds].map(nameOf);
    const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0];
    cards.push({ kind: 'Already have', text: `${list[0].toUpperCase()}${list.slice(1)} removed from your shopping list.` });
  }
  if (mild) {
    const flavor: Record<DishId, string> = {
      'green-curry': 'Reduced the green curry paste by half (it carries the chili heat) while keeping the lime leaves and basil so the curry stays aromatic.',
      biryani: 'Reduced the biryani masala by a third so the warm spices stay fragrant without much heat. Taste and add more at the end if you like.',
      'pad-kra-pao': 'Cut the Thai chilies in half and suggest removing the seeds, so the stir-fry keeps its basil-and-garlic character with gentle heat.',
    };
    cards.push({ kind: 'Flavor', text: flavor[plan.id] });
  }
  const swapIds = new Set<string>([...cantFind, ...(easyShop ? dishFallbacks.map((f) => f.id) : [])]);
  if (swapIds.size) {
    const fs = dishFallbacks.filter((f) => swapIds.has(f.id));
    const desc = fs.map((f) => `${f.original} → ${f.substitute.toLowerCase()}`).join('; ');
    const reason = easyShop
      ? 'so the trip can be completed at one regular supermarket'
      : 'because you said you cannot find them';
    const count = fs.length === 1 ? 'one specialty ingredient' : `${['', '', 'two', 'three', 'four'][fs.length] || fs.length} specialty ingredients`;
    cards.push({ kind: 'Shopping', text: `Recommended swapping ${count} for supermarket-friendly alternatives ${reason}: ${desc}. These are somewhat less authentic; you can keep the originals in the review below.` });
  }
  const understood = cards.length > 0;
  if (understood && diet === 'Dairy-free' && plan.id === 'biryani') {
    cards.push({ kind: 'Dietary', text: 'Dairy-free kept as you chose: non-dairy yogurt and neutral oil still replace yogurt and ghee. Expect less tang and a less buttery finish.' });
  }
  return { hasRequest: true, understood, cards, haveIds: [...haveIds], mild, easyShop, cantFindIds: [...cantFind] };
}

export function recommendedChoices(plan: PreparedPlan, interp: ChefInterpretation): Record<string, SwapChoice> {
  const out: Record<string, SwapChoice> = {};
  fallbacks[plan.id].forEach((f) => {
    out[f.id] = interp.understood && (interp.easyShop || interp.cantFindIds.includes(f.id)) ? 'substitute' : 'original';
  });
  return out;
}

function mildify(item: Ingredient, dish: DishId): Ingredient {
  const map: Record<string, Partial<Record<DishId, [string, string, string]>>> = {
    'green-paste': { 'green-curry': ['1 tbsp', '2 tbsp', 'Halved for a milder curry. Taste after simmering and add more only if you want more heat.'] },
    'biryani-spice': { biryani: ['1 tbsp', '2 tbsp', 'Reduced for a milder biryani; the whole spices keep it fragrant.'] },
    chili: { 'pad-kra-pao': ['1', '2', 'Halved for a milder stir-fry; remove the seeds for even gentler heat.'] },
  };
  const m = map[item.id]?.[dish];
  if (!m) return item;
  return { ...item, quantity: { 2: m[0], 4: m[1] }, explanation: m[2], label: 'Approximation' };
}

export function buildShoppingPlan(plan: PreparedPlan, interp: ChefInterpretation, choices: Record<string, SwapChoice>) {
  const dishFallbacks = fallbacks[plan.id];
  const have = new Set(interp.understood ? interp.haveIds : []);
  const adjust = (i: Ingredient) => (interp.understood && interp.mild ? mildify(i, plan.id) : i);
  const atHome = [...plan.common, ...plan.specialty].filter((i) => have.has(i.id));
  const removedBySwap = new Set<string>();
  const subs: Ingredient[] = [];
  dishFallbacks.forEach((f) => {
    if (choices[f.id] === 'substitute') {
      removedBySwap.add(f.id);
      f.alsoRemoves?.forEach((r) => removedBySwap.add(r));
      if (f.sub && !have.has(f.id)) subs.push(f.sub);
    }
  });
  const common = [...plan.common.filter((i) => !have.has(i.id)).map(adjust), ...subs];
  const specialty = plan.specialty.filter((i) => !have.has(i.id) && !removedBySwap.has(i.id)).map(adjust);
  return { atHome, common, specialty, fallbacks: dishFallbacks };
}
