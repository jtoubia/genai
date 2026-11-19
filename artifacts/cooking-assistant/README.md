# CuisineIQ — International Cooking Assistant

## Purpose and intended user

A course prototype for a young adult who is new to international cooking. CuisineIQ takes you from a dish idea to a personalized plan: discover a dish, adapt it to your diet, spice preference, kitchen and shopping constraints, get an organized shopping list, see example store suggestions, and cook it step by step.

## Run and use

From the project root, run `pnpm --filter @workspace/cooking-assistant run dev`. The page follows the navigation **Discover | Customize | Shopping Plan | Cook**:

1. **Discover**: search any dish or tap a recipe card. Typing filters the 13 prepared recipes; the original dropdown remains as a secondary option.
2. **Customize**: servings (1 to 8), dietary preferences (None, Dairy-free, Vegetarian, Vegan, Gluten-free; multi-select), spice (Mild/Medium/Spicy), ingredients already at home, the optional **Tell the chef what you need** box, and **Find Ingredients Near You** (ZIP or City, ST plus Simplest Shopping Trip or Most Authentic Ingredients).
3. **Create my shopping plan.** A dish is required; an inline message appears if none is chosen. The chef request never blocks submission.
4. Results: **Your Cooking Plan**, **How Your Recipe Was Adapted**, dietary and allergy notes, **Ingredients & Shopping List** (Already at home / Need to buy / Specialty, with checkboxes), **Ingredient Substitutions**, **Nearby Grocery Stores**, and **Let's Cook!** (stats, equipment, numbered steps with quantities, timing, tips, food-safety notes and check-off). **Edit my choices** returns to the form with all inputs kept.

## How personalization works (Prototype AI Simulation)

No live AI model is configured. Personalization is conventional programming over one structured recipe model, clearly labeled **Prototype AI Simulation** in the app.

- `src/data/recipes/*.ts`: one structured `Recipe` per dish. It holds ingredients with 2-serving base amounts, specialty and source flags, a `contains` list (dairy, meat, fish, egg, gluten, honey), heat flags, diet swaps, hard-to-find fallbacks, and steps that reference ingredients by id (`{chicken}`).
- `src/chef-request.ts`: keyword and phrase matching for the chef request and the at-home field. It recognizes "already have", "can't find" and "don't have", mild or spicier, one store or easy to find, authentic, and requests that conflict with a selected diet. Unrecognized text shows: "We couldn't confidently apply that request yet…". Nothing is invented.
- `src/lib/plan-engine.ts`: builds the plan. Diet swaps, user-chosen substitutions, spice scaling and already-at-home removals all flow into one item list. The shopping list, quantities and step text are all generated from that list, so they stay consistent.
- `src/data/recipe-source.ts`: a `RecipeSource` interface. Only the prepared source exists. `liveAiRecipeSource` is `null`; a future server-side AI provider can implement the same interface and return validated `Recipe` objects without changing the UI.

### Free-form search outcomes

- **Supported**: matches a prepared recipe by name or alias.
- **Unfamiliar**: a recognized dish with no prepared recipe, such as ramen or pho. The app says live AI recipe generation is not configured and suggests related prepared recipes.
- **Unsupported**: no match. The app shows a helpful message plus related prepared recipes and never invents a recipe.

### Safety and user control

- Conventional diet swaps (for example, non-dairy yogurt and oil for yogurt and ghee in biryani, or tamari for soy sauce) are applied when that diet is selected and are listed with their tradeoffs.
- When an ingredient cannot be reliably adapted (meat, fish sauce or oyster sauce under Vegan, eggs in carbonara, and similar), it is **flagged as "Needs your decision"**. You choose a compatible option, leave it out, or explicitly keep the original. A kept original stays labeled "Does not meet your diet". Optional conflicting items such as the fried egg are left out by default, and the app says so.
- Hard-to-find substitutes that conflict with a selected diet are **blocked** and explained. Requests such as "add butter" under Dairy-free are reported as not applied.
- Allergy wording: no allergen-free guarantee. Always check labels and cross-contact statements.

## Stores

There is no live places or inventory service. For the demo location only (South Bend, Indiana / ZIP 46601), three fictional stores are shown and labeled "Illustrative example store data - not real businesses": Demo Neighborhood Supermarket, Demo Asian Grocery, and Demo Indian & International Market. They have no addresses, distances, maps or directions. Availability labels are **Likely category** or **Unknown**. **Confirmed** is never used because no inventory data exists. Any other location gets an honest "live store data is unavailable" message and no stores.

## Prepared data

All recipe, quantity, sourcing and explanation content is local prepared data, with no backend, AI service or store API calls. The original Thai green curry, chicken biryani and pad kra pao keep their prepared ingredient quantities and explanations. At 2 and 4 servings their exact prepared wording is shown; other serving counts scale proportionally. The 2 to 4 serving scaling is an exact doubling for every recipe. Food photos in `public/images` are AI-generated illustrations.

## Current limits and data caveats

- Thirteen prepared recipes. Methods are simplified, conventional home-cooking versions, not definitive or regional-authentic references. For example, shawarma is oven-roasted with a yogurt-garlic sauce, al pastor is cooked in a skillet rather than on a trompo, and the dairy-free swaps change the character of the dish.
- Safe-temperature guidance follows common USDA figures: 165°F (74°C) for poultry, 160°F (71°C) for ground beef, and 145°F (63°C) plus rest for whole cuts of beef and pork. Carbonara eggs are not brought to 160°F; the app notes this.
- Quantities for descriptive amounts (for example, whole spices) show the 2-serving amount with a scale factor at serving counts other than 2 and 4. Spice changes scale by ½× (Mild) or 1.5× (Spicy).
- Request parsing is keyword-based and can miss phrasing. Unmatched at-home items are listed as not matched.
- No live AI, store data, inventory, maps, or browser geolocation.
