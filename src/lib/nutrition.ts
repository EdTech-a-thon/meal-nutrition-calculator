export const nutrientKeys = [
  "calories",
  "totalFat",
  "saturatedFat",
  "cholesterol",
  "sodium",
  "carbohydrate",
  "fiber",
  "protein",
  "calcium",
  "iron",
  "potassium",
] as const;

export type NutrientKey = (typeof nutrientKeys)[number];
export type Nutrients = Record<NutrientKey, number>;

export type NutritionProfile = {
  id: string;
  label: string;
  description: string;
  targets: Nutrients;
};

export type Food = {
  id: string;
  /** Canonical food name, e.g. "Broccoli, cooked". */
  name: string;
  /** How this row differs from its siblings, e.g. "From frozen, chopped". */
  variant: string;
  /** Food group heading, e.g. "Vegetables". */
  group: string;
  measure: string;
  weight: number;
  /** Extra search terms: plurals, synonyms, common names. */
  keywords: string[];
  nutrients: Nutrients;
};

export type FoodDataset = {
  source: string;
  generated: string;
  foods: Food[];
};

export type MealItem = {
  id: string;
  food: Food;
  quantity: number;
};

export const dailyValues: Partial<Record<NutrientKey, number>> = {
  totalFat: 78,
  saturatedFat: 20,
  cholesterol: 300,
  sodium: 2300,
  carbohydrate: 275,
  fiber: 28,
  calcium: 1300,
  iron: 18,
  potassium: 4700,
};

export function emptyNutrients(): Nutrients {
  return Object.fromEntries(nutrientKeys.map((key) => [key, 0])) as Nutrients;
}

export function parseNumber(value: string | undefined): number {
  if (
    !value ||
    value.trim().toLowerCase() === "tr" ||
    value.trim().toLowerCase() === "na"
  ) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

const requiredKeys: (keyof Food)[] = [
  "id",
  "name",
  "measure",
  "weight",
  "nutrients",
];

/** Reads the dataset produced by scripts/build-foods.mjs. */
export function parseFoods(raw: unknown): Food[] {
  const foods = (raw as FoodDataset | undefined)?.foods;
  if (!Array.isArray(foods)) return [];

  return foods.flatMap((food) => {
    if (requiredKeys.some((key) => food?.[key] === undefined)) return [];
    if (!(food.weight > 0)) return [];

    const nutrients = emptyNutrients();
    for (const key of nutrientKeys)
      nutrients[key] = parseNumber(String(food.nutrients?.[key] ?? 0));

    return [
      {
        id: String(food.id),
        name: food.name,
        variant: food.variant ?? "",
        group: food.group ?? "",
        measure: food.measure,
        weight: food.weight,
        keywords: food.keywords ?? [],
        nutrients,
      },
    ];
  });
}

/** Name plus variant, for display in a list or on a meal line. */
export function foodLabel(food: Food): string {
  return food.variant ? `${food.name} - ${food.variant}` : food.name;
}

function haystack(food: Food): string {
  return [food.name, food.variant, food.group, ...food.keywords]
    .join(" ")
    .toLowerCase();
}

/** Names are "Bananas, raw" or "Broccoli, cooked" - the food itself comes first. */
function headword(name: string): string {
  return name.split(",")[0].trim().toLowerCase();
}

function samePlural(a: string, b: string): boolean {
  return a === b || a === `${b}s` || `${a}s` === b;
}

/**
 * Every query word has to appear somewhere in the food's name, variant, group,
 * or keywords. Results are then ranked so that the food someone actually named
 * wins: "banana" puts "Bananas, raw" above "Banana bread", and a match that
 * only landed in a variant or a synonym sinks to the bottom.
 */
export function searchFoods(foods: Food[], query: string, limit = 12): Food[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  const terms = normalized.split(/\s+/);

  const scored = foods.flatMap((food) => {
    const text = haystack(food);
    if (!terms.every((term) => text.includes(term))) return [];

    const name = food.name.toLowerCase();
    const rank =
      name === normalized
        ? 0
        : samePlural(headword(name), normalized)
          ? 1
          : name.startsWith(normalized)
            ? 2
            : food.keywords.some(
                  (keyword) => keyword.toLowerCase() === normalized,
                )
              ? 3
              : name.includes(normalized)
                ? 4
                : terms.every((term) => name.includes(term))
                  ? 5
                  : 6;

    return [{ food, rank }];
  });

  scored.sort(
    (a, b) =>
      a.rank - b.rank ||
      a.food.name.localeCompare(b.food.name) ||
      Number(a.food.id) - Number(b.food.id),
  );

  return scored.slice(0, limit).map((entry) => entry.food);
}

export function calculateMeal(items: MealItem[], servings: number): Nutrients {
  const totals = emptyNutrients();
  const divisor = Math.max(1, Number.isFinite(servings) ? servings : 1);

  for (const item of items) {
    const quantity = Math.max(
      0,
      Number.isFinite(item.quantity) ? item.quantity : 0,
    );
    for (const key of nutrientKeys)
      totals[key] += item.food.nutrients[key] * quantity;
  }

  for (const key of nutrientKeys) totals[key] /= divisor;
  return totals;
}

export function dailyValuePercent(
  key: NutrientKey,
  value: number,
  targets: Partial<Record<NutrientKey, number>> = dailyValues,
): number | null {
  const dailyValue = targets[key];
  return dailyValue ? Math.round((value / dailyValue) * 100) : null;
}

export function formatDailyValuePercent(percent: number | null): string {
  if (percent === null) return "";
  return percent === 0 ? "0%" : `${percent}%`;
}

export function formatAmount(value: number, decimals = 1): string {
  if (value === 0) return "0";
  if (value < 0.1) return "<0.1";
  return value.toFixed(decimals).replace(/\.0$/, "");
}
