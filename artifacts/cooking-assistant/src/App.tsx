import { useMemo, useState, type FormEvent } from 'react';
import { MapPin, ShoppingBasket } from 'lucide-react';
import { recipeById } from './data/recipes';
import { Discover } from './components/Discover';
import { CustomizeForm, type Choices } from './components/CustomizeForm';
import { AdaptedSection, CookSection, ShoppingSection, StoresSection, SubstitutionSection } from './components/PlanSections';
import { buildPlan, initialDecisions, type Decisions, type PlanInput, type SwapChoice } from './lib/plan-engine';
import { buildStorePlan } from './lib/store-plan';
import { aiSimulationText, allergyText, locationText, prototypeDisclosure } from './prepared-plans';

const defaultChoices: Choices = { dish: '', servings: 2, diets: [], spice: 'Medium', atHome: '', request: '', location: '46601', strategy: 'authentic' };

const scrollTo = (id: string) => window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);

const toInput = (c: Choices): PlanInput | null => {
  const recipe = recipeById(c.dish);
  return recipe ? { recipe, servings: c.servings, diets: c.diets, spice: c.spice, request: c.request, atHome: c.atHome, strategy: c.strategy } : null;
};

const NAV = [
  { id: 'discover', label: 'Discover' },
  { id: 'customize', label: 'Customize' },
  { id: 'shopping', label: 'Shopping Plan' },
  { id: 'cook', label: 'Cook' },
];

