export type DishId = 'green-curry' | 'biryani' | 'pad-kra-pao';
export type Diet = 'No restriction' | 'Dairy-free';
export type Ingredient = {
  id: string;
  name: string;
  quantity: Record<2 | 4, string>;
  explanation: string;
  label?: 'Traditional' | 'Approximation' | 'Dairy-free alternative';
};
export type IngredientGroup = {
  title: string;
  store: string;
  items: Ingredient[];
};
export type PreparedPlan = {
  id: DishId;
  name: string;
  origin: string;
  summary: string;
  common: Ingredient[];
  specialty: Ingredient[];
  method: string;
  dietaryNote: string;
};

const ingredient = (
  id: string,
  name: string,
  two: string,
  four: string,
  explanation: string,
  label?: Ingredient['label'],
): Ingredient => ({ id, name, quantity: { 2: two, 4: four }, explanation, label });

export const dishes: { id: DishId; name: string; origin: string }[] = [
  { id: 'green-curry', name: 'Thai green curry', origin: 'Thailand · fragrant, coconut-rich' },
  { id: 'biryani', name: 'Chicken biryani', origin: 'South Asia · layered, aromatic rice' },
  { id: 'pad-kra-pao', name: 'Pad kra pao', origin: 'Thailand · quick basil stir-fry' },
];

