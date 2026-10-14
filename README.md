# International Cooking Assistant

A prototype that turns a chosen international dish into a shopping plan with ingredient explanations and sourcing guidance.

## What the first working slice does
Choose a dish (Thai green curry, Chicken biryani, or Pad kra pao), servings (2 or 4), and a dietary preference (No restriction or Dairy-free). Click "Create my shopping plan." to see scaled ingredients, explanations and substitutions for specialty items, and where to look. "Edit my choices" returns to the form.

## Open the prototype
Run `pnpm --filter @workspace/cooking-assistant run dev`, or open the Replit preview link: <add [link](https://international-cooking-assistant.replit.app/)>.
https://international-cooking-assistant.replit.app/

## AI behavior: simulated
A future AI system would interpret open-ended cooking requests and write contextual ingredient explanations and substitutions. Right now everything is prepared data in `src/prepared-plans.ts`. The recommendations, substitutions, and fictional store matching are simulated. Working: dish, servings, and diet selection, scaled quantities, dairy-free changes, validation, and editing.

## Test results
| Test | Input or action | What happened | Result |
| Typical case | Thai green curry, 2 servings, No restriction | Plan showed common and specialty ingredients, sourcing, and disclaimers | Pass |
| Challenge case | Chicken biryani, 4 servings, Dairy-free | Quantities doubled, yogurt and ghee replaced, differences explained, label reminder shown | Pass |
| Invalid or empty case | No dish chosen, submit | Message "Choose a dish to create your shopping plan." and no plan | Pass |

## Known limitations
- Only three dishes, two serving sizes, and one dietary restriction; no open-ended requests.
- Recommendations, substitutions, and stores are prepared examples, not live or verified.
- The location is fixed and the stores are fictional, with no real inventory.
