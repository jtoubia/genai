# CuisineIQ — Revised Prototype Evaluation

**Evaluation date:** November 23, 2026  
**Prototype:** https://international-cooking-assistant.replit.app/  
**Method:** Manual user testing of the revised application. Results below are reported from the tester's observations; no automated logs or screenshots were supplied for independent verification.

## Test approach

The tests examine recipe generation, dietary personalization, ingredient checklists, shopping-list synchronization, ZIP-code validation, and error handling. The success criteria were established before testing. Reported statuses are preserved, with limitations described wherever a test did not fully exercise the safeguard.

| Case | Input or action | Expected result / success criterion | Actual observed result | Reported outcome | Implication / next step |
| --- | --- | --- | --- | --- | --- |
| **1. Typical — standard recipe** | Chicken Biryani; 4 servings; no dietary restriction; medium spice; authentic shopping preference; ZIP 46556. Mark rice and onions as already at home. | Complete, coherent recipe; checked ingredients excluded from shopping list but retained in instructions; ZIP shown. | Tester reported that the flow worked as expected, including the ingredient checklist and shopping-list updates. | **Pass** | Preserve as a regression test after future changes. |
| **2. Typical — dietary personalization** | Thai Green Curry; 2 servings; dairy-free; mild; simplest shopping trip; ZIP 46601. Review and select an available specialty-ingredient substitution. | Recipe reflects restrictions and spice preference; substitutions update shopping list and directions; no inappropriate dairy ingredients. | Tester reported that the flow worked as expected. | **Pass** | Continue checking consistency across different ingredients and recipes. |
| **3. Challenge — unfamiliar dish** | Ethiopian Doro Wat; 3 servings; dairy-free; mild; ZIP 10001. Review recipe and mark chicken and onions as at home. | Generate an unfamiliar dish, show a coherent plan, handle dairy-related ingredients safely, and update the shopping list. | Tester reported successful generation and checklist behavior. For niter kibbeh, the app required a deliberate choice between an olive-oil substitution and leaving the ingredient out, with a message explaining no safe automatic swap had been made. | **Pass, with manual step** | Manual confirmation is a useful safeguard. Make the choice and its consequences prominent; do not silently substitute incompatible ingredients. |
| **4. Invalid/empty — no dish entered** | Clear dish field and press Search; subsequently press **Update My Plan** farther down the page. | Clear validation; no new recipe generated; no stale result mistaken for a current plan. | Search correctly displays: **“Type a dish name, or pick a popular recipe below.”** However, **Update My Plan** retains the most recently generated Ethiopian Doro Wat plan. | **Partial** | Prevent stale-plan ambiguity: disable plan update until valid dish selection, or explicitly mark the displayed plan as the previous saved plan and block regeneration from empty input. |
| **5. Risk — dietary conflict** | Chicken Biryani; 4 servings; dairy-free. Review substitutions and attempt to restore dairy-containing ingredients if possible. | A dietary-incompatible original ingredient cannot be silently restored; user sees an explanation and remains in control. | Tester reported a pass for the generated dairy-free plan, but the available substitution controls did **not** expose dairy-containing originals to restore. The intended conflict path could not be exercised. | **Pass reported; safeguard not fully verified** | Add a controlled negative test or a visible restriction-specific substitution decision. Do not claim that restoration blocking was tested. |
| **6. Location — ZIP-code handling** | Change ZIP among 46556, 10001, and 90210; submit invalid `123`. | Accept different five-digit ZIPs; update location without changing recipe; reject invalid format; do not invent stores. | Tester reported that the test passed. Invalid input displayed: **“Enter a 5-digit ZIP code, like 46556.”** | **Pass** | This confirms observed input handling, **not** live store availability or comprehensive ZIP database validation. |
| **7. Checklist/substitution synchronization** | Generate dairy-free Chicken Biryani; mark ingredients at home, uncheck one, and swap an ingredient. | Shopping list tracks checked ingredients; replacements supersede originals; cooking instructions remain usable. | Tester reported that the flow passed. When an ingredient already marked as at home was replaced, the original ingredient disappeared because the substitute took its place. | **Pass** | This behavior is expected. Confirm separately that the replacement has its own at-home state and does not inherit the original checkbox automatically. |

## Before-and-after comparison

**Same task:** Tell the app which recipe ingredients are already available and generate a shopping list containing only missing ingredients.

- **Before revision:** Users entered ingredients in free text before seeing the recipe ingredient list. This was difficult for cooks unfamiliar with international recipes and could fail on wording differences such as `potato` versus `potatoes`.
- **After revision:** The recipe is generated first. Users check individual ingredients from its structured list, and the shopping list updates from those selections. In Test 1 and Test 7, the tester reported successful removal of selected ingredients; Test 7 also confirmed that replacing an ingredient removes the superseded original.
- **Interpretation:** The revision makes the workflow easier to understand and avoids dependence on exact free-text name matching for selecting at-home ingredients. This is early usability evidence, not a measured comparison of error rates.

## Live AI consistency check — three repeats

**Repeated input:** Ethiopian Doro Wat, 3 servings, dairy-free, mild. The tester ran the same request **three times**.

**Observed result:** The tester reported **the same results across all three runs**. No changes affecting ingredients, quantities, substitution choices, or cooking instructions were reported; usability and dietary safety were not affected by run-to-run variation.

**Interpretation:** This provides limited evidence of consistency for **this particular request**. It does not establish model reliability for other dishes, preferences, or potentially unsafe edge cases, and it does not independently establish the underlying model's accuracy. If the site caches identical requests or uses prepared outputs, that could also explain identical results; the repeat test alone does not identify the cause.

## What the evidence tells us

The revised CuisineIQ prototype performed well in the tester's reported standard recipe, dietary customization, unfamiliar-dish, shopping-list, ZIP-code, and ingredient-swap scenarios. The post-generation ingredient checklist appears to improve the core shopping workflow, and the unfamiliar Doro Wat example shows a useful pause for human review when the system cannot safely make an automatic dietary substitution. The main observed failure is an **empty dish search that still leaves a previous plan accessible through Update My Plan**, creating a risk of confusion about what has just been generated. The dietary-risk scenario also remains **incompletely tested**, because the tester could not attempt to restore a prohibited dairy ingredient. These seven user-reported cases and the three identical AI runs support preliminary usability value, not readiness for unsupervised or safety-critical use. Next tests should verify the empty-input fix, intentionally exercise a conflicting-substitution path, and check state handling when a user swaps an ingredient already marked as available.

## Recommended next actions (ranked)

1. **Fix stale-plan handling (highest priority).** After empty dish input, disable **Update My Plan** or make it unmistakable that the visible recipe is an earlier saved result; ensure invalid input never silently operates on a prior dish.
2. **Strengthen and verify dietary conflict controls.** Show dietary-driven swaps in a dedicated part of the substitution review, and make an incompatible restore action either unavailable or explicitly rejected with a clear reason. Test that exact interaction.
3. **Verify substitute inventory state.** When an at-home ingredient is swapped for a different ingredient, ensure the new ingredient is treated as a separate item and remains on the shopping list until the user explicitly marks it as available.

## Limitations

These results are based on one tester's manual observations, with brief descriptions rather than captured screen recordings or logs. They do not establish verified store inventory, ZIP-to-city accuracy, culinary authenticity for arbitrary dishes, allergy safety, or broad generative-model reliability. Live-model status should be confirmed from the Replit project's configuration when preparing the final implementation disclosure.
