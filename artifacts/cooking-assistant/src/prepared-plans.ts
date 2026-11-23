/**
 * Shared labels. Recipe data lives in src/data/recipes/*.ts; AI-written
 * recipes are converted in src/data/live-recipe.ts.
 */
export { recipes, recipeById } from './data/recipes';
export type { Diet, Recipe } from './data/types';

export const allergyText = 'Allergy note: CuisineIQ cannot guarantee that any ingredient or packaged product is free of allergens. Always read labels and "may contain" statements.';
export const aiReviewText = 'This recipe was written by live AI. Review quantities, times and temperatures before cooking.';
export const aiTagText = 'Ingredient dietary tags on AI-written recipes are not guaranteed; check each ingredient and label.';

export const aboutPoints = [
  'Live AI writes recipes for dishes outside the prepared set. Each one is checked against a strict structure on the server before it is shown, and is labeled "AI-generated recipe".',
  'The 13 prepared recipes were written by hand and are labeled "Prepared recipe".',
  'Adapting a recipe to your diet, spice level, servings and shopping preference is rule-based: CuisineIQ uses ingredient tags in the structured recipe, and the AI is not involved. The shopping list is the ingredient list minus the items you check as already at home.',
  'Your ZIP code is saved for your plan only. There is no live store search, inventory or map in this prototype.',
  'Always check packaged labels. Nothing here is an allergy guarantee.',
];
