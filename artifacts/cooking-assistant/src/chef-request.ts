import { FORBIDDEN, type Diet, type Tag } from './data/types';

export type CardKind = 'Flavor' | 'Shopping' | 'Dietary' | 'Substitution' | 'Not applied' | 'Note';
export type AdaptationCard = { kind: CardKind; text: string };

/** Diets that an ingredient with these tags would violate. */
export function dietsViolated(contains: Tag[] | undefined, diets: Diet[]): Diet[] {
  if (!contains?.length) return [];
  return diets.filter((d) => FORBIDDEN[d].some((tag) => contains.includes(tag)));
}
