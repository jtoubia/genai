import { AlertTriangle, Check, ChefHat, Clock, Info, MapPin, ShieldCheck, Store, Utensils } from 'lucide-react';
import { UNRECOGNIZED_MESSAGE } from '../chef-request';
import { AVAILABILITY_HELP, DEMO_STORE_LABEL, demoStores } from '../data/stores';
import type { Decisions, Plan, PlanItem, SwapChoice } from '../lib/plan-engine';
import type { StorePlan } from '../lib/store-plan';
import { storeOptionDisclosure } from '../prepared-plans';

type Toggle = (id: string) => void;

export function IngredientList({ items, group, checked, onToggle }: { items: PlanItem[]; group: string; checked: Set<string>; onToggle: Toggle }) {
  return (
    <ul className="ingredient-list" data-testid={`list-${group}-ingredients`}>
      {items.map((item) => {
        const on = checked.has(item.id);
        return (
          <li className={`ingredient${on ? ' is-checked' : ''}${item.status === 'conflict' ? ' is-conflict' : ''}`} key={item.id} data-testid={`ingredient-${item.id}`}>
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
              <p className="ingredient-detail" data-testid={`text-ingredient-explanation-${item.id}`}>{item.note}</p>
              {item.change !== 'none' && item.origName !== item.name && <p className="ingredient-was">Instead of: {item.origName}</p>}
              {item.violates.length > 0 && <p className="ingredient-was warn-text">Does not meet: {item.violates.join(', ')}</p>}
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
        <h3 id="adapted-heading">How Your Recipe Was Adapted</h3>
        <span className="sim-badge">Prototype AI Simulation</span>
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
        <p className="block-empty" data-testid="text-no-adaptations">No changes needed. This is the standard prepared recipe, scaled to {plan.servings} {plan.servings === 1 ? 'serving' : 'servings'}.</p>
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
  const specialtyStores = [...new Set(specialty.map((i) => demoStores.find((s) => s.carries.includes(i.source))?.name ?? 'Demo Asian Grocery'))];

  return (
    <section id="shopping" className="result-block anchor-section" aria-labelledby="shopping-heading" data-testid="section-shopping-list">
      <div className="block-head">
        <h3 id="shopping-heading">Ingredients & Shopping List</h3>
        <span className="progress-pill" data-testid="text-shopping-progress">{done} of {toGet.length} in basket</span>
      </div>
      <div className="progress-bar" aria-hidden="true"><span style={{ transform: `scaleX(${toGet.length ? done / toGet.length : 0})` }} /></div>

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

      <section className="section-card" aria-labelledby="common-heading" data-testid="section-common-ingredients">
        <div className="section-title">
          <h4 id="common-heading">Need to buy</h4>
          <span className="store-name" data-testid="text-common-store">Demo Neighborhood Supermarket</span>
        </div>
        <p className="store-disclaimer" data-testid="text-common-store-disclaimer">{storeOptionDisclosure}</p>
        {buy.length ? <IngredientList items={buy} group="common" checked={checked} onToggle={onToggle} /> : <p className="empty-specialty">Nothing else to buy here. You have it covered.</p>}
      </section>

      <section className="section-card" aria-labelledby="specialty-heading" data-testid="section-specialty-ingredients">
        <div className="section-title">
          <h4 id="specialty-heading">Specialty ingredients</h4>
          <span className="store-name" data-testid="text-specialty-store">{specialtyStores.join(' · ') || 'Demo Asian Grocery'}</span>
        </div>
        <p className="store-disclaimer" data-testid="text-specialty-store-disclaimer">{storeOptionDisclosure}</p>
        {specialty.length > 0 ? (
          <IngredientList items={specialty} group="specialty" checked={checked} onToggle={onToggle} />
        ) : (
          <p className="empty-specialty" data-testid="text-specialty-empty">Nothing needed from the specialty grocer with your current choices. One supermarket trip covers the list.</p>
        )}
      </section>

      {leftOut.length > 0 && (
        <p className="left-out" data-testid="text-left-out"><strong>Left out:</strong> {leftOut.map((i) => i.origName).join(', ')}</p>
      )}
    </section>
  );
}

type SubProps = { plan: Plan; decisions: Decisions; onSwap: (id: string, c: SwapChoice) => void; onDiet: (id: string, v: string) => void };

export function SubstitutionSection({ plan, decisions, onSwap, onDiet }: SubProps) {
  const swapped = plan.fallbacks.filter((f) => f.current === 'substitute').length;
  return (
    <section className="result-block" aria-labelledby="swap-heading" data-testid="section-substitution-review">
      <div className="block-head">
        <h3 id="swap-heading">Ingredient Substitutions</h3>
        <span className="progress-pill">{swapped} of {plan.fallbacks.length} swapped</span>
      </div>
      <p className="control-note" data-testid="text-control-note">You stay in control — review suggested swaps before using your final shopping list.</p>

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
                  <div><dt>Why it matters</dt><dd>{f.why}</dd></div>
                  <div><dt>Suggested substitute</dt><dd>{f.substitute}</dd></div>
                  <div><dt>What changes</dt><dd>{f.changes}</dd></div>
                  <div><dt>Can it be omitted?</dt><dd>{f.omittable}</dd></div>
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

export function StoresSection({ storePlan, onChangeLocation }: { storePlan: StorePlan; onChangeLocation: () => void }) {
  const { location, stops, advice } = storePlan;
  return (
    <section className="result-block" aria-labelledby="stores-heading" data-testid="section-stores">
      <div className="block-head">
        <div>
          <h3 id="stores-heading">Nearby Grocery Stores</h3>
          <p className="block-sub">Find Ingredients Near You</p>
        </div>
        <button type="button" className="edit-button" onClick={onChangeLocation} data-testid="button-change-location"><MapPin size={12} aria-hidden="true" /> Change location</button>
      </div>

      {location.kind === 'empty' && <p className="block-empty" data-testid="text-stores-empty">Add a ZIP code or city and state in the form to see store suggestions.</p>}
      {location.kind === 'invalid' && <p className="notice notice-muted" data-testid="text-stores-invalid">We could not read that location. Use a 5-digit ZIP code (46601) or “City, ST” (South Bend, IN).</p>}
      {location.kind === 'other' && (
        <div className="notice notice-muted" data-testid="text-stores-unavailable">
          <strong>Live store data is unavailable in this prototype for {location.display}.</strong> CuisineIQ has no connected places or inventory service, so it will not list stores it cannot verify. Example store data is available only for the demo location, South Bend, IN 46601. Your shopping list and the advice below still apply anywhere.
        </div>
      )}

      {location.kind === 'demo' && (
        <>
          <p className="demo-label" data-testid="text-demo-store-label"><Info size={13} aria-hidden="true" /> {DEMO_STORE_LABEL}. Showing examples for {location.display}. No addresses, distances or directions are provided for fictional stores.</p>
          <div className="legend" data-testid="text-availability-legend">
            {(['Likely category', 'Unknown', 'Confirmed'] as const).map((a) => (
              <span key={a} className={`avail avail-${a.split(' ')[0].toLowerCase()}`} title={AVAILABILITY_HELP[a]}>{a}{a === 'Confirmed' ? ' (not used: no inventory data)' : ''}</span>
            ))}
          </div>
          <div className="store-stops">
            {stops.map((stop) => (
              <article className="store-card" key={stop.store.id} data-testid={`card-store-${stop.store.id}`}>
                <div className="store-card-head">
                  <Store size={16} aria-hidden="true" />
                  <div>
                    <strong>{stop.store.name}</strong>
                    <span>{stop.store.category} · {stop.store.strengths}</span>
                  </div>
                  <span className={`role-pill role-${stop.role.split(' ')[0].toLowerCase()}`}>{stop.role}</span>
                </div>
                <ul className="store-items">
                  {stop.items.map(({ item, availability }) => (
                    <li key={item.id}><span>{item.name}</span><span className={`avail avail-${availability.split(' ')[0].toLowerCase()}`}>{availability}</span></li>
                  ))}
                </ul>
              </article>
            ))}
            {stops.length === 0 && <p className="block-empty">Everything is already at home. No shopping needed.</p>}
          </div>
        </>
      )}

      {advice.length > 0 && (
        <ul className="advice-list" data-testid="list-shopping-advice">
          {advice.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
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
    <section id="cook" className="result-block cook-block anchor-section" aria-labelledby="cook-heading" data-testid="section-cook">
      <div className="block-head">
        <h3 id="cook-heading"><ChefHat size={18} aria-hidden="true" /> Let's Cook!</h3>
        <span className="progress-pill" data-testid="text-steps-progress">{done.size} of {plan.steps.length} steps done</span>
      </div>
      <p className="cook-dish" data-testid="text-cook-dish">{r.name}</p>
      <dl className="cook-stats">
        {stats.map(([k, v]) => <div key={k}><dt>{k}</dt><dd data-testid={`text-cook-${k.toLowerCase()}`}>{v}</dd></div>)}
      </dl>
      <p className="equipment" data-testid="text-equipment"><Utensils size={13} aria-hidden="true" /> <strong>Equipment:</strong> {r.equipment.join(', ')}</p>
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
