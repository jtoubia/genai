import type { Recipe } from '../types';
import { greenCurry, padKraPao, padThai } from './thai';
import { biryani, butterChicken, tikkaMasala } from './south-asian';
import { bibimbap, bulgogi, katsu } from './east-asian';
import { adobo, alPastor, carbonara, shawarma } from './global';

export const recipes: Recipe[] = [biryani, butterChicken, greenCurry, padThai, bulgogi, bibimbap, tikkaMasala, shawarma, alPastor, adobo, katsu, carbonara, padKraPao];

export const recipeById = (id: string) => recipes.find((r) => r.id === id);
