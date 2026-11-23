import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ShoppingBasket } from 'lucide-react';
import { recipeById } from './data/recipes';
import { findPrepared, norm, relatedRecipes } from './data/recipe-source';
import { toRecipe, type GenerateResponse, type GeneratedRecipe } from './data/live-recipe';
import type { Recipe } from './data/types';
import { Discover, type GenState } from './components/Discover';
import { CustomizeForm, type Choices } from './components/CustomizeForm';
import { AdaptedSection, CookSection, IngredientsOverview, ShoppingSection, StoresSection, SubstitutionSection } from './components/PlanSections';
import { AboutPrototype, DishThumb, SourceBadge } from './components/Shared';
import { buildPlan, initialDecisions, type Decisions, type PlanInput, type SwapChoice } from './lib/plan-engine';
import { parseLocation } from './lib/location';
import { allergyText } from './prepared-plans';

const defaultChoices: Choices = { dish: '', servings: 2, diets: [], spice: 'Medium', location: '', strategy: 'authentic' };

const scrollTo = (id: string) => window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);

const NAV = [
  { id: 'discover', label: 'Choose Your Dish' },
  { id: 'customize', label: 'Customize Your Recipe' },
  { id: 'plan', label: 'Your Plan' },
  { id: 'shopping', label: 'Shopping List' },
  { id: 'cook', label: 'Cook' },
];

const API_URL = `${import.meta.env.BASE_URL}api/recipes/generate`;

