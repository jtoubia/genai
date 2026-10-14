# Kitchen Fieldnotes — International Cooking Assistant

## Purpose and intended user

A small course prototype for a young adult who is new to international cooking. It helps turn a dish idea into a practical shopping plan, explains unfamiliar ingredients in plain language, and makes ingredient substitutions and sourcing less mysterious.

## Run and use

From the project root, run `pnpm --filter @workspace/cooking-assistant run dev` to open the app. Choose one of the three listed dishes, select 2 or 4 servings and either **No restriction** or **Dairy-free**, then choose **Create my shopping plan.** A dish is required and an inline prompt appears if none is selected. Submitted choices stay visible with the plan. Choose **Edit my choices** to change any selection and submit another plan.

## Supported behavior

- Prepared plans for Thai green curry, chicken biryani, and pad kra pao only.
- Servings are limited to 2 or 4; each listed 4-serving quantity is exactly double its 2-serving recipe quantity.
- Dietary choices are No restriction and Dairy-free. The prepared green curry and pad kra pao contain no dairy and say no dairy substitution is needed. Dairy-free biryani uses non-dairy yogurt and neutral oil instead of yogurt and ghee, and describes the expected flavor and texture difference.
- Ingredients are separated into common supermarket and specialty groups and paired with fictional store options: Demo Neighborhood Supermarket and Demo Asian Grocery. Every option is clearly illustrative, not a stock or availability claim.
- Ingredient notes explain unfamiliar ingredients, their role, traditional ingredients versus approximations, and relevant flavor tradeoffs. Holy basil availability is explicitly uncertain; Thai sweet basil is identified as an approximation with a different character.
- The fixed location is South Bend, Indiana — demo location. Packaged labels should always be checked; this prototype makes no allergy-safety claim.

## Prepared data and simulation

All recipe, serving quantity, sourcing, and explanation content is local prepared data in `src/prepared-plans.ts`, isolated from the interface for straightforward editing. The app does not call an AI service, backend, inventory service, or store API. Recommendation, substitution, and store matching are illustrative prepared content—not generated or verified results.

In a future system, AI could interpret open-ended dish requests, clarify a cook’s context, and provide more contextual ingredient and substitution advice. Any future live availability feature would need to be clearly identified and separately verified.

## Current limits

This prototype supports exactly three dishes, two serving sizes, one dietary restriction (Dairy-free), one fixed demo location, and fictional store choices. It has no live AI, inventory checks, real store locations, or confirmed availability. The prepared recipes are concise guidance, not a comprehensive cookbook.
