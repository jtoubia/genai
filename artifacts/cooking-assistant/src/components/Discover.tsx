import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AlertCircle, Clock, RotateCcw, Search, SearchX, X } from 'lucide-react';
import { filterRecipes } from '../data/recipe-source';
import type { Recipe } from '../data/types';
import { DishThumb } from './Shared';

export type GenState =
  | { status: 'idle' }
  | { status: 'loading'; dish: string }
  | { status: 'unrecognized'; dish: string; message: string; related: Recipe[] }
  | { status: 'error'; dish: string; message: string; related: Recipe[] };

function RecipeCard({ recipe, selected, onSelect }: { recipe: Recipe; selected: boolean; onSelect: (id: string) => void }) {
  return (
    <button type="button" className={`recipe-card${selected ? ' selected' : ''}`} aria-pressed={selected} onClick={() => onSelect(recipe.id)} data-testid={`card-recipe-${recipe.id}`}>
      <span className="recipe-photo">
        <DishThumb recipe={recipe} size={800} />
        {selected && <span className="recipe-selected">Selected</span>}
      </span>
      <span className="recipe-body">
        <span className="recipe-cuisine">{recipe.cuisine}</span>
        <span className="recipe-name">{recipe.name}</span>
        <span className="recipe-meta"><Clock size={12} aria-hidden="true" /> About {recipe.prep + recipe.cook} min · {recipe.difficulty}</span>
      </span>
    </button>
  );
}

function Loading({ dish, onCancel }: { dish: string; onCancel: () => void }) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className="gen-loading" role="status" data-testid="status-generating">
      <div className="gen-loading-top">
        <div>
          <strong>Writing your recipe for “{dish}” with live AI.</strong>
          <p>This can take up to a minute. The recipe is checked for a consistent structure before it appears.</p>
        </div>
        <button type="button" className="edit-button" onClick={onCancel} data-testid="button-cancel-generate"><X size={12} aria-hidden="true" /> Cancel</button>
      </div>
      <div className="gen-skel" aria-hidden="true">
        <span style={{ width: '62%' }} /><span style={{ width: '88%' }} /><span style={{ width: '74%' }} /><span style={{ width: '45%' }} />
      </div>
      <span className="gen-timer">{secs}s</span>
    </div>
  );
}

type Props = {
  query: string;
  onQuery: (q: string) => void;
  selectedId: string;
  onSelect: (id: string) => void;
  onSearch: (q: string) => void;
  gen: GenState;
  onCancel: () => void;
  liveRecipes: Recipe[];
};

export function Discover({ query, onQuery, selectedId, onSelect, onSearch, gen, onCancel, liveRecipes }: Props) {
  const [empty, setEmpty] = useState(false);
  const filtered = useMemo(() => filterRecipes(query), [query]);
  const shown = filtered.length ? filtered : filterRecipes('');
  const loading = gen.status === 'loading';

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) { setEmpty(true); return; }
    setEmpty(false);
    onSearch(query.trim());
  }

  return (
    <section id="discover" className="discover anchor-section" aria-labelledby="discover-heading">
      <div className="discover-head">
        <p className="eyebrow">Step 1 · Choose your dish</p>
        <h2 id="discover-heading">What would you like to cook?</h2>
        <p className="discover-sub">Type any dish. Our prepared recipes open instantly; anything else is written for you with live AI.</p>
      </div>
      <form role="search" className="search-form" onSubmit={submit}>
        <label className="sr-only" htmlFor="dish-search">Enter any dish</label>
        <div className="search-wrap">
          <Search size={17} aria-hidden="true" />
          <input
            id="dish-search"
            type="search"
            autoComplete="off"
            value={query}
            onChange={(e) => { onQuery(e.target.value); setEmpty(false); }}
            placeholder="Enter any dish — Chicken Biryani, Doro Wat, Pad Thai, etc."
            aria-describedby={empty ? 'dish-search-error' : undefined}
            disabled={loading}
            data-testid="input-dish-search"
          />
          <button type="submit" className="search-button" disabled={loading} data-testid="button-search">{loading ? 'Writing…' : 'Search'}</button>
        </div>
        {empty && <p id="dish-search-error" className="error-message" role="alert" data-testid="error-search-empty">Type a dish name, or pick a popular recipe below.</p>}
      </form>

      <div aria-live="polite">
        {gen.status === 'loading' && <Loading dish={gen.dish} onCancel={onCancel} />}
        {gen.status === 'unrecognized' && (
          <div className="search-message" data-testid="status-search-unrecognized">
            <SearchX size={18} aria-hidden="true" />
            <div>
              <strong>We could not write a recipe for “{gen.dish}”.</strong>
              <p>{gen.message}</p>
              <p className="related-line">Try one of these prepared recipes:</p>
              <div className="related-chips">{gen.related.map((r) => <button type="button" key={r.id} className="choice-chip as-btn" onClick={() => onSelect(r.id)} data-testid={`button-related-${r.id}`}>{r.name}</button>)}</div>
            </div>
          </div>
        )}
        {gen.status === 'error' && (
          <div className="search-message is-error" role="alert" data-testid="status-search-error">
            <AlertCircle size={18} aria-hidden="true" />
            <div>
              <strong>The recipe could not be written right now.</strong>
              <p>{gen.message}</p>
              <div className="related-chips">
                <button type="button" className="edit-button" onClick={() => onSearch(gen.dish)} data-testid="button-retry-generate"><RotateCcw size={12} aria-hidden="true" /> Try again</button>
                {gen.related.map((r) => <button type="button" key={r.id} className="choice-chip as-btn" onClick={() => onSelect(r.id)} data-testid={`button-related-${r.id}`}>{r.name}</button>)}
              </div>
            </div>
          </div>
        )}
      </div>

      {liveRecipes.length > 0 && (
        <>
          <p className="grid-label">Written for you this session</p>
          <div className="recipe-grid" data-testid="grid-live-recipes">
            {liveRecipes.map((r) => <RecipeCard key={r.id} recipe={r} selected={selectedId === r.id} onSelect={onSelect} />)}
          </div>
        </>
      )}
      <p className="grid-label">{filtered.length && query.trim() ? `Popular recipes matching “${query.trim()}”` : 'Quick picks · popular prepared recipes'}</p>
      <div className="recipe-grid" data-testid="grid-recipes">
        {shown.map((r) => <RecipeCard key={r.id} recipe={r} selected={selectedId === r.id} onSelect={onSelect} />)}
      </div>
    </section>
  );
}