function Home() {
  const [query, setQuery] = useState('');
  const [choices, setChoices] = useState<Choices>(defaultChoices);
  const [submitted, setSubmitted] = useState<Choices | null>(null);
  const [decisions, setDecisions] = useState<Decisions>({ swaps: {}, diet: {} });
  const [error, setError] = useState('');
  const [locError, setLocError] = useState('');
  const [editing, setEditing] = useState(true);
  // Ingredients the user already has, keyed by PlanItem.key (ingredient id + variant in use).
  const [home, setHome] = useState<Set<string>>(new Set());
  const [shopChecked, setShopChecked] = useState<Set<string>>(new Set());
  const [stepsDone, setStepsDone] = useState<Set<number>>(new Set());
  // Session cache of AI-written recipes: changing preferences never regenerates them.
  const [live, setLive] = useState<Record<string, Recipe>>({});
  const [queryCache, setQueryCache] = useState<Record<string, string>>({});
  const [gen, setGen] = useState<GenState>({ status: 'idle' });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const getRecipe = (id: string): Recipe | undefined => recipeById(id) ?? live[id];
  const liveList = useMemo(() => Object.values(live), [live]);

  const input = useMemo<PlanInput | null>(() => {
    if (!submitted) return null;
    const recipe = recipeById(submitted.dish) ?? live[submitted.dish];
    return recipe ? { recipe, servings: submitted.servings, diets: submitted.diets, spice: submitted.spice, strategy: submitted.strategy } : null;
  }, [submitted, live]);
  const plan = useMemo(() => (input ? buildPlan(input, decisions, home) : null), [input, decisions, home]);
  const selectedRecipe = getRecipe(choices.dish);

  // Location shown in Step 4 follows the form as soon as it is well-formed.
  const liveLoc = parseLocation(choices.location);
  const shownLoc = liveLoc.kind === 'invalid' && submitted ? parseLocation(submitted.location) : liveLoc;

  function selectDish(id: string) {
    setChoices((c) => ({ ...c, dish: id }));
    setError('');
    scrollTo('customize');
  }

  async function search(q: string) {
    const prepared = findPrepared(q);
    if (prepared) { setGen({ status: 'idle' }); selectDish(prepared.id); return; }
    const cached = queryCache[norm(q)];
    if (cached && live[cached]) { setGen({ status: 'idle' }); selectDish(cached); return; }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setGen({ status: 'loading', dish: q });
    try {
      const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ dish: q }), signal: ctrl.signal });
      let body: GenerateResponse | null = null;
      try { body = (await res.json()) as GenerateResponse; } catch { body = null; }
      if (ctrl.signal.aborted) return;
      if (res.ok && body?.status === 'ok' && 'recipe' in body) {
        const okBody = body as { model: string; recipe: GeneratedRecipe };
        const recipe = toRecipe(okBody.recipe, okBody.model);
        setLive((m) => ({ ...m, [recipe.id]: recipe }));
        setQueryCache((m) => ({ ...m, [norm(q)]: recipe.id }));
        setGen({ status: 'idle' });
        selectDish(recipe.id);
        return;
      }
      if (res.ok && body?.status === 'unrecognized') {
        setGen({ status: 'unrecognized', dish: q, message: body.message ?? 'That does not look like a dish we can write a recipe for.', related: relatedRecipes(q) });
        return;
      }
      setGen({ status: 'error', dish: q, message: (body as { message?: string } | null)?.message || `Something went wrong (status ${res.status}). Please try again.`, related: relatedRecipes(q) });
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setGen({ status: 'error', dish: q, message: 'We could not reach the recipe service. Check your connection and try again.', related: relatedRecipes(q) });
    } finally {
      if (abortRef.current === ctrl) abortRef.current = null;
    }
  }

  function cancel() {
    abortRef.current?.abort();
    abortRef.current = null;
    setGen({ status: 'idle' });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const recipe = getRecipe(choices.dish);
    const loc = parseLocation(choices.location);
    if (!recipe) {
      setError('Choose a dish to create your shopping plan.');
      document.getElementById('dish')?.focus();
      return;
    }
    if (loc.kind === 'invalid') {
      setLocError(loc.message);
      document.getElementById('location')?.focus();
      return;
    }
    setError('');
    setLocError('');
    const sameDish = submitted?.dish === choices.dish;
    setSubmitted({ ...choices });
    setDecisions(initialDecisions({ recipe, servings: choices.servings, diets: choices.diets, spice: choices.spice, strategy: choices.strategy }));
    if (!sameDish) { setHome(new Set()); setShopChecked(new Set()); setStepsDone(new Set()); }
    setEditing(false);
    scrollTo('plan');
  }

  function editChoices() {
    setEditing(true);
    setError('');
    scrollTo('customize');
  }

  function changeLocation() {
    scrollTo('customize');
    window.setTimeout(() => document.getElementById('location')?.focus({ preventScroll: true }), 400);
  }

  const toggle = <T,>(set: Set<T>, v: T) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v); else next.add(v);
    return next;
  };

  return (
    <div className="app-shell">
      <header className="topbar" data-testid="header-app">
        <div className="brand" data-testid="text-brand">
          <span className="brand-mark" aria-hidden="true">c</span>
          <span>CuisineIQ</span>
        </div>
        <AboutPrototype />
      </header>
      <nav className="step-nav" aria-label="Cooking journey">
        <ol>
          {NAV.map((n, i) => {
            const locked = (n.id === 'plan' || n.id === 'shopping' || n.id === 'cook') && !plan;
            return (
              <li key={n.id}>
                <button type="button" onClick={() => scrollTo(n.id)} disabled={locked} title={locked ? 'Create a plan first' : undefined} data-testid={`nav-${n.id}`}>
                  <span className="nav-num">{i + 1}</span><span className="nav-step">Step {i + 1}</span> {n.label}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
      <main className="main-wrap">
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">International cooking, made approachable</p>
          <h1 id="page-title">From dish idea to shopping plan.</h1>
          <p className="intro-copy">Name any dish, shape it around your kitchen and diet, see exactly what to buy, and cook it step by step.</p>
        </section>

        <Discover query={query} onQuery={setQuery} selectedId={choices.dish} onSelect={(id) => { setGen({ status: 'idle' }); selectDish(id); }} onSearch={search} gen={gen} onCancel={cancel} liveRecipes={liveList} />

        <div className="workspace">
          <CustomizeForm
            choices={choices}
            setChoices={setChoices}
            recipe={selectedRecipe}
            liveRecipes={liveList}
            error={error}
            clearError={() => setError('')}
            locError={locError}
            setLocError={setLocError}
            onSubmit={submit}
            onBrowse={() => scrollTo('discover')}
            hasPlan={!!plan}
          />

          <section className="panel result-panel" aria-live="polite" aria-labelledby="plan-heading" data-testid="section-shopping-plan">
            {!plan || !submitted ? (
              <div className="result-empty">
                <div className="empty-icon"><ShoppingBasket size={24} aria-hidden="true" /></div>
                <p className="eyebrow">Step 3 · Your plan</p>
                <h2 id="plan-heading">A clear list, with the unfamiliar bits explained.</h2>
                <p>Choose a dish and create your plan to see what is already in your kitchen, what to buy, which swaps make sense, and every step to cook it.</p>
              </div>
            ) : (
              <div className="result-ready">
                <div id="plan" className="journey anchor-section" data-testid="group-step-plan">
                  <p className="journey-label">Step 3 · Your plan</p>
                  <div className="plan-top">
                    <div className="plan-topline">
                      <span className="plan-label" data-testid="text-plan-state">{editing ? 'Editing choices' : 'Your Cooking Plan'}</span>
                      <button type="button" onClick={editChoices} className="edit-button" data-testid="button-edit-choices">Edit my choices</button>
                    </div>
                    <div className="plan-hero">
                      <DishThumb recipe={plan.recipe} size={120} className="plan-thumb" testId="img-plan-dish" />
                      <div>
                        <h2 className="plan-title" id="plan-heading" data-testid="text-plan-title">{plan.recipe.name}</h2>
                        <div className="badge-row"><SourceBadge recipe={plan.recipe} testId="badge-plan-source" /></div>
                        <div className="choice-chips" data-testid="group-submitted-choices">
                          <span className="choice-chip" data-testid="text-submitted-dish">{plan.recipe.cuisine}</span>
                          <span className="choice-chip" data-testid="text-submitted-servings">{submitted.servings} {submitted.servings === 1 ? 'serving' : 'servings'}</span>
                          <span className="choice-chip" data-testid="text-submitted-diet">{submitted.diets.length ? submitted.diets.join(' + ') : 'No restriction'}</span>
                          <span className="choice-chip" data-testid="text-submitted-spice">{plan.effectiveSpice} spice</span>
                          <span className="choice-chip">{plan.recipe.prep + plan.recipe.cook} min total</span>
                          <span className="choice-chip">{submitted.strategy === 'simplest' ? 'Simplest trip' : 'Most authentic'}</span>
                        </div>
                      </div>
                    </div>
                    <p className="plan-intro" data-testid="text-plan-summary">{plan.recipe.summary}</p>
                  </div>

                  <AdaptedSection plan={plan} />
                  <div className="notes-row">
                    <p className="notice" data-testid="notice-dietary"><strong>Dietary note:</strong> {plan.recipe.dietaryNote}</p>
                    <p className="notice notice-allergy" data-testid="notice-allergy">{allergyText}</p>
                  </div>
                  <IngredientsOverview plan={plan} home={home} onToggle={(key) => setHome(toggle(home, key))} />
                  <SubstitutionSection
                    plan={plan}
                    decisions={decisions}
                    onSwap={(id, c: SwapChoice) => setDecisions({ ...decisions, swaps: { ...decisions.swaps, [id]: c } })}
                    onDiet={(id, v) => setDecisions({ ...decisions, diet: { ...decisions.diet, [id]: v } })}
                  />
                </div>

                <div id="shopping" className="journey anchor-section" data-testid="group-step-shopping">
                  <p className="journey-label">Step 4 · Shopping list</p>
                  <ShoppingSection plan={plan} checked={shopChecked} onToggle={(id) => setShopChecked(toggle(shopChecked, id))} />
                  <StoresSection location={shownLoc} onChangeLocation={changeLocation} />
                </div>

                <div id="cook" className="journey anchor-section" data-testid="group-step-cook">
                  <p className="journey-label">Step 5 · Cook</p>
                  <CookSection plan={plan} done={stepsDone} onToggle={(n) => setStepsDone(toggle(stepsDone, n))} />
                </div>

                <button type="button" className="edit-button regen" onClick={editChoices} data-testid="button-revise-plan">Revise this plan</button>
              </div>
            )}
          </section>
        </div>
        <footer className="footer">
          <span className="footer-disclosure" data-testid="text-prototype-disclosure">CuisineIQ prototype · prepared and AI-written recipes, rule-based adaptation.</span>
          <span data-testid="text-label-reminder">Always check packaged labels. No allergy guarantee.</span>
        </footer>
      </main>
    </div>
  );
}

function App() {
  return <Home />;
}

export default App;
