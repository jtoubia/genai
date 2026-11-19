import type { FormEvent } from 'react';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import { recipes } from '../data/recipes';
import { DIETS, type Diet, type Recipe, type Spice } from '../data/types';
import type { Strategy } from '../lib/plan-engine';

export type Choices = { dish: string; servings: number; diets: Diet[]; spice: Spice; atHome: string; request: string; location: string; strategy: Strategy };

type Props = {
  choices: Choices;
  setChoices: (c: Choices) => void;
  recipe: Recipe | undefined;
  error: string;
  clearError: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onBrowse: () => void;
  hasPlan: boolean;
};

const SPICES: Spice[] = ['Mild', 'Medium', 'Spicy'];

export function CustomizeForm({ choices, setChoices, recipe, error, clearError, onSubmit, onBrowse, hasPlan }: Props) {
  const set = (patch: Partial<Choices>) => setChoices({ ...choices, ...patch });
  const toggleDiet = (d: Diet) => set({ diets: choices.diets.includes(d) ? choices.diets.filter((x) => x !== d) : [...choices.diets, d] });
  const servings = (n: number) => set({ servings: Math.min(8, Math.max(1, n)) });

  return (
    <section id="customize" className="panel form-panel anchor-section" aria-labelledby="form-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Customize</p>
          <h2 id="form-heading">Set your table</h2>
          <p>Tell us who you are cooking for and what you have. Everything else is optional.</p>
        </div>
        <span className="step-tag">Your plan</span>
      </div>
      <form id="choice-form" onSubmit={onSubmit} noValidate>
        <div className="form-grid">
          <div className="form-col">
            <fieldset className="field plain-fieldset">
              <legend className="field-label">What would you like to cook? <span className="required">Required</span></legend>
              {recipe ? (
                <div className="chosen-dish" data-testid="text-chosen-dish">
                  <img src={recipe.image} alt="" width={56} height={56} />
                  <span><strong>{recipe.name}</strong><span>{recipe.cuisine} · about {recipe.prep + recipe.cook} min</span></span>
                  <button type="button" className="link-button" onClick={onBrowse} data-testid="button-browse-dishes">Change</button>
                </div>
              ) : (
                <p className="field-hint" style={{ marginTop: 0, marginBottom: 8 }}>Pick a dish from Discover above, or choose from the list.</p>
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
                  {recipes.map((d) => <option value={d.id} key={d.id}>{d.name}</option>)}
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
              <p className="field-hint">Choose any that apply. Ingredients that cannot be reliably adapted are flagged for you to decide. Packaged ingredients vary. Always check labels for your needs.</p>
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
            <div className="field">
              <label className="field-label" htmlFor="at-home">Ingredients already at home <span className="optional">Optional</span></label>
              <input id="at-home" className="text-input" value={choices.atHome} onChange={(e) => set({ atHome: e.target.value })} placeholder="Chicken, rice, garlic, onions" data-testid="input-at-home" />
              <p className="field-hint">Separate with commas. Matching items move to “Already at home”.</p>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="chef-request">Tell the chef what you need <span className="optional">Optional</span></label>
              <textarea
                id="chef-request"
                className="chef-textarea"
                rows={5}
                value={choices.request}
                placeholder="I want the dish to taste authentic, but I can't find specialty ingredients. I already have chicken and rice, and I'd prefer to shop at one store."
                onChange={(e) => set({ request: e.target.value })}
                data-testid="input-chef-request"
              />
              <p className="field-hint">Optional — tell us what you already have, ingredients you cannot find, how you want the dish to taste, or how you want to shop.</p>
            </div>

            <fieldset className="field plain-fieldset near-you">
              <legend className="field-label">Find Ingredients Near You</legend>
              <label className="sr-only" htmlFor="location">ZIP code or city and state</label>
              <input id="location" className="text-input" value={choices.location} onChange={(e) => set({ location: e.target.value })} placeholder="ZIP code or City, State" autoComplete="postal-code" data-testid="input-location" />
              <p className="field-hint">Example store data exists only for South Bend, IN 46601.</p>
              <div className="strategy-group" role="radiogroup" aria-label="Shopping preference">
                {([['simplest', 'Simplest Shopping Trip', 'Fewest stores; easier-to-find swaps recommended.'], ['authentic', 'Most Authentic Ingredients', 'Specialty stores for traditional ingredients.']] as const).map(([v, label, hint]) => (
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
        <p className="quiet-note">Recommendations use prepared recipe notes and illustrative store matching. You stay in charge of what goes in your basket.</p>
      </form>
    </section>
  );
}
