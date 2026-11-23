import type { FormEvent } from 'react';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import { recipes } from '../data/recipes';
import { DIETS, type Diet, type Recipe, type Spice } from '../data/types';
import type { Strategy } from '../lib/plan-engine';
import { describeLocation, parseLocation } from '../lib/location';
import { DishThumb, SourceBadge } from './Shared';

export type Choices = { dish: string; servings: number; diets: Diet[]; spice: Spice; location: string; strategy: Strategy };

type Props = {
  choices: Choices;
  setChoices: (c: Choices) => void;
  recipe: Recipe | undefined;
  liveRecipes: Recipe[];
  error: string;
  clearError: () => void;
  locError: string;
  setLocError: (m: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onBrowse: () => void;
  hasPlan: boolean;
};

const SPICES: Spice[] = ['Mild', 'Medium', 'Spicy'];

export function CustomizeForm({ choices, setChoices, recipe, liveRecipes, error, clearError, locError, setLocError, onSubmit, onBrowse, hasPlan }: Props) {
  const set = (patch: Partial<Choices>) => setChoices({ ...choices, ...patch });
  const toggleDiet = (d: Diet) => set({ diets: choices.diets.includes(d) ? choices.diets.filter((x) => x !== d) : [...choices.diets, d] });
  const servings = (n: number) => set({ servings: Math.min(8, Math.max(1, n)) });
  const loc = parseLocation(choices.location);
  const locDesc = describeLocation(loc);

  function checkLocation() {
    setLocError(loc.kind === 'invalid' ? loc.message : '');
  }

  return (
    <section id="customize" className="panel form-panel anchor-section" aria-labelledby="form-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Step 2 · Customize your recipe</p>
          <h2 id="form-heading">Set your table</h2>
          <p>Tell us who you are cooking for and what you have. Everything except the dish is optional.</p>
        </div>
      </div>
      <form id="choice-form" onSubmit={onSubmit} noValidate>
        <div className="form-grid">
          <div className="form-col">
            <fieldset className="field plain-fieldset">
              <legend className="field-label">Your dish <span className="required">Required</span></legend>
              {recipe ? (
                <div className="chosen-dish" data-testid="text-chosen-dish">
                  <DishThumb recipe={recipe} size={56} className="chosen-thumb" />
                  <span>
                    <strong>{recipe.name}</strong>
                    <span>{recipe.cuisine} · about {recipe.prep + recipe.cook} min</span>
                    <SourceBadge recipe={recipe} testId="badge-chosen-source" />
                  </span>
                  <button type="button" className="link-button" onClick={onBrowse} data-testid="button-browse-dishes">Change</button>
                </div>
              ) : (
                <p className="field-hint" style={{ marginTop: 0, marginBottom: 8 }}>Search for any dish in Step 1, or choose from the list.</p>
              )}
              <label className="sr-only" htmlFor="dish">Choose a dish from the list</label>
              <div className="select-wrap">
                <select
                  id="dish"
                  value={choices.dish}
                  required
                  aria-invalid={Boolean(error && !choices.dish)}
                  aria-describedby={error ? 'dish-error' : undefined}
                  className={error && !choices.dish ? 'invalid' : ''}
                  onChange={(e) => { set({ dish: e.target.value }); clearError(); }}
                  data-testid="select-dish"
                >
                  <option value="">Choose a dish</option>
                  <optgroup label="Prepared recipes">
                    {recipes.map((d) => <option value={d.id} key={d.id}>{d.name}</option>)}
                  </optgroup>
                  {liveRecipes.length > 0 && (
                    <optgroup label="AI-generated this session">
                      {liveRecipes.map((d) => <option value={d.id} key={d.id}>{d.name}</option>)}
                    </optgroup>
                  )}
                </select>
              </div>
              {error && <p id="dish-error" className="error-message" role="alert" data-testid="error-required-dish">{error}</p>}
            </fieldset>

            <div className="field">
              <label className="field-label" htmlFor="servings">How many servings?</label>
              <div className="stepper">
                <button type="button" aria-label="Fewer servings" onClick={() => servings(choices.servings - 1)} disabled={choices.servings <= 1} data-testid="button-servings-minus"><Minus size={15} /></button>
                <div className="select-wrap">
                  <select id="servings" value={choices.servings} onChange={(e) => servings(Number(e.target.value))} data-testid="select-servings">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'serving' : 'servings'}</option>)}
                  </select>
                </div>
                <button type="button" aria-label="More servings" onClick={() => servings(choices.servings + 1)} disabled={choices.servings >= 8} data-testid="button-servings-plus"><Plus size={15} /></button>
              </div>
            </div>

            <fieldset className="field plain-fieldset" data-testid="select-diet">
              <legend className="field-label">Dietary preferences</legend>
              <div className="chip-group">
                <label className={`chip-option${choices.diets.length === 0 ? ' on' : ''}`}>
                  <input type="checkbox" checked={choices.diets.length === 0} onChange={() => set({ diets: [] })} data-testid="checkbox-diet-none" />
                  None
                </label>
                {DIETS.map((d) => (
                  <label key={d} className={`chip-option${choices.diets.includes(d) ? ' on' : ''}`}>
                    <input type="checkbox" checked={choices.diets.includes(d)} onChange={() => toggleDiet(d)} data-testid={`checkbox-diet-${d.toLowerCase()}`} />
                    {d}
                  </label>
                ))}
              </div>
              <p className="field-hint">Ingredients that cannot be reliably adapted are flagged for you to decide. Always check labels.</p>
            </fieldset>

            <fieldset className="field plain-fieldset">
              <legend className="field-label">Spice preference</legend>
              <div className="segmented" role="radiogroup">
                {SPICES.map((s) => (
                  <label key={s} className={choices.spice === s ? 'on' : ''}>
                    <input type="radio" name="spice" value={s} checked={choices.spice === s} onChange={() => set({ spice: s })} data-testid={`radio-spice-${s.toLowerCase()}`} />
                    {s}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="form-col">
            <fieldset className="field plain-fieldset near-you">
              <legend className="field-label">Shopping location <span className="optional">Optional</span></legend>
              <label className="sr-only" htmlFor="location">ZIP code</label>
              <input
                id="location"
                className={`text-input${locError ? ' invalid' : ''}`}
                value={choices.location}
                onChange={(e) => { set({ location: e.target.value }); if (locError) setLocError(''); }}
                onBlur={checkLocation}
                placeholder="ZIP code, e.g. 46556"
                inputMode="numeric"
                autoComplete="postal-code"
                aria-invalid={Boolean(locError)}
                aria-describedby={locError ? 'location-error' : 'location-hint'}
                data-testid="input-location"
              />
              {locError ? (
                <p id="location-error" className="error-message" role="alert" data-testid="error-location">{locError}</p>
              ) : (
                <p id="location-hint" className="field-hint" data-testid="text-location-preview">
                  {locDesc ? <>Saved as {locDesc.main}{locDesc.detail}</> : 'Saved with your plan for future local grocery help.'}
                </p>
              )}
              <div className="strategy-group" role="radiogroup" aria-label="Shopping preference">
                {([['simplest', 'Simplest Shopping Trip', 'Easier-to-find swaps are recommended.'], ['authentic', 'Most Authentic Ingredients', 'Traditional ingredients stay recommended.']] as const).map(([v, label, hint]) => (
                  <label key={v} className={`strategy-option${choices.strategy === v ? ' on' : ''}`}>
                    <input type="radio" name="strategy" value={v} checked={choices.strategy === v} onChange={() => set({ strategy: v })} data-testid={`radio-strategy-${v}`} />
                    <span><strong>{label}</strong><span>{hint}</span></span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        <button className="submit-button" type="submit" data-testid="button-submit-plan">
          {hasPlan ? 'Update my plan' : 'Create my shopping plan.'}
          <ArrowRight size={16} aria-hidden="true" />
        </button>
        <p className="quiet-note">Your choices adapt the recipe by rule; nothing is regenerated. You stay in charge of every swap.</p>
      </form>
    </section>
  );
}
