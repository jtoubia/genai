import { AlertTriangle, Check, ChefHat, Clock, MapPin, ShieldCheck, Utensils } from 'lucide-react';
import { UNRECOGNIZED_MESSAGE } from '../chef-request';
import type { SourceKind } from '../data/types';
import type { Decisions, Plan, PlanItem, SwapChoice } from '../lib/plan-engine';
import { describeLocation, type LocationResult } from '../lib/location';
import { aiReviewText, aiTagText } from '../prepared-plans';
import { SourceBadge } from './Shared';

type Toggle = (id: string) => void;

const SHOP_LABEL: Record<SourceKind, string> = {
  general: 'regular supermarket',
  asian: 'Asian grocery',
  indian: 'Indian grocery',
  international: 'international grocery',
};

/** Step 3: what goes in the dish, with the short "why" for each ingredient. */
export function IngredientsOverview({ plan }: { plan: Plan }) {
  return (
    <section className="result-block" aria-labelledby="ingredients-heading" data-testid="section-ingredients">
      <div className="block-head">
        <h3 id="ingredients-heading">Ingredients</h3>
        <span className="progress-pill">For {plan.servings} {plan.servings === 1 ? 'serving' : 'servings'}</span>
      </div>
      <ul className="ingredient-list overview">
        {plan.items.map((item) => (
          <li className={`ingredient${item.status === 'conflict' ? ' is-conflict' : ''}${item.status === 'omitted' ? ' is-omitted' : ''}`} key={item.id} data-testid={`row-ingredient-${item.id}`}>
            <div className="ingredient-main">
              <div className="ingredient-head">
                <span className="ingredient-name">
                  {item.name}
                  {item.status === 'conflict' ? <span className="ingredient-tag warn">Needs your decision</span> : item.status === 'omitted' ? <span className="ingredient-tag">Left out</span> : item.label && <span className={`ingredient-tag${item.change === 'kept-conflict' ? ' warn' : ''}`}>{item.label}</span>}
                </span>
                <span className="ingredient-qty">{item.status === 'omitted' ? '—' : item.qty}</span>
              </div>
              <p className="ingredient-detail" data-testid={`text-ingredient-explanation-${item.id}`}>{item.note}</p>
              {item.change !== 'none' && item.origName !== item.name && <p className="ingredient-was">Instead of: {item.origName}</p>}
              {item.violates.length > 0 && <p className="ingredient-was warn-text">Does not meet: {item.violates.join(', ')}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Step 4: brief, checkable shopping rows. */
export function IngredientList({ items, group, checked, onToggle }: { items: PlanItem[]; group: string; checked: Set<string>; onToggle: Toggle }) {
  return (
    <ul className="ingredient-list" data-testid={`list-${group}-ingredients`}>
      {items.map((item) => {
        const on = checked.has(item.id);
        return (
          <li className={`ingredient compact${on ? ' is-checked' : ''}${item.status === 'conflict' ? ' is-conflict' : ''}`} key={item.id} data-testid={`ingredient-${item.id}`}>
            <label className="shop-check">
              <input type="checkbox" checked={on} onChange={() => onToggle(item.id)} data-testid={`checkbox-shop-${item.id}`} />
              <span className="sr-only">Mark {item.name} as got</span>
            </label>
            <div className="ingredient-main">
              <div className="ingredient-head">
                <span className="ingredient-name" data-testid={`text-ingredient-name-${item.id}`}>
                  {item.name}
                  {item.status === 'conflict' ? <span className="ingredient-tag warn">Needs your decision</span> : item.label && <span className={`ingredient-tag${item.change === 'kept-conflict' ? ' warn' : ''}`}>{item.label}</span>}
                </span>
                <span className="ingredient-qty" data-testid={`text-quantity-${item.id}`}>{item.qty}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function AdaptedSection({ plan, request }: { plan: Plan; request: string }) {
  const { interp } = plan;
  return (
    <section className="result-block anchor-section" aria-labelledby="adapted-heading" data-testid="section-adapted-plan">
      <div className="block-head">
        <h3 id="adapted-heading">How your recipe was adapted</h3>
        <span className="rule-badge" title="Applied by matching keywords and ingredient tags in the structured recipe">Rule-based</span>
      </div>
      {interp.hasRequest && <p className="adapted-quote" data-testid="text-chef-request">“{request.trim()}”</p>}
      {interp.hasRequest && !interp.understood && (
        <p className="notice notice-muted" role="status" data-testid="notice-request-unrecognized">{UNRECOGNIZED_MESSAGE}</p>
      )}
      {plan.cards.length ? (
        <ul className="adapt-list">
          {plan.cards.map((card, i) => (
            <li key={i} className={`adapt-item kind-${card.kind.replace(/\s+/g, '-').toLowerCase()}`} data-testid={`card-adaptation-${i}`}>
              <span className="adapt-kind">{card.kind}</span>
              <span>{card.text}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="block-empty" data-testid="text-no-adaptations">No changes needed. This is the standard recipe, scaled to {plan.servings} {plan.servings === 1 ? 'serving' : 'servings'}.</p>
      )}
      {plan.recipe.source && (
        <ul className="ai-notes" data-testid="notice-ai-recipe">
          <li>{aiReviewText}</li>
          <li>{aiTagText}</li>
        </ul>
      )}
    </section>
  );
}

export function ShoppingSection({ plan, checked, onToggle }: { plan: Plan; checked: Set<string>; onToggle: Toggle }) {
  const home = plan.items.filter((i) => i.status === 'home');
  const buy = plan.items.filter((i) => (i.status === 'buy' || i.status === 'conflict') && !i.specialty);
  const specialty = plan.items.filter((i) => (i.status === 'buy' || i.status === 'conflict') && i.specialty);
  const leftOut = plan.items.filter((i) => i.status === 'omitted');
  const toGet = [...buy, ...specialty];
  const done = toGet.filter((i) => checked.has(i.id)).length;
  const kinds = [...new Set(specialty.map((i) => SHOP_LABEL[i.source === 'general' ? 'international' : i.source]))];

  return (
    <section className="result-block" aria-labelledby="shopping-heading" data-testid="section-shopping-list">
      <div className="block-head">
        <h3 id="shopping-heading">Shopping list</h3>
        <span className="progress-pill" data-testid="text-shopping-progress">{done} of {toGet.length} in basket</span>
      </div>
      <div className="progress-bar" aria-hidden="true"><span style={{ transform: `scaleX(${toGet.length ? done / toGet.length : 0})` }} /></div>

      <section className="section-card" aria-labelledby="common-heading" data-testid="section-common-ingredients">
        <div className="section-title">
          <h4 id="common-heading">Items to buy</h4>
          <span className="store-name" data-testid="text-common-store">Regular supermarket</span>
        </div>
        {buy.length ? <IngredientList items={buy} group="common" checked={checked} onToggle={onToggle} /> : <p className="empty-specialty">Nothing else to buy here. You have it covered.</p>}
      </section>

      <section className="section-card" aria-labelledby="specialty-heading" data-testid="section-specialty-ingredients">
        <div className="section-title">
          <h4 id="specialty-heading">Specialty items</h4>
          <span className="store-name" data-testid="text-specialty-store">{kinds.length ? `Often at an ${kinds.join(' or ')}` : 'None needed'}</span>
        </div>
        {specialty.length > 0 ? (
          <IngredientList items={specialty} group="specialty" checked={checked} onToggle={onToggle} />
        ) : (
          <p className="empty-specialty" data-testid="text-specialty-empty">No specialty items with your current choices. One supermarket trip covers the list.</p>
        )}
      </section>

      {home.length > 0 && (
        <section className="section-card" aria-labelledby="home-heading" data-testid="section-at-home">
          <div className="section-title">
            <h4 id="home-heading">Already at home</h4>
            <span className="store-name home-pill">Not on your list</span>
          </div>
          <ul className="home-list">
            {home.map((item) => (
              <li key={item.id} data-testid={`text-at-home-${item.id}`}><span>{item.name}</span><span className="ingredient-qty">{item.qty}</span></li>
            ))}
          </ul>
        </section>
      )}

      {leftOut.length > 0 && (
        <p className="left-out" data-testid="text-left-out"><strong>Left out:</strong> {leftOut.map((i) => i.origName).join(', ')}</p>
      )}
    </section>
  );
}

type SubProps = { plan: Plan; decisions: Decisions; onSwap: (id: string, c: SwapChoice) => void; onDiet: (id: string, v: string) => void };

function shoppingNote(plan: Plan, target: string, subSource: SourceKind | undefined, leaveOut: boolean): string {
  const def = plan.recipe.ingredients.find((i) => i.id === target);
  const src = def?.source ?? (def?.specialty ? 'asian' : 'general');
  const parts: string[] = [];
  if (src !== 'general') parts.push(`The original is more likely at an ${SHOP_LABEL[src]}.`);
  if (leaveOut) parts.push('Leaving it out means one less item to buy.');
  else if (subSource && subSource !== 'general') parts.push(`The substitute may also be easier to find at an ${SHOP_LABEL[subSource]}.`);
  else parts.push('The substitute is usually easy to find in a regular supermarket.');
  parts.push('Stock varies; nothing here is checked against store inventory.');
  return parts.join(' ');
}

export function SubstitutionSection({ plan, decisions, onSwap, onDiet }: SubProps) {
  const swapped = plan.fallbacks.filter((f) => f.current === 'substitute').length;
  return (
    <section className="result-block" aria-labelledby="swap-heading" data-testid="section-substitution-review">
      <div className="block-head">
        <h3 id="swap-heading">Ingredient Substitutions</h3>
        <span className="progress-pill">{swapped} of {plan.fallbacks.length} swapped</span>
      </div>
      <p className="control-note" data-testid="text-control-note">You stay in control. Switching updates your shopping list and cooking steps together.</p>

      {plan.conflicts.length > 0 && (
        <div className="conflict-list" data-testid="group-diet-conflicts">
          <h4 className="mini-heading"><AlertTriangle size={14} aria-hidden="true" /> Needs your decision</h4>
          <p className="field-hint" style={{ marginTop: 0 }}>These ingredients do not fit your selected diet and have no safe automatic swap. Nothing changes until you choose.</p>
          {plan.conflicts.map((c) => (
            <div className={`conflict-card${c.decision ? '' : ' open'}`} key={c.id} data-testid={`card-conflict-${c.id}`}>
              <div className="conflict-title"><strong>{c.name}</strong><span className="ingredient-tag warn">Conflicts with {c.diets.join(' + ')}</span></div>
              <div className="conflict-options" role="radiogroup" aria-label={`Choice for ${c.name}`}>
                {c.options.map((o) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={decisions.diet[c.id] === o.value}
                    key={o.value}
                    className={`swap-btn${decisions.diet[c.id] === o.value ? ' active' : ''}${o.value === 'keep' ? ' risky' : ''}`}
                    onClick={() => onDiet(c.id, o.value)}
                    data-testid={`button-diet-${o.value}-${c.id}`}
                  >
                    <span className="swap-label">{o.label}</span>
                    <span className="swap-sub">{o.detail}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {plan.fallbacks.length > 0 ? (
        <div className="swap-list">
          {plan.fallbacks.map((f) => {
            const current = f.current;
            const disabled = f.blockedBy.length > 0 || !f.available;
            return (
              <details className="swap" key={f.target} open={f.recommended === 'substitute' || current === 'substitute'} data-testid={`card-fallback-${f.target}`}>
                <summary>
                  <span className="swap-name">{f.originalName}</span>
                  <span className={`swap-state ${current}`} data-testid={`status-swap-${f.target}`}>{current === 'substitute' ? 'Using substitute' : 'Keeping original'}</span>
                </summary>
                <dl className="swap-facts">
                  <div><dt>Original ingredient</dt><dd>{f.originalName}. {f.why}</dd></div>
                  <div><dt>Suggested alternative</dt><dd>{f.ing ? f.substitute : `${f.substitute || 'Leave it out'}`}</dd></div>
                  <div><dt>Why this works</dt><dd>{f.changes} The original is the traditional choice; the alternative is an approximation.</dd></div>
                  <div><dt>Shopping consideration</dt><dd>{shoppingNote(plan, f.target, f.ing?.source, !f.ing)} <span className="omit-line">Can it be omitted? {f.omittable}</span></dd></div>
                </dl>
                {f.blockedBy.length > 0 && <p className="blocked-note" data-testid={`text-swap-blocked-${f.target}`}><ShieldCheck size={13} aria-hidden="true" /> Substitute blocked: it conflicts with your {f.blockedBy.join(' + ')} selection, so the original stays.</p>}
                {f.reason && <p className="blocked-note">{f.reason}</p>}
                <div className="swap-options" role="group" aria-label={`Choice for ${f.originalName}`}>
                  {(['original', 'substitute'] as const).map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      aria-pressed={current === opt}
                      disabled={opt === 'substitute' && disabled}
                      className={`swap-btn${current === opt ? ' active' : ''}${f.recommended === opt ? ' recommended' : ''}`}
                      onClick={() => onSwap(f.target, opt)}
                      data-testid={`button-${opt === 'original' ? 'keep-original' : 'use-substitute'}-${f.target}`}
                    >
                      <span className="swap-kind">{opt === 'original' ? 'Best authentic choice' : 'Easier-to-find alternative'}</span>
                      <span className="swap-label">{opt === 'original' ? 'Keep original' : 'Use substitute'}</span>
                      <span className="swap-sub">{opt === 'original' ? f.originalName : f.substitute}</span>
                      {f.recommended === opt && !disabled && <span className="rec-badge">Recommended</span>}
                    </button>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      ) : (
        <p className="block-empty">This recipe has no hard-to-find ingredients that need a fallback.</p>
      )}
    </section>
  );
}

export function StoresSection({ location, onChangeLocation }: { location: LocationResult; onChangeLocation: () => void }) {
  const desc = describeLocation(location);
  return (
    <section className="result-block" aria-labelledby="stores-heading" data-testid="section-stores">
      <div className="block-head">
        <h3 id="stores-heading">Nearby Grocery Stores</h3>
        <button type="button" className="edit-button" onClick={onChangeLocation} data-testid="button-change-location"><MapPin size={12} aria-hidden="true" /> Change location</button>
      </div>
      {desc ? (
        <>
          <p className="shop-location" data-testid="text-shopping-location">Your shopping location: <strong>{desc.main}</strong><span>{desc.detail}</span></p>
          <p className="block-empty" data-testid="text-stores-note">Your location has been saved. Live grocery-store discovery is not yet available in this prototype. Your personalized shopping list can be used at supermarkets or international grocery stores in your area.</p>
        </>
      ) : (
        <p className="block-empty" data-testid="text-stores-empty">No shopping location yet. <button type="button" className="link-button inline" onClick={onChangeLocation} data-testid="button-add-location">Add a ZIP code</button> to save it with your plan.</p>
      )}
    </section>
  );
}

export function CookSection({ plan, done, onToggle }: { plan: Plan; done: Set<number>; onToggle: (n: number) => void }) {
  const r = plan.recipe;
  const stats: [string, string][] = [
    ['Cuisine', r.cuisine],
    ['Servings', String(plan.servings)],
    ['Prep', `${r.prep} min`],
    ['Cook', `${r.cook} min`],
    ['Total', `${r.prep + r.cook} min`],
    ['Difficulty', r.difficulty],
  ];
  return (
    <section className="result-block cook-block anchor-section" aria-labelledby="cook-heading" data-testid="section-cook">
      <div className="block-head">
        <h3 id="cook-heading"><ChefHat size={18} aria-hidden="true" /> Let's Cook!</h3>
        <span className="progress-pill" data-testid="text-steps-progress">{done.size} of {plan.steps.length} steps done</span>
      </div>
      <div className="cook-title-row"><p className="cook-dish" data-testid="text-cook-dish">{r.name}</p><SourceBadge recipe={r} testId="badge-cook-source" /></div>
      <dl className="cook-stats">
        {stats.map(([k, v]) => <div key={k}><dt>{k}</dt><dd data-testid={`text-cook-${k.toLowerCase()}`}>{v}</dd></div>)}
      </dl>
      <p className="equipment" data-testid="text-equipment"><Utensils size={13} aria-hidden="true" /> <strong>Equipment:</strong> {r.equipment.join(', ')}</p>
      {r.source && <p className="notice notice-muted" data-testid="notice-ai-cook">{aiReviewText}</p>}
      {plan.unresolved > 0 && <p className="notice" data-testid="notice-steps-unresolved"><strong>Before you cook:</strong> {plan.unresolved} ingredient{plan.unresolved > 1 ? 's need' : ' needs'} a dietary decision under Ingredient Substitutions. They are marked in the steps.</p>}
      <ol className="steps">
        {plan.steps.map((s) => {
          const isDone = done.has(s.n);
          return (
            <li key={s.n} className={`step${isDone ? ' done' : ''}`} data-testid={`step-${s.n}`}>
              <button type="button" className="step-check" aria-pressed={isDone} aria-label={`Mark step ${s.n} ${isDone ? 'not done' : 'done'}`} onClick={() => onToggle(s.n)} data-testid={`button-step-done-${s.n}`}>
                {isDone ? <Check size={14} /> : s.n}
              </button>
              <div className="step-body">
                <div className="step-top">
                  <h4>{s.title}</h4>
                  {s.minutes && <span className="step-time"><Clock size={11} aria-hidden="true" /> {s.minutes}</span>}
                </div>
                <p className="step-text">
                  {s.segs.map((seg, i) => (typeof seg === 'string' ? <span key={i}>{seg}</span> : <span key={i} className={`tok tok-${seg.state}`}>{seg.state === 'omitted' ? `${seg.name} (left out)` : seg.name}</span>))}
                </p>
                {s.uses.length > 0 && (
                  <ul className="step-uses">
                    {s.uses.map((u) => <li key={u.id} className={`tok-${u.state}`}>{u.state === 'omitted' ? `${u.name}: left out` : `${u.name}: ${u.qty}`}</li>)}
                  </ul>
                )}
                {s.heatNote && <p className="step-note heat">{s.heatNote}</p>}
                {s.tip && <p className="step-note">Tip: {s.tip}</p>}
                {s.safety && <p className="step-note safety" data-testid={`text-step-safety-${s.n}`}><ShieldCheck size={12} aria-hidden="true" /> {s.safety}</p>}
              </div>
            </li>
          );
        })}
      </ol>
      {r.method && <p className="method-note" data-testid="text-cooking-guidance"><strong>How it comes together:</strong> {r.method}</p>}
      {!r.method && <p className="method-note" data-testid="text-cooking-guidance"><strong>How it comes together:</strong> {r.summary}</p>}
    </section>
  );
}
