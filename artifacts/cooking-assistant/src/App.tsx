import { useState, type FormEvent } from 'react';
import { ArrowRight, MapPin, ShoppingBasket } from 'lucide-react';
import {
  dishes,
  locationText,
  planFor,
  prototypeDisclosure,
  storeOptionDisclosure,
  type Diet,
  type DishId,
  type Ingredient,
} from './prepared-plans';
import { buildShoppingPlan, interpretRequest, recommendedChoices, type SwapChoice } from './chef-request';

type Choices = { dish: DishId | ''; servings: 2 | 4; diet: Diet; request: string };

const unrecognizedMessage = "We couldn't confidently apply that request yet. Your standard shopping plan is shown below, and your request has not been applied.";

function IngredientList({ items, servings, group }: { items: Ingredient[]; servings: 2 | 4; group: string }) {
  return (
    <ul className="ingredient-list" data-testid={`list-${group}-ingredients`}>
      {items.map((item) => (
        <li className="ingredient" key={item.id} data-testid={`ingredient-${item.id}`}>
          <div className="ingredient-head">
            <span className="ingredient-name" data-testid={`text-ingredient-name-${item.id}`}>
              {item.name}
              {item.label && <span className="ingredient-tag">{item.label}</span>}
            </span>
            <span className="ingredient-qty" data-testid={`text-quantity-${item.id}`}>{item.quantity[servings]}</span>
          </div>
          <p className="ingredient-detail" data-testid={`text-ingredient-explanation-${item.id}`}>{item.explanation}</p>
        </li>
      ))}
    </ul>
  );
}

