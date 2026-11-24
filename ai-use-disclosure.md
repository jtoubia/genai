# CuisineIQ — Draft AI-Use Disclosure

**Project:** CuisineIQ / International Cooking Assistant  
**Prototype:** https://international-cooking-assistant.replit.app/  
**Draft prepared:** November 23, 2026

## 1. Tools and their roles

- **ChatGPT:** Helped frame the product's AI value, translate peer feedback into development requirements, draft prompts for Replit, design test scenarios, and organize the documentation. ChatGPT did not independently verify the running application's source code.
- **Replit Agent / Replit's AI development tools:** Used to implement and revise the app from the developer's prompts, including recipe discovery, ingredient checklists, substitutions, shopping-list behavior, and ZIP-code handling. The exact underlying development models and versions have not been recorded here.
- **AI inside CuisineIQ:** The intended capability is to generate recipes for user-entered international dishes and adapt them to serving counts, dietary restrictions, spice preferences, and substitution decisions. The user reports successful generation of an unfamiliar dish (Ethiopian Doro Wat) and repeated identical results. **The model/provider, live invocation path, and which results are generated versus prepared should be confirmed from the Replit project before final submission.**

## 2. How AI assisted development

AI assistance supported product planning, feature requirements, UI flow descriptions, suggested safeguards, test design, and documentation drafts. Replit Agent was instructed to change the existing project rather than rebuild it. The developer selected priorities and tested the application manually; AI-produced code and descriptions were not assumed correct solely because they were generated.

## 3. Representative development prompts and human revisions

These are shortened excerpts from prompts supplied during development, not claims of verbatim Replit output.

| Representative prompt or instruction | Intended contribution | Human review or change |
| --- | --- | --- |
| “Allow users to enter virtually any international dish, not just select from predefined recipes … generate complete recipes through live AI if configured.” | Broaden recipe discovery and emphasize meaningful AI-generated content. | Kept prepared recipes as examples; required honest handling of unsupported requests rather than pretending every request works. |
| “Allow users to enter any five-digit U.S. ZIP code … do not invent live grocery-store data.” | Improve location input without adding an inventory API. | Deliberately deferred store search and exact ingredient availability; separated location handling from culinary substitution advice. |
| “Remove ‘Ingredients already at home’ and ‘Tell the chef what you need’ … generate the complete ingredient list first … check the ingredients already at home.” | Replace fragile free-text ingredient matching with an ingredient-first checklist and derived shopping list. | This was a substantial user-directed reversal of the earlier design: cooks unfamiliar with a dish cannot reliably name ingredients before seeing the recipe, and singular/plural mismatches such as “potato”/“potatoes” could produce errors. |

## 4. Human judgment and rejected or revised AI suggestions

The developer **rejected the earlier AI-assisted suggestion to collect pantry ingredients in a free-text field before recipe generation**. Instead, the app now displays the generated ingredient list and asks users to check the items they already have. This better serves the target user, reduces brittle name matching, and lets conventional code compute the shopping list from structured ingredient selections. The developer also chose **not** to add speculative store names or inventory merely to make the location section look complete.

## 5. AI inside the product: inputs, outputs, and value

**Inputs:** Entered dish, servings, dietary restriction, spice level, and user-reviewed ingredient substitutions. The checked “already at home” ingredient state and ZIP code are interface inputs, not tasks that intrinsically require a language model.

**Intended AI task:** Interpret a dish request and culinary constraints, construct a coherent recipe, propose dietary or specialty-ingredient alternatives, explain tradeoffs, and align cooking steps with the selected ingredients.

**Outputs:** Recipe ingredient list and quantities, substitution options and explanations, cooking instructions, and recipe summary. The app then uses ordinary interface logic to exclude checked at-home ingredients from the shopping list and to validate/retain the ZIP code.

**Why AI adds value:** Unlike a static recipe lookup, a generative model can attempt unfamiliar dishes and reason about interacting cooking constraints. **This is intended product value, not proof that every generated recipe is accurate, authentic, or safe.**

**Implementation status to verify:** The user reports a working unfamiliar-dish generation flow and three repeat requests with the same result. Before publishing this as a final disclosure, inspect Replit's server-side integration/configuration and document the actual model/provider, which paths use live generation, and which rely on prepared or rule-based behavior. Do not publish API keys or sensitive configuration values.

## 6. Verification and limitations

The developer manually ran seven distinct revised-prototype tests, recording **six pass labels and one partial result**. A separate identical-input exercise was run three times for Ethiopian Doro Wat (three servings, dairy-free, mild); the developer reported identical outputs and no usability or dietary-safety variation. Full observations and criteria are in [evaluation.md](evaluation.md).

Two qualifications matter:

1. Empty search input displays the correct error, but **Update My Plan** still retains the previous dish. This was recorded as a partial result, not hidden.
2. The dairy-free substitution risk case did not let the tester attempt to restore a dairy-containing original. The generated plan passed the observed checks, but the **specific conflict-blocking safeguard was not fully tested**. For Doro Wat, the app explicitly requested a user decision about replacing or omitting niter kibbeh, rather than silently deciding.

Manual testing supports early usability findings, not proof of recipe accuracy, model reliability, allergy safety, verified ZIP coverage, or live store availability. Future work should test the stale-plan fix, deliberately exercise dietary-conflict prevention, and verify state handling for a swapped ingredient previously marked as at home.

## 7. Responsible disclosure

Recipe generation and substitutions may contain errors. Users should review ingredient labels, dietary compatibility, and food-safety information before cooking. The app should identify live AI output, prepared examples, and unverified grocery data accurately. Public repository files must not contain credentials, personal information, or API keys.
