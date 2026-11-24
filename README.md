# CuisineIQ — International Cooking Assistant

**Discover it. Shop for it. Cook it.**

[Open the working prototype](https://international-cooking-assistant.replit.app/)

CuisineIQ helps home cooks explore international dishes, tailor recipes to their dietary and taste preferences, identify which ingredients they already own, make a focused shopping list, and follow cooking instructions. It is especially intended for people unfamiliar with the ingredients or techniques used in international recipes.

## Central user flow

1. **Choose a dish.** Enter a dish name or choose a suggested recipe.
2. **Customize.** Select servings, dietary requirements, spice preferences, and shopping preferences.
3. **Review the recipe.** Read the generated ingredients and any proposed substitutions.
4. **Check what you have.** Mark ingredients already available at home; unchecked items form the shopping list.
5. **Set a shopping location.** Enter or update a five-digit U.S. ZIP code. This is **not** a live inventory lookup.
6. **Cook.** Follow the recipe's step-by-step preparation instructions.

## AI's role

CuisineIQ's intended AI function is **recipe generation and culinary adaptation**, not merely scaling quantities or checking boxes. The system aims to generate recipes for user-entered dishes, respond to dietary and spice requirements, suggest ingredient substitutions, explain flavor/texture tradeoffs, and align cooking instructions with those choices.

Conventional application code handles ingredient checkbox state, filtering the shopping list, and ZIP-code input. The user has tested an unfamiliar-dish generation scenario; **details of the live model/provider and which paths use prepared versus generated content still need confirmation from the Replit configuration**. See the [AI-use disclosure](ai-use-disclosure.md) for an explicit status discussion.

## What changed in this revision

- **Flexible recipe entry and adaptation:** Broader dish search and cooking preferences, including an Ethiopian Doro Wat test beyond the original prepared examples.
- **Ingredient-first shopping flow:** A generated ingredient checklist replaces the earlier free-text “ingredients already at home” field. Marked items are excluded from the shopping list, while remaining in the recipe instructions.
- **More useful end-to-end flow:** Substitution guidance, recipe steps, shopping preferences, and editable ZIP-code input. Specific store inventory is not claimed.

The changes were informed by peer review, which praised the prototype's clarity but requested a more meaningful AI role, better substitutions, and more flexible ingredient handling. See [revision.md](revision.md).

## Evaluation at a glance

Seven manual tests were reported on November 23, 2026: **six labeled pass, one partial**. These covered standard and personalized recipes, an unfamiliar dish, empty input, a dietary-risk scenario, ZIP changes, and shopping-list synchronization. The empty search correctly displayed validation but left a previous plan accessible through **Update My Plan**. The dietary-risk test was labeled pass, but the specific attempted restoration of a prohibited dairy ingredient could not be tested; that safeguard remains incompletely verified.

The same Ethiopian Doro Wat AI request was repeated three times with identical reported results and no usability or dietary-safety differences. This is limited consistency evidence, not proof of general model accuracy.

- [Full evaluation and test cases](evaluation.md)
- [Revision decisions, peer feedback, before/after comparison, and risk response](revision.md)
- [Draft AI-use disclosure](ai-use-disclosure.md)

## Current limitations and priorities

1. Fix stale-plan behavior after an empty dish search.
2. Make dietary-driven substitutions more explicit and test rejection of incompatible originals.
3. Verify that a newly selected substitute does not inherit an unrelated “already at home” checkbox state.

CuisineIQ is a prototype. ZIP entry does not verify grocery-store stock, and suggestions should not be treated as guarantees of dietary or allergy safety. Recipes, labels, and cooking safety still require user review.

## Demo video

**[ADD GOOGLE DRIVE DEMO VIEWING LINK HERE AFTER RECORDING]**

The required demo is a **2–3 minute screen recording with narration**. Upload the video to Google Drive and grant access to:

- Emelia Hughes — `ehughes8@nd.edu`
- Samuel Huang — `ghuang3@nd.edu`

Also upload the **video file itself** to Canvas with the public GitHub repository link. The optional [demo speaking script](demo-script.md) is provided for recording preparation; the assignment does **not** require uploading a script.

## Repository contents

| File | Purpose |
| --- | --- |
| Application source and assets | Current CuisineIQ implementation; ensure this GitHub repository is synchronized with the deployed Replit app. |
| `README.md` | Product overview and links to all milestone materials. |
| [`revision.md`](revision.md) | Peer feedback, design choices, before/after, risk response, and remaining priorities. |
| [`evaluation.md`](evaluation.md) | Seven test cases, results, consistency check, and evidence interpretation. |
| [`ai-use-disclosure.md`](ai-use-disclosure.md) | AI tools, prompts, human judgment, implementation status, and verification. |
| [`demo-script.md`](demo-script.md) | Optional narration guide; not a graded submission file. |

## Before submission

- [ ] Confirm the public GitHub repository contains the **current** app code and all linked files.
- [ ] Verify the Replit prototype opens in a private/incognito window.
- [ ] Verify and update the exact live AI implementation details in the disclosure.
- [ ] Replace the Demo Video placeholder with its Google Drive viewing link.
- [ ] Confirm both instructors have viewing access to the video.
- [ ] Upload the same MP4/MOV file directly to Canvas, along with the public GitHub repository link.
- [ ] Do not commit API keys, tokens, or personal information.
