# CuisineIQ — International Cooking Assistant

## Purpose and intended user

A course prototype for a young adult who is new to international cooking. CuisineIQ takes you from a dish idea to a personalized plan: choose or type any dish, adapt it to your diet, spice preference, kitchen and shopping constraints, get an organized shopping list, and cook it step by step.

## Run and use

From the project root, run `pnpm --filter @workspace/cooking-assistant run dev` (the API server artifact must also run for live AI). The page is one scrolling journey:

1. **Step 1 · Choose Your Dish**: type any dish in "What would you like to cook?" and press Search/Enter, or tap a quick-pick card (13 prepared recipes).
2. **Step 2 · Customize Your Recipe**: servings (1 to 8), dietary preferences, spice, an optional ZIP code, and a shopping preference. Ingredients you already have are checked off later, in **Your Ingredients**; the shopping list is derived from the unchecked ones.
3. **Step 3 · Your Plan**: plan header with source badge, **How your recipe was adapted**, dietary and allergy notes, the ingredient list, and **Ingredient Substitutions**.
4. **Step 4 · Shopping List**: items to buy, specialty items, already at home, and **Nearby Grocery Stores** (your saved location only).
5. **Step 5 · Cook**: prep, cook and total time, servings, difficulty, equipment, and numbered check-off steps with quantities, tips and food-safety notes.

## Where recipes come from

- **Prepared recipes** (`src/data/recipes/*.ts`): 13 hand-written structured recipes. If the typed dish matches one (name or alias), it is selected immediately with no API call. Labeled "Prepared recipe".
- **Live AI recipes**: any other dish is sent to the server-side route `POST {BASE_URL}api/recipes/generate` (`artifacts/api-server`, Replit AI integration; no keys in the browser). The server validates the response against a strict schema and consistency checks (ingredient ids, step tokens, fallback targets). `src/data/live-recipe.ts` converts it into the same `Recipe` model (id `ai-<slug>`, no photo; a cuisine tile is shown instead). Generation takes about 30 to 60 seconds and can be cancelled. Generated recipes are cached in memory for the session, so changing servings, diet, spice or notes never regenerates them. Labeled "AI-generated recipe" (model name in the badge info).
- If the model decides the text is not a real dish, the app shows its message and related prepared recipes; nothing is invented. Errors (400, 429, 502, network) show the message, a retry button and prepared suggestions.

## How adaptation works (rule-based)

Adaptation is conventional code over the structured recipe, for both prepared and AI recipes.

- `src/chef-request.ts`: diet-tag checks shared by the plan engine.
- `src/lib/plan-engine.ts`: scaling (amounts are per 2 servings), diet checks via each ingredient's `contains` tags, diet swaps, fallbacks, spice scaling (½× Mild, 1.5× Spicy for heat ingredients) and at-home removal flow into one item list. The ingredient list, shopping list and step text are all generated from it, so they never contradict each other.
- Safety: conventional diet swaps in prepared recipes may apply automatically and are explained. Swaps written by the AI are never applied silently; conflicting ingredients are flagged as "Needs your decision". Substitutes that conflict with a diet are blocked. AI recipes carry the note that their dietary tags are not guaranteed. No allergen-free claims.

## Ingredient Substitutions

The single home for substitution advice. Each fallback shows Original ingredient, Suggested alternative, Why this works (flavor/texture tradeoff and authenticity) and Shopping consideration (derived from where the ingredient is usually shelved, plus whether it can be omitted; never a stock claim). Keep original / Use substitute updates the shopping list and steps together.

## Location

Optional. Any 5-digit US ZIP (or ZIP+4) is accepted; "City, ST" is also accepted and shown as not verified. Anything else shows "Enter a 5-digit ZIP code, like 46556." on blur and blocks creating the plan. Only six ZIPs are resolved by a tiny built-in table (46601 South Bend, IN; 46556 Notre Dame, IN; 10001 New York, NY; 60601 Chicago, IL; 90210 Beverly Hills, CA; 33101 Miami, FL); other ZIPs show "(city and state not verified)". The location is saved in the form state and shown in Nearby Grocery Stores with a Change location button. There is no store search, inventory, map or store list.

## Transparency

One "About this prototype" panel (top right) explains live AI vs prepared recipes, rule-based adaptation, ZIP behavior and label checking. Food photos in `public/images` are AI-generated illustrations for the prepared recipes.

## Current limits and data caveats

- Thirteen prepared recipes. Methods are simplified, conventional home-cooking versions, not definitive or regional-authentic references. For example, shawarma is oven-roasted with a yogurt-garlic sauce, al pastor is cooked in a skillet rather than on a trompo, and the dairy-free swaps change the character of the dish.
- Safe-temperature guidance follows common USDA figures: 165°F (74°C) for poultry, 160°F (71°C) for ground beef, and 145°F (63°C) plus rest for whole cuts of beef and pork. Carbonara eggs are not brought to 160°F; the app notes this.
- Quantities for descriptive amounts (for example, whole spices) show the 2-serving amount with a scale factor at serving counts other than 2 and 4. Spice changes scale by ½× (Mild) or 1.5× (Spicy).
- No store data, inventory, maps, or browser geolocation. Live AI is used only to write recipes for dishes outside the prepared set.
- AI-written recipes depend on the model and should be reviewed before cooking; they are not saved after a page reload.
- Pad kra pao keeps its original prepared ingredient wording, which still mentions "the demo grocer" in the holy basil note.
