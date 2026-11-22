import { useState } from 'react';
import { BookOpen, Info, Sparkles, X } from 'lucide-react';
import type { Recipe } from '../data/types';
import { aboutPoints } from '../prepared-plans';

/** Photo for prepared recipes; a typographic cuisine tile for AI-written ones (never a fake photo). */
export function DishThumb({ recipe, size, className = '', testId }: { recipe: Recipe; size: number; className?: string; testId?: string }) {
  if (recipe.image) return <img src={recipe.image} alt={recipe.alt} width={size} height={size} className={className} data-testid={testId} />;
  const initials = recipe.cuisine.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <span className={`dish-tile ${className}`} role="img" aria-label={recipe.alt} data-testid={testId}>
      <span className="dish-tile-mark">{initials}</span>
      <span className="dish-tile-cuisine">{recipe.cuisine}</span>
    </span>
  );
}

export function SourceBadge({ recipe, testId }: { recipe: Recipe; testId?: string }) {
  const [open, setOpen] = useState(false);
  if (!recipe.source) {
    return <span className="source-badge prepared" data-testid={testId}><BookOpen size={11} aria-hidden="true" /> Prepared recipe</span>;
  }
  return (
    <span className="source-wrap">
      <button
        type="button"
        className="source-badge live"
        aria-expanded={open}
        title={`Written by live AI (${recipe.source.model})`}
        onClick={() => setOpen(!open)}
        data-testid={testId}
      >
        <Sparkles size={11} aria-hidden="true" /> AI-generated recipe <Info size={11} aria-hidden="true" />
      </button>
      {open && (
        <span className="source-pop" role="note">
          Written by live AI (model: {recipe.source.model}) from the dish name, then checked for a consistent structure. Adaptations to your choices are rule-based.
        </span>
      )}
    </span>
  );
}

export function AboutPrototype() {
  const [open, setOpen] = useState(false);
  return (
    <div className="about">
      <button type="button" className="about-toggle" aria-expanded={open} aria-controls="about-panel" onClick={() => setOpen(!open)} data-testid="button-about-prototype">
        <Info size={14} aria-hidden="true" /> About this prototype
      </button>
      {open && (
        <div id="about-panel" className="about-panel" role="region" aria-label="About this prototype" data-testid="panel-about-prototype">
          <div className="about-head">
            <strong>About this prototype</strong>
            <button type="button" className="icon-btn" aria-label="Close" onClick={() => setOpen(false)} data-testid="button-close-about"><X size={14} /></button>
          </div>
          <ul>{aboutPoints.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
