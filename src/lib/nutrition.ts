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

/** Units that read the same whether there is one of them or many. */
const invariantUnits = new Set([
  "oz",
  "g",
  "kg",
  "lb",
  "ml",
  "l",
  "tbsp",
  "tsp",
  "large",
  "medium",
  "small",
]);

/** Units that measure a size rather than count a thing. */
const sizeUnits = new Set(["oz", "g", "kg", "lb", "ml", "l", "tbsp", "tsp"]);

export type Measure = {
  /** How many units one dataset row covers: 10 for "10 halves". */
  count: number;
  /** What those units are called: "halves". */
  unit: string;
};

/** Drops a trailing note like "(24 nuts)" or '(3" dia)'. */
function withoutNote(unit: string): string {
  return unit.replace(/\(.*?\)/g, " ").trim();
}

/** "6 fl oz can" is one can holding 6 fl oz, not six of something. */
function describesSize(rest: string): boolean {
  const words = withoutNote(rest).split(/\s+/);
  const [first, ...remaining] =
    words[0]?.toLowerCase() === "fl" ? words.slice(1) : words;
  return remaining.length > 0 && sizeUnits.has(first?.toLowerCase() ?? "");
}

/**
 * Splits a dataset measure into its count and its unit, so "10 halves" becomes
 * 10 and "halves" and "1/2 breast" becomes 0.5 and "breast". A measure that
 * never counted anything, like "portion of 21-oz can", is one of itself.
 */
export function parseMeasure(measure: string): Measure {
  const trimmed = measure.trim();
  const whole: Measure = { count: 1, unit: trimmed };

  const match = /^(\d+(?:\.\d+)?)(?:\s*\/\s*(\d+))?\s+(.+)$/.exec(trimmed);
  if (!match) return whole;

  const count = match[2]
    ? Number(match[1]) / Number(match[2])
    : Number(match[1]);
  if (!(count > 0) || describesSize(match[3])) return whole;

  return { count, unit: match[3] };
}

function pluralWord(word: string): string {
  if (invariantUnits.has(word) || word.endsWith("s")) return word;
  if (/(potato|tomato|mango)$/.test(word)) return `${word}es`;
  if (/(x|ch|sh)$/.test(word)) return `${word}es`;
  if (/[^aeiou]y$/.test(word)) return `${word.slice(0, -1)}ies`;
  if (/fe?$/.test(word)) return `${word.replace(/fe?$/, "")}ves`;
  return `${word}s`;
}

function singularWord(word: string): string {
  if (invariantUnits.has(word) || !word.endsWith("s")) return word;
  if (word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.endsWith("ves")) return `${word.slice(0, -3)}f`;
  if (/(ss|x|ch|sh)es$/.test(word)) return word.slice(0, -2);
  return word.slice(0, -1);
}

/** Rewrites the head word of a unit, leaving ", chopped" or '(3" dia)' alone. */
function rewriteUnit(unit: string, rewrite: (word: string) => string): string {
  const [, head, rest] = /^([^,(]*)(.*)$/.exec(unit) ?? [];
  if (!head?.trim()) return unit;

  const spacing = head.slice(head.trimEnd().length);
  const words = head.trimEnd().split(" ");
  words[words.length - 1] = rewrite(words[words.length - 1]);
  return `${words.join(" ")}${spacing}${rest ?? ""}`;
}

/** The unit name to show next to an amount: 1 floweret, 3 flowerets. */
export function measureUnit(measure: string, amount: number): string {
  const { count, unit } = parseMeasure(measure);

  // Units that carry their own number, like "6-8 shrimp", never change shape.
  if (/\d/.test(withoutNote(unit))) return unit;

  const isPlural = count > 1;
  const wantPlural = amount !== 1;
  if (isPlural === wantPlural) return unit;

  return rewriteUnit(unit, wantPlural ? pluralWord : singularWord);
}

/** How many units a meal line holds: 3.5 rows of "10 halves" is 35 halves. */
export function measureAmount(food: Food, quantity: number): number {
  return round(parseMeasure(food.measure).count * quantity, 4);
}

/** Turns an amount someone typed, in units, back into dataset rows. */
export function quantityFromAmount(food: Food, amount: number): number {
  return amount / parseMeasure(food.measure).count;
}

function round(value: number, decimals: number): number {
  return Number(value.toFixed(decimals));
}

/** A meal line in the words of the dataset: "0.25 cups", "35 flowerets". */
export function formatMeasure(food: Food, quantity: number): string {
  const amount = measureAmount(food, quantity);
  const unit = measureUnit(food.measure, amount);
  const separator = /^\d/.test(unit) ? " x " : " ";
  return `${round(amount, 2)}${separator}${unit}`;
}
