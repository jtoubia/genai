/**
 * Shared prepared-data labels. Recipe data now lives in src/data/recipes/*.ts
 * (one structured model per dish); this module keeps the original disclosure
 * strings and re-exports the catalog for older imports.
 */
export { recipes, recipeById } from './data/recipes';
export type { Diet, Recipe } from './data/types';

export const locationText = 'South Bend, Indiana (ZIP 46601) — demo location';
export const prototypeDisclosure = 'Prototype: prepared recommendations and illustrative store options; no live AI or inventory checks.';
export const storeOptionDisclosure = 'Illustrative store option — check availability before visiting.';
export const aiSimulationText = 'This prototype demonstrates how AI could interpret your cooking and shopping constraints and adapt a plan. Current recommendations use prepared prototype logic rather than a live generative-AI model or live store inventory.';
export const allergyText = 'Allergy note: CuisineIQ cannot guarantee that any ingredient or packaged product is free of allergens. Always read product labels and "may contain" or cross-contact statements before buying and cooking.';
