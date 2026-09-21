# Meal Label Lab

Search USDA food data, build a meal, and read the Nutrition Facts label it produces.

## Where the food data comes from

`nutritive_value_of_foods.csv` is the USDA's _Nutritive Value of Foods_
(Home and Garden Bulletin No. 72), converted from the printed table.

That conversion lost information. The printed table indents each food under a
heading, and the extraction kept only the deepest level. Broccoli is the clearest
example: items 1064-1069 are broccoli, but the word "broccoli" appears nowhere in
those rows. All they carry is a preparation fragment ("Raw", "From raw") that
leaked in from a neighbouring heading, and a variant ("Chopped or diced",
"Spear, about 5\" long"). Searching the CSV for a plain food name missed most of
the table.

So the app does not read the CSV directly. Instead:

| File                           | What it is                                                                                                       |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `nutritive_value_of_foods.csv` | The raw source. Never edited.                                                                                    |
| `scripts/food-catalog.mjs`     | Hand-written names, food groups, and search synonyms for every item number, plus fixes for mangled portion text. |
| `scripts/build-foods.mjs`      | Joins the two and writes the dataset.                                                                            |
| `static/data/foods.json`       | Generated. What the app loads. Do not edit by hand.                                                              |

Rebuild the dataset after changing the catalog:

```sh
npm run build:foods
```

### Known gaps

- Items 4-31 (alcoholic and carbonated drinks) are missing from the source CSV.
- Item 3, a whole raw apple, is in the CSV but its nutrient columns were cut off
  mid-row, so it is left out rather than shown with zeros. Other apple entries
  (sliced, dried, juice, applesauce) are present.
- The printed table's fractions (½ cup, ¼ block) did not survive extraction. Where
  a portion came through as a bare unit, the dataset shows the gram weight
  instead, which the CSV does record correctly.

## Everyday commands

```sh
npm run dev     # but see the workspace AGENTS.md: use ./scripts/agent-dev.mjs
npm run test
npm run check   # types
npm run lint
```