function Home() {
  const [choices, setChoices] = useState<Choices>({ dish: '', servings: 2, diet: 'No restriction', request: '' });
  const [swaps, setSwaps] = useState<Record<string, SwapChoice>>({});
  const [submitted, setSubmitted] = useState<Choices | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(true);
  const plan = submitted?.dish ? planFor(submitted.dish, submitted.diet) : null;
  const interp = plan && submitted ? interpretRequest(submitted.request, plan, submitted.diet) : null;
  const recommended = plan && interp ? recommendedChoices(plan, interp) : {};
  const shopping = plan && interp ? buildShoppingPlan(plan, interp, swaps) : null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!choices.dish) {
      setError('Choose a dish to create your shopping plan.');
      document.getElementById('dish')?.focus();
      return;
    }
    setError('');
    setSubmitted({ ...choices });
    if (choices.dish) {
      const nextPlan = planFor(choices.dish, choices.diet);
      setSwaps(recommendedChoices(nextPlan, interpretRequest(choices.request, nextPlan, choices.diet)));
    }
    setEditing(false);
    window.setTimeout(() => document.getElementById('plan-heading')?.scrollIntoView({ block: 'start' }), 0);
  }

  function editChoices() {
    setChoices(submitted ?? choices);
    setEditing(true);
    setError('');
    document.getElementById('choice-form')?.scrollIntoView({ block: 'start' });
  }

  return (
    <div className="app-shell">
      <header className="topbar" data-testid="header-app">
        <div className="brand" data-testid="text-brand">
          <span className="brand-mark" aria-hidden="true">c</span>
          <span>CuisineIQ</span>
        </div>
        <div className="topbar-note" data-testid="text-prototype-status">A little help, before the first chop</div>
      </header>
      <main className="main-wrap">
        <section className="intro" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">International cooking, made approachable</p>
            <h1 id="page-title">From dish idea to shopping plan.</h1>
            <p className="intro-copy">Choose a dish to discover what you need, understand unfamiliar ingredients, and find places to look for them.</p>
          </div>
          <div className="location-card" data-testid="text-demo-location">
            <MapPin size={15} aria-hidden="true" />
            <span><span className="location-label">Fixed demo location</span>{locationText}</span>
          </div>
        </section>

        <div className="workspace">
          <section className="panel form-panel" aria-labelledby="form-heading">
            <div className="panel-heading">
              <div>
                <h2 id="form-heading">Set your table</h2>
                <p>Three quick choices. No guesswork required.</p>
              </div>
              <span className="step-tag">Your plan</span>
            </div>
            <form id="choice-form" onSubmit={submit} noValidate>
              <fieldset className="field" style={{ border: 0, padding: 0, marginInline: 0 }}>
                <legend className="field-label">What would you like to cook? <span className="required">Required</span></legend>
                <div className="select-wrap">
                  <select
                    id="dish"
                    value={choices.dish}
                    required
                    aria-invalid={Boolean(error && !choices.dish)}
                    aria-describedby={error ? 'dish-error' : undefined}
                    className={error && !choices.dish ? 'invalid' : ''}
                    onChange={(event) => { setChoices({ ...choices, dish: event.target.value as DishId }); setError(''); }}
                    data-testid="select-dish"
                  >
                    <option value="">Choose a dish</option>
                    {dishes.map((dish) => <option value={dish.id} key={dish.id}>{dish.name}</option>)}
                  </select>
                </div>
                {error && <p id="dish-error" className="error-message" role="alert" data-testid="error-required-dish">{error}</p>}
              </fieldset>

              <div className="field">
                <label className="field-label" htmlFor="servings">How many servings?</label>
                <div className="select-wrap">
                  <select id="servings" value={choices.servings} onChange={(event) => setChoices({ ...choices, servings: Number(event.target.value) as 2 | 4 })} data-testid="select-servings">
                    <option value={2}>2 servings</option>
                    <option value={4}>4 servings</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="diet">Dietary preference</label>
                <div className="select-wrap">
                  <select id="diet" value={choices.diet} onChange={(event) => setChoices({ ...choices, diet: event.target.value as Diet })} data-testid="select-diet">
                    <option>No restriction</option>
                    <option>Dairy-free</option>
                  </select>
                </div>
                <p className="field-hint">Packaged ingredients vary. Always check labels for your needs.</p>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="chef-request">Tell the chef what you need <span className="optional">Optional</span></label>
                <textarea
                  id="chef-request"
                  className="chef-textarea"
                  rows={4}
                  value={choices.request}
                  placeholder="I already have chicken and rice. Make it mild and help me buy everything else at one store."
                  onChange={(event) => setChoices({ ...choices, request: event.target.value })}
                  data-testid="input-chef-request"
                />
                <p className="field-hint">Optional — tell us what you already have, ingredients you cannot find, how you want the dish to taste, or how you want to shop.</p>
              </div>
              <button className="submit-button" type="submit" data-testid="button-submit-plan">
                Create my shopping plan.
                <ArrowRight size={16} aria-hidden="true" />
              </button>
              <p className="quiet-note">Recommendations use prepared recipe notes and illustrative store matching. You stay in charge of what goes in your basket.</p>
            </form>
          </section>

          <section className="panel result-panel" aria-live="polite" aria-labelledby="plan-heading" data-testid="section-shopping-plan">
            {!plan ? (
              <div className="result-empty">
                <div className="empty-icon"><ShoppingBasket size={24} aria-hidden="true" /></div>
                <p className="eyebrow">Your next step</p>
                <h2 id="plan-heading">A clear list, with the unfamiliar bits explained.</h2>
                <p>Choose a dish to see what’s likely a regular supermarket find, what may call for an international grocer, and what each ingredient brings to the plate.</p>
              </div>
            ) : (
              <div className="result-ready">
                <div className="plan-top">
                  <div className="plan-topline">
                    <span className="plan-label" data-testid="text-plan-state">{editing ? 'Editing choices' : 'Prepared shopping plan'}</span>
                    {!editing && <button type="button" onClick={editChoices} className="edit-button" data-testid="button-edit-choices">Edit my choices</button>}
                  </div>
                  <h2 className="plan-title" id="plan-heading" data-testid="text-plan-title">{plan.name}</h2>
                  <div className="choice-chips" data-testid="group-submitted-choices">
                    <span className="choice-chip" data-testid="text-submitted-dish">{plan.name}</span>
                    <span className="choice-chip" data-testid="text-submitted-servings">{submitted?.servings} servings</span>
                    <span className="choice-chip" data-testid="text-submitted-diet">{submitted?.diet}</span>
                  </div>
                  <p className="plan-intro" style={{ marginTop: 12 }} data-testid="text-plan-summary">{plan.summary}</p>
                </div>
                {interp?.hasRequest && (
                  interp.understood ? (
                    <section className="adapted-card" aria-labelledby="adapted-heading" data-testid="section-adapted-plan">
                      <div className="adapted-head">
                        <h3 id="adapted-heading">Your Adapted Plan</h3>
                        <span className="sim-badge">Prototype AI Simulation</span>
                      </div>
                      <p className="adapted-quote" data-testid="text-chef-request">“{submitted!.request.trim()}”</p>
                      <ul className="adapt-list">
                        {interp.cards.map((card, i) => (
                          <li key={i} className="adapt-item" data-testid={`card-adaptation-${i}`}>
                            <span className="adapt-kind">{card.kind}</span>
                            <span>{card.text}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : (
                    <p className="notice notice-muted" role="status" data-testid="notice-request-unrecognized">{unrecognizedMessage}</p>
                  )
                )}
                <p className="notice" data-testid="notice-dietary"><strong>Dietary note:</strong> {plan.dietaryNote}</p>

                {shopping && shopping.atHome.length > 0 && (
                  <section className="section-card" aria-labelledby="home-heading" data-testid="section-at-home">
                    <div className="section-title">
                      <h3 id="home-heading">Already at home</h3>
                      <span className="store-name home-pill">Not on your list</span>
                    </div>
                    <ul className="home-list">
                      {shopping.atHome.map((item) => (
                        <li key={item.id} data-testid={`text-at-home-${item.id}`}><span>{item.name}</span><span className="ingredient-qty">{item.quantity[submitted!.servings]}</span></li>
                      ))}
                    </ul>
                  </section>
                )}

                <section className="section-card" aria-labelledby="common-heading" data-testid="section-common-ingredients">
                  <div className="section-title">
                    <h3 id="common-heading">Common supermarket ingredients</h3>
                    <span className="store-name" data-testid="text-common-store">Demo Neighborhood Supermarket</span>
                  </div>
                  <p className="store-disclaimer" data-testid="text-common-store-disclaimer">{storeOptionDisclosure}</p>
                  <IngredientList items={shopping!.common} servings={submitted!.servings} group="common" />
                </section>
                <section className="section-card" aria-labelledby="specialty-heading" data-testid="section-specialty-ingredients">
                  <div className="section-title">
                    <h3 id="specialty-heading">Specialty ingredients</h3>
                    <span className="store-name" data-testid="text-specialty-store">Demo Asian Grocery</span>
                  </div>
                  <p className="store-disclaimer" data-testid="text-specialty-store-disclaimer">{storeOptionDisclosure}</p>
                  {shopping!.specialty.length > 0 ? (
                    <IngredientList items={shopping!.specialty} servings={submitted!.servings} group="specialty" />
                  ) : (
                    <p className="empty-specialty" data-testid="text-specialty-empty">Nothing needed from the specialty grocer with your current choices. One supermarket trip covers the list.</p>
                  )}
                </section>

                <section className="section-card" aria-labelledby="swap-heading" data-testid="section-substitution-review">
                  <div className="section-title">
                    <h3 id="swap-heading">Fallbacks and substitution review</h3>
                    <span className="store-name">{shopping!.fallbacks.filter((f) => swaps[f.id] === 'substitute').length} of {shopping!.fallbacks.length} swapped</span>
                  </div>
                  <p className="control-note" data-testid="text-control-note">You stay in control — review suggested swaps before using your final shopping list.</p>
                  <div className="swap-list">
                    {shopping!.fallbacks.map((f) => {
                      const current = swaps[f.id] ?? 'original';
                      const rec = recommended[f.id] ?? 'original';
                      return (
                        <details className="swap" key={f.id} open={rec === 'substitute'} data-testid={`card-fallback-${f.id}`}>
                          <summary>
                            <span className="swap-name">{f.original}</span>
                            <span className={`swap-state ${current}`} data-testid={`status-swap-${f.id}`}>{current === 'substitute' ? 'Using substitute' : 'Keeping original'}</span>
                          </summary>
                          <dl className="swap-facts">
                            <div><dt>Why it matters</dt><dd>{f.why}</dd></div>
                            <div><dt>Suggested substitute</dt><dd>{f.substitute}</dd></div>
                            <div><dt>What changes</dt><dd>{f.changes}</dd></div>
                            <div><dt>Can it be omitted?</dt><dd>{f.omittable}</dd></div>
                          </dl>
                          <div className="swap-options" role="group" aria-label={`Choice for ${f.original}`}>
                            {(['original', 'substitute'] as const).map((opt) => (
                              <button
                                type="button"
                                key={opt}
                                aria-pressed={current === opt}
                                className={`swap-btn${current === opt ? ' active' : ''}${rec === opt ? ' recommended' : ''}`}
                                onClick={() => setSwaps({ ...swaps, [f.id]: opt })}
                                data-testid={`button-${opt === 'original' ? 'keep-original' : 'use-substitute'}-${f.id}`}
                              >
                                <span className="swap-kind">{opt === 'original' ? 'Best authentic choice' : 'Easier-to-find alternative'}</span>
                                <span className="swap-label">{opt === 'original' ? 'Keep original' : 'Use substitute'}</span>
                                <span className="swap-sub">{opt === 'original' ? f.original : f.substitute}</span>
                                {rec === opt && <span className="rec-badge">Recommended</span>}
                              </button>
                            ))}
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </section>
                <p className="method-note" data-testid="text-cooking-guidance"><strong>How it comes together:</strong> {plan.method}</p>
                <div className="plan-topline" style={{ margin: '18px 2px 0' }}>
                  <span className="plan-label">A helpful first cook</span>
                  <span style={{ color: '#879087', fontSize: 11 }}>Prepared locally · no live checks</span>
                </div>
                <p className="sim-note" data-testid="text-ai-simulation"><span className="sim-badge">Prototype AI Simulation</span> This prototype demonstrates how AI could interpret your cooking and shopping constraints and adapt a plan. Current recommendations use prepared prototype logic rather than a live generative-AI model or live store inventory.</p>
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
