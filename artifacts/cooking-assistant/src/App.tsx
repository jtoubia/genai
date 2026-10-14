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

type Choices = { dish: DishId | ''; servings: 2 | 4; diet: Diet };

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
  const [choices, setChoices] = useState<Choices>({ dish: '', servings: 2, diet: 'No restriction' });
  const [submitted, setSubmitted] = useState<Choices | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(true);
  const plan = submitted?.dish ? planFor(submitted.dish, submitted.diet) : null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!choices.dish) {
      setError('Choose a dish to create your shopping plan.');
      document.getElementById('dish')?.focus();
      return;
    }
    setError('');
    setSubmitted({ ...choices });
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
          <span className="brand-mark" aria-hidden="true">k</span>
          <span>Kitchen Fieldnotes</span>
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
                <p className="notice" data-testid="notice-dietary"><strong>Dietary note:</strong> {plan.dietaryNote}</p>

                <section className="section-card" aria-labelledby="common-heading" data-testid="section-common-ingredients">
                  <div className="section-title">
                    <h3 id="common-heading">Common supermarket ingredients</h3>
                    <span className="store-name" data-testid="text-common-store">Demo Neighborhood Supermarket</span>
                  </div>
                  <p className="store-disclaimer" data-testid="text-common-store-disclaimer">{storeOptionDisclosure}</p>
                  <IngredientList items={plan.common} servings={submitted!.servings} group="common" />
                </section>
                <section className="section-card" aria-labelledby="specialty-heading" data-testid="section-specialty-ingredients">
                  <div className="section-title">
                    <h3 id="specialty-heading">Specialty ingredients</h3>
                    <span className="store-name" data-testid="text-specialty-store">Demo Asian Grocery</span>
                  </div>
                  <p className="store-disclaimer" data-testid="text-specialty-store-disclaimer">{storeOptionDisclosure}</p>
                  <IngredientList items={plan.specialty} servings={submitted!.servings} group="specialty" />
                </section>
                <p className="method-note" data-testid="text-cooking-guidance"><strong>How it comes together:</strong> {plan.method}</p>
                <div className="plan-topline" style={{ margin: '18px 2px 0' }}>
                  <span className="plan-label">A helpful first cook</span>
                  <span style={{ color: '#879087', fontSize: 11 }}>Prepared locally · no live checks</span>
                </div>
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
