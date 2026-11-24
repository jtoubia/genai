# CuisineIQ — Prototype Revision, Peer Feedback, and Risk Response

**Revised prototype:** https://international-cooking-assistant.replit.app/  
**Evaluation record:** [evaluation.md](evaluation.md)  
**Recorded testing:** November 23, 2026

## Product and central task

CuisineIQ helps home cooks explore international dishes, adapt recipes to personal preferences, identify ingredients they already have, create a focused shopping list, and follow cooking instructions. Its intended AI role is **recipe generation and culinary adaptation**: interpreting a dish request and cooking constraints, generating a recipe when supported by a live model, and suggesting and explaining adjustments to ingredients and instructions. Deterministic interface logic handles checkboxes, shopping-list filtering, and ZIP-code validation.

The central task is: **choose or enter a dish → select servings and dietary/spice preferences → obtain a recipe → mark ingredients already at home → review substitutions → use the remaining shopping list and cooking instructions**.

## Three priority revisions

### 1. Broader recipe discovery and personalization

The prototype was expanded beyond a dropdown-only set of recipes so a user can type a dish such as Ethiopian Doro Wat. The updated flow also accounts for servings, dietary restrictions, and spice preferences. In the reported challenge test, the Doro Wat plan was generated, and the user was asked to decide how to handle an unsuitable ingredient rather than receiving an unreviewed automatic change.

### 2. Ingredient-first checklist and dynamic shopping list

The earlier interface asked users to type ingredients they already owned **before** they could see the recipe. This was difficult for unfamiliar dishes and fragile when names did not match exactly (for example, `potato` versus `potatoes`). The revised interface generates the ingredient list first, then lets users check the exact ingredients they already have. The shopping list is derived from what remains unchecked. The tester reported that check/uncheck actions and substitution replacement worked.

### 3. Clearer end-to-end cooking and shopping flow

The revised experience includes cooking instructions, ingredient substitution guidance, a shopping preference, and editable ZIP-code input. Location input can be validated without falsely claiming real-time grocery-store inventory. Ingredient advice is distinguished from the location section; shopping guidance remains a prototype capability rather than verified in-stock recommendations.

## Response to peer feedback

| Feedback or observed issue | Decision | What changed, or why deferred |
| --- | --- | --- |
| The original flow was fast and easy, but AI appeared underused and prepared outcomes looked hardcoded. | **Acted on / expanded** | Added broader dish entry and more meaningful recipe adaptation. The challenge test generated Ethiopian Doro Wat with a deliberate dairy-related substitution choice. Actual live-model integration details must be confirmed in the repository/configuration. |
| Users should be able to adapt taste, missing ingredients, and shopping constraints. | **Adapted** | Retained dietary and spice preferences; added ingredient substitution review and a post-generation at-home checklist. Removed the earlier free-text “ingredients already at home” input because it demanded knowledge users might not possess. |
| Specialty ingredients such as Thai basil and makrut lime leaves need practical fallback guidance. | **Acted on** | Added/reviewed specialty-ingredient substitution explanations and user selection in the recipe results. The tester reported that Thai Green Curry substitutions behaved as expected. |
| The app should make shopping more practical, ideally finding everything at one store or optimizing across stores. | **Partially acted on; inventory deferred** | Added shopping preferences, dynamically filtered shopping lists, and flexible ZIP entry. Accurate store inventory, price comparison, and multi-store optimization remain out of scope without verified data. |
| Users need to know what changed and retain control over choices. | **Acted on; follow-up identified** | The Doro Wat test presented a manual decision for an unsuitable dietary ingredient. A further test is needed to verify what happens if a user tries to reintroduce a prohibited ingredient. |

## Evaluation summary

Seven distinct cases were reported: **six pass labels and one partial label**. The passes cover standard recipes, personalization, unfamiliar-dish entry, location validation, and ingredient-list synchronization. **Test 5 was labeled pass by the tester but did not actually exercise restoration of a dietary-incompatible original ingredient**, so the safeguard remains incompletely verified. Test 4 exposed a partial failure: an empty dish search shows the correct inline validation, but the **Update My Plan** action still retains the last generated recipe.

An additional live-AI consistency exercise repeated the same Ethiopian Doro Wat request three times. The tester reported **identical results** and no usability or dietary-safety differences. Full input, success criteria, observations, and limits appear in [evaluation.md](evaluation.md).

## Before versus after

**Before:** Users had to predict which ingredients a recipe would require and type the ones they had. Singular/plural naming differences could prevent an ingredient from being removed from the shopping list.

**After:** Users first see the full recipe ingredients, check the ones they already have, and see the shopping list update. The tester reported success on this workflow and confirmed that selecting a substitute replaces the original ingredient in the active list. The revised design better serves cooks unfamiliar with international ingredients and reduces text-matching errors.

## Concrete product risk and safeguard

**Risk:** A user with a dietary restriction might follow an AI-suggested ingredient that conflicts with that restriction. The affected user could prepare a meal they intended to avoid; the outcome could range from an unwanted dietary deviation to a more serious issue if an allergen were involved.

**Design response:** The user can review substitution decisions rather than having the system silently apply every change. During the dairy-free Ethiopian Doro Wat test, the app indicated that an ingredient had no safe automatic swap and required the user to choose between an olive-oil replacement and omission. This supports **user control and avoidance of over-reliance on AI**: uncertain substitutions are surfaced rather than hidden.

**Remaining risk:** The separate Chicken Biryani risk test did not expose a dairy-containing original ingredient for attempted restoration. We therefore **cannot claim that conflicting restoration is blocked**. Ingredients and packaged products still require user verification, especially for allergies and cross-contact. A targeted conflict test and stronger restriction-aware controls are priorities.

## Findings and next priorities

The feedback-driven shift to an ingredient-first checklist improves the practical shopping experience while keeping the AI role focused on recipe creation and culinary adaptation. The app's main known usability bug is stale-plan access after an invalid dish search. The highest priorities are:

1. Fix **Update My Plan** when dish input is empty so the previous result cannot be mistaken for a new result.
2. Make dietary-driven substitutions visible and test rejection of an incompatible ingredient choice.
3. Verify that replacing an at-home ingredient does not automatically mark the new substitute as already owned.

## Scope and disclosure notes

This milestone is an evaluated prototype, not a verified grocery inventory service or a substitute for checking ingredient labels and cooking safety. Distinguish actual live AI output from prepared recipes, rule-based adjustments, and planned functionality in the repository's AI-use disclosure. The tester's repeated AI results were identical, but that alone does not establish model accuracy or prove that every request reaches a live model.
