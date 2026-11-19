import { useMemo, type FormEvent } from 'react';
import { Clock, Search, SearchX, Sparkles } from 'lucide-react';
import { filterRecipes, lookupDish } from '../data/recipe-source';
import type { Recipe } from '../data/types';

function RecipeCard({ recipe, selected, onSelect }: { recipe: Recipe; selected: boolean; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      className={`recipe-card${selected ? ' selected' : ''}`}
      aria-pressed={selected}
      onClick={() => onSelect(recipe.id)}
      data-testid={`card-recipe-${recipe.id}`}
    >
      <span className="recipe-photo">
        <img src={recipe.image} alt={recipe.alt} loading="lazy" width={800} height={800} />
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

export function Discover({ query, onQuery, selectedId, onSelect }: { query: string; onQuery: (q: string) => void; selectedId: string; onSelect: (id: string) => void }) {
  const filtered = useMemo(() => filterRecipes(query), [query]);
  const lookup = filtered.length === 0 ? lookupDish(query) : null;
  const shown = lookup && (lookup.kind === 'unfamiliar' || lookup.kind === 'unsupported') ? lookup.related : filtered;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = lookupDish(query);
    if (result.kind === 'match') onSelect(result.recipe.id);
  }

  return (
    <section id="discover" className="discover anchor-section" aria-labelledby="discover-heading">
      <div className="discover-head">
        <p className="eyebrow">Discover</p>
        <h2 id="discover-heading">What would you like to cook?</h2>
      </div>
      <form role="search" className="search-form" onSubmit={submit}>
        <label className="sr-only" htmlFor="dish-search">Search for a dish</label>
        <div className="search-wrap">
          <Search size={17} aria-hidden="true" />
          <input
            id="dish-search"
            type="search"
            autoComplete="off"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search for a dish, e.g., Chicken Biryani, Pad Thai, Tacos al Pastor..."
            data-testid="input-dish-search"
          />
          <button type="submit" className="search-button" data-testid="button-search">Search</button>
        </div>
      </form>

      <div aria-live="polite">
        {lookup?.kind === 'unfamiliar' && (
          <div className="search-message" data-testid="status-search-unfamiliar">
            <Sparkles size={18} aria-hidden="true" />
            <div>
              <strong>We recognize {lookup.dishName}, a {lookup.cuisine} dish, but there is no prepared recipe for it yet.</strong>
              <p>Live AI recipe generation is not configured in this prototype, so CuisineIQ will not make one up. Here are related prepared recipes you can cook today.</p>
            </div>
          </div>
        )}
        {lookup?.kind === 'unsupported' && (
          <div className="search-message" data-testid="status-search-unsupported">
            <SearchX size={18} aria-hidden="true" />
            <div>
              <strong>No prepared recipe matches “{query.trim()}”.</strong>
              <p>CuisineIQ only cooks from its prepared, structured recipes and will not invent one. Try a different spelling, or start from one of these.</p>
            </div>
          </div>
        )}
        {!lookup && query.trim() && (
          <p className="search-count" data-testid="text-search-count">{filtered.length} prepared {filtered.length === 1 ? 'recipe matches' : 'recipes match'} “{query.trim()}”.</p>
        )}
      </div>

      <div className="recipe-grid" data-testid="grid-recipes">
        {shown.map((r) => <RecipeCard key={r.id} recipe={r} selected={selectedId === r.id} onSelect={onSelect} />)}
      </div>
    </section>
  );
}