function Home() {
  const [query, setQuery] = useState('');
  const [choices, setChoices] = useState<Choices>(defaultChoices);
  const [submitted, setSubmitted] = useState<Choices | null>(null);
  const [decisions, setDecisions] = useState<Decisions>({ swaps: {}, diet: {} });
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(true);
  const [shopChecked, setShopChecked] = useState<Set<string>>(new Set());
  const [stepsDone, setStepsDone] = useState<Set<number>>(new Set());

  const input = useMemo(() => (submitted ? toInput(submitted) : null), [submitted]);
  const plan = useMemo(() => (input ? buildPlan(input, decisions) : null), [input, decisions]);
  const storePlan = useMemo(() => (plan && submitted ? buildStorePlan(plan, submitted.location, submitted.strategy) : null), [plan, submitted]);
  const selectedRecipe = recipeById(choices.dish);

  function selectDish(id: string) {
    setChoices({ ...choices, dish: id });
    setError('');
    scrollTo('customize');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = toInput(choices);
    if (!next) {
      setError(query.trim() ? 'Choose a supported dish from Discover or the list to create your plan.' : 'Choose a dish to create your shopping plan.');
      document.getElementById('dish')?.focus();
      return;
    }
    setError('');
    setSubmitted({ ...choices });
    setDecisions(initialDecisions(next));
    setShopChecked(new Set());
    setStepsDone(new Set());
    setEditing(false);
    scrollTo('plan-heading');
  }

  function editChoices() {
    setEditing(true);
    setError('');
    scrollTo('customize');
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
        <div className="topbar-note" data-testid="text-prototype-status">A little help, before the first chop</div>
      </header>
      <nav className="step-nav" aria-label="Cooking journey">
        <ol>
          {NAV.map((n, i) => {
            const locked = (n.id === 'shopping' || n.id === 'cook') && !plan;
            return (
              <li key={n.id}>
                <button type="button" onClick={() => scrollTo(n.id === 'shopping' && plan ? 'shopping' : n.id)} disabled={locked} title={locked ? 'Create a plan first' : undefined} data-testid={`nav-${n.id}`}>
                  <span className="nav-num">{i + 1}</span>{n.label}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
      <main className="main-wrap">
        <section className="intro" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">International cooking, made approachable</p>
            <h1 id="page-title">From dish idea to shopping plan.</h1>
            <p className="intro-copy">Find a dish, shape it around your kitchen and diet, see exactly what to buy, and cook it step by step.</p>
          </div>
          <div className="location-card" data-testid="text-demo-location">
            <MapPin size={15} aria-hidden="true" />
            <span><span className="location-label">Demo store location</span>{locationText}</span>
          </div>
        </section>

        <Discover query={query} onQuery={setQuery} selectedId={choices.dish} onSelect={selectDish} />

        <div className="workspace">
          <CustomizeForm
            choices={choices}
            setChoices={setChoices}
            recipe={selectedRecipe}
            error={error}
            clearError={() => setError('')}
            onSubmit={submit}
            onBrowse={() => scrollTo('discover')}
            hasPlan={!!plan}
          />

          <section className="panel result-panel" aria-live="polite" aria-labelledby="plan-heading" data-testid="section-shopping-plan">
            {!plan || !submitted ? (
              <div className="result-empty">
                <div className="empty-icon"><ShoppingBasket size={24} aria-hidden="true" /></div>
                <p className="eyebrow">Your next step</p>
                <h2 id="plan-heading">A clear list, with the unfamiliar bits explained.</h2>
                <p>Choose a dish and create your plan to see what is already in your kitchen, what to buy, which swaps make sense, and every step to cook it.</p>
              </div>
            ) : (
              <div className="result-ready">
                <div className="plan-top">
                  <div className="plan-topline">
                    <span className="plan-label" data-testid="text-plan-state">{editing ? 'Editing choices' : 'Your Cooking Plan'}</span>
                    <button type="button" onClick={editChoices} className="edit-button" data-testid="button-edit-choices">Edit my choices</button>
                  </div>
                  <div className="plan-hero">
                    <img src={plan.recipe.image} alt={plan.recipe.alt} width={120} height={120} data-testid="img-plan-dish" />
                    <div>
                      <h2 className="plan-title" id="plan-heading" data-testid="text-plan-title">{plan.recipe.name}</h2>
                      <div className="choice-chips" data-testid="group-submitted-choices">
                        <span className="choice-chip" data-testid="text-submitted-dish">{plan.recipe.name}</span>
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

                <AdaptedSection plan={plan} request={submitted.request} />

                <p className="notice" data-testid="notice-dietary"><strong>Dietary note:</strong> {plan.recipe.dietaryNote}</p>
                <p className="notice notice-allergy" data-testid="notice-allergy">{allergyText}</p>

                <ShoppingSection plan={plan} checked={shopChecked} onToggle={(id) => setShopChecked(toggle(shopChecked, id))} />
                <SubstitutionSection
                  plan={plan}
                  decisions={decisions}
                  onSwap={(id, c: SwapChoice) => setDecisions({ ...decisions, swaps: { ...decisions.swaps, [id]: c } })}
                  onDiet={(id, v) => setDecisions({ ...decisions, diet: { ...decisions.diet, [id]: v } })}
                />
                {storePlan && <StoresSection storePlan={storePlan} onChangeLocation={() => { editChoices(); window.setTimeout(() => document.getElementById('location')?.focus(), 350); }} />}
                <CookSection plan={plan} done={stepsDone} onToggle={(n) => setStepsDone(toggle(stepsDone, n))} />

                <div className="plan-topline" style={{ margin: '18px 2px 0' }}>
                  <span className="plan-label">A helpful first cook</span>
                  <span style={{ color: '#879087', fontSize: 11 }}>Prepared locally · no live checks</span>
                </div>
                <p className="sim-note" data-testid="text-ai-simulation"><span className="sim-badge">Prototype AI Simulation</span> {aiSimulationText}</p>
                <button type="button" className="edit-button regen" onClick={editChoices} data-testid="button-revise-plan">Revise and regenerate this plan</button>
              </div>
            )}
          </section>
        </div>
        <footer className="footer">
          <span className="footer-disclosure" data-testid="text-prototype-disclosure">{prototypeDisclosure}</span>
          <span data-testid="text-label-reminder">Always check packaged labels. This plan does not claim allergy safety.</span>
        </footer>
      </main>
    </div>
  );
}

function App() {
  return <Home />;
}

export default App;