export const plans: Record<DishId, PreparedPlan> = {
  'green-curry': {
    id: 'green-curry',
    name: 'Thai green curry',
    origin: 'Thailand',
    summary: 'A friendly, fragrant curry: simmer the paste in coconut milk, then cook the chicken and vegetables until tender.',
    common: [
      ingredient('chicken', 'Boneless chicken thighs', '300 g', '600 g', 'Cut into bite-size pieces; thighs stay tender as they simmer.'),
      ingredient('coconut-milk', 'Coconut milk', '1 can (400 ml)', '2 cans (800 ml)', 'The creamy, dairy-free base that carries the curry’s aromas.'),
      ingredient('rice', 'Jasmine rice', '150 g (¾ cup)', '300 g (1½ cups)', 'A lightly scented rice for serving; rinse until the water is less cloudy.'),
      ingredient('pepper', 'Bell pepper', '1', '2', 'Adds sweetness and a little crunch; slice into strips.'),
      ingredient('zucchini', 'Zucchini', '1 small', '2 small', 'A mild vegetable that softens quickly in the curry.'),
      ingredient('lime', 'Lime', '½', '1', 'A squeeze at the end brightens the rich coconut sauce.'),
      ingredient('oil', 'Neutral cooking oil', '1 tbsp', '2 tbsp', 'For briefly frying the curry paste to release its aroma.'),
      ingredient('fish-sauce', 'Fish sauce', '1 tbsp', '2 tbsp', 'A salty, savory seasoning made from fermented fish; use to taste.'),
    ],
    specialty: [
      ingredient('green-paste', 'Thai green curry paste', '2 tbsp', '4 tbsp', 'A concentrated blend of green chilies, herbs, aromatics, and spices. Start with less if you prefer mild heat.', 'Traditional'),
      ingredient('basil', 'Thai basil', '¼ cup leaves', '½ cup leaves', 'An anise-like, peppery herb stirred in at the end; it keeps a distinct aroma.', 'Traditional'),
      ingredient('lime-leaves', 'Makrut lime leaves', '2 leaves', '4 leaves', 'A deeply citrusy leaf added whole to perfume the sauce; remove before eating.', 'Traditional'),
    ],
    method: 'Warm oil and fry the curry paste for about a minute. Add coconut milk, chicken, and lime leaves; simmer until chicken is cooked through. Add vegetables until just tender. Season with fish sauce and lime, then fold in Thai basil. Serve with rice.',
    dietaryNote: 'This prepared green curry recipe contains no dairy; no dairy substitution is needed. Packaged curry paste and other products can vary, so check every label for ingredients that matter to you. This is not an allergy-safety claim.',
  },
  biryani: {
    id: 'biryani',
    name: 'Chicken biryani',
    origin: 'South Asia',
    summary: 'A one-pot, warmly spiced rice dish. Marinate the chicken, then gently steam it with fragrant basmati.',
    common: [
      ingredient('chicken', 'Chicken thighs', '300 g', '600 g', 'Cut into medium pieces; they remain juicy during the covered cooking.'),
      ingredient('basmati', 'Basmati rice', '200 g (1 cup)', '400 g (2 cups)', 'Long-grain rice with a delicate aroma; rinse and soak for 20 minutes, then drain.'),
      ingredient('onion', 'Yellow onion', '1 medium', '2 medium', 'Sliced and browned for sweetness and a savory base.'),
      ingredient('tomato', 'Tomato', '1 medium', '2 medium', 'Adds gentle acidity and moisture to the chicken masala.'),
      ingredient('ginger-garlic', 'Ginger-garlic paste', '1 tbsp', '2 tbsp', 'A finely ground aromatic base; grated ginger and garlic work if paste is unavailable.', 'Approximation'),
      ingredient('yogurt', 'Plain yogurt', '⅓ cup', '⅔ cup', 'A tangy marinade that helps coat and tenderize the chicken.'),
      ingredient('ghee', 'Ghee', '2 tbsp', '4 tbsp', 'Clarified butter used for browning and layering; it contributes a buttery, rich aroma.', 'Traditional'),
      ingredient('cilantro', 'Fresh cilantro', '¼ cup leaves', '½ cup leaves', 'A fresh, green finish layered between rice and chicken.'),
      ingredient('mint', 'Fresh mint', '¼ cup leaves', '½ cup leaves', 'Adds cool herbal lift and balances the warm spices.'),
      ingredient('water', 'Water', '1¼ cups', '2½ cups', 'For gently steaming the rice and chicken together; adjust slightly for your pot.'),
    ],
    specialty: [
      ingredient('biryani-spice', 'Biryani masala', '1½ tbsp', '3 tbsp', 'A blended spice mix, commonly including warm spices such as cumin, coriander, and cardamom. Brands vary; check the label.', 'Traditional'),
      ingredient('whole-spices', 'Whole spices: cinnamon, cardamom, cloves', '1 small stick, 2 pods, 3 cloves', '2 small sticks, 4 pods, 6 cloves', 'Whole aromatics infuse the rice as it steams; remove or eat around them.', 'Traditional'),
      ingredient('saffron', 'Saffron threads (optional)', 'A small pinch', '2 small pinches', 'Adds floral aroma and gold color. There is no close substitute for saffron’s particular aroma; simply omit it if unavailable.', 'Traditional'),
    ],
    method: 'Coat chicken with the yogurt listed for your dietary choice, biryani masala, and ginger-garlic paste. Brown onion in the listed cooking fat; add chicken and tomato. Fold in drained rice, water, whole spices, herbs, and saffron if using. Cover tightly and cook over low heat until rice is tender and chicken is cooked through.',
    dietaryNote: 'This prepared version uses yogurt and ghee. For Dairy-free mode, they are replaced with plain unsweetened non-dairy yogurt and neutral cooking oil. Expect less tang and creaminess from the yogurt and a less buttery, rich finish from the oil. Check packaged labels; this plan does not claim allergy safety.',
  },
  'pad-kra-pao': {
    id: 'pad-kra-pao',
    name: 'Pad kra pao',
    origin: 'Thailand',
    summary: 'A fast, savory Thai basil stir-fry. Prep everything first; the cooking itself takes only a few minutes.',
    common: [
      ingredient('chicken', 'Ground chicken', '300 g', '600 g', 'Cooks quickly and absorbs the salty, savory sauce.'),
      ingredient('rice', 'Jasmine rice', '150 g (¾ cup)', '300 g (1½ cups)', 'A mild, fragrant base for the strongly seasoned stir-fry.'),
      ingredient('garlic', 'Garlic', '3 cloves', '6 cloves', 'Crushed or finely chopped for a pungent aromatic start.'),
      ingredient('oil', 'Neutral cooking oil', '1 tbsp', '2 tbsp', 'Handles the high heat needed for a quick stir-fry.'),
      ingredient('soy', 'Soy sauce', '1 tbsp', '2 tbsp', 'Adds salty, fermented depth to the sauce; check the packaged label.'),
      ingredient('fish-sauce', 'Fish sauce', '1 tsp', '2 tsp', 'A salty, fermented seasoning that adds a distinctive savory backbone.'),
      ingredient('sugar', 'Sugar', '1 tsp', '2 tsp', 'A small amount balances the salty sauces and chili heat.'),
      ingredient('egg', 'Eggs (optional, for serving)', '2', '4', 'Fry until the edges are crisp and serve on top, if you like.'),
    ],
    specialty: [
      ingredient('chili', 'Thai chilies', '2', '4', 'Small, hot chilies; remove seeds or reduce the amount to make the dish gentler.', 'Traditional'),
      ingredient('oyster', 'Oyster sauce', '1 tbsp', '2 tbsp', 'A thick, savory-sweet sauce traditionally made with oyster extract; check the label.', 'Traditional'),
      ingredient('holy-basil', 'Thai holy basil (kra pao)', '1 packed cup leaves', '2 packed cups leaves', 'The traditional herb: peppery, clove-like, and slightly sharp, with a characteristic aroma. Availability at the demo grocer is uncertain; call or check before visiting. No close substitute reproduces its distinctive character.', 'Traditional'),
      ingredient('sweet-basil', 'Thai sweet basil (optional substitute for holy basil)', '1 packed cup leaves', '2 packed cups leaves', 'Use this instead of holy basil if unavailable, not in addition to it. Sweet basil is sweeter, softer, and more anise-like with less peppery bite. This approximation does not closely reproduce holy basil.', 'Approximation'),
    ],
    method: 'Cook rice. Stir-fry garlic and chilies in hot oil, add chicken and cook through. Add sauces and sugar, then toss in Thai holy basil just until wilted. Serve over rice; add a fried egg if desired.',
    dietaryNote: 'This prepared pad kra pao recipe contains no dairy; no dairy substitution is needed. Check all packaged sauce labels for ingredients that matter to you. This is not an allergy-safety claim.',
  },
};

export const locationText = 'South Bend, Indiana — demo location';
export const prototypeDisclosure = 'Prototype: prepared recommendations and illustrative store options; no live AI or inventory checks.';
export const storeOptionDisclosure = 'Illustrative store option — check availability before visiting.';

export function planFor(dish: DishId, diet: Diet): PreparedPlan {
  const plan = plans[dish];
  if (dish !== 'biryani' || diet !== 'Dairy-free') return plan;
  const common = plan.common.map((item) => {
    if (item.id === 'yogurt') {
      return ingredient('yogurt', 'Plain unsweetened non-dairy yogurt', '⅓ cup', '⅔ cup', 'Dairy-free marinade alternative. Choose a neutral, unsweetened style; it tenderizes but is less tangy and creamy than dairy yogurt.', 'Dairy-free alternative');
    }
    if (item.id === 'ghee') {
      return ingredient('ghee', 'Neutral cooking oil', '2 tbsp', '4 tbsp', 'Dairy-free alternative to ghee for browning and layering; it tastes less buttery and rich.', 'Dairy-free alternative');
    }
    return item;
  });
  return { ...plan, common };
}
