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
  name: string;
  category: string;
  detail: string;
  measure: string;
  weight: number;
  nutrients: Nutrients;
};

export type MealItem = {
  id: string;
  food: Food;
  quantity: number;
};

const columnMap: Record<NutrientKey, string> = {
  calories: "calories",
  totalFat: "total_fat_g",
  saturatedFat: "sat_fat_g",
  cholesterol: "cholesterol_mg",
  sodium: "sodium_mg",
  carbohydrate: "carbohydrate_g",
  fiber: "fiber_g",
  protein: "protein_g",
  calcium: "calcium_mg",
  iron: "iron_mg",
  potassium: "potassium_mg",
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

export function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];

    if (character === '"') {
      if (quoted && csv[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field.trim());
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && csv[index + 1] === "\n") index += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field || row.length) {
    row.push(field.trim());
    if (row.some(Boolean)) rows.push(row);
  }

  return rows;
}

function cleanText(value: string | undefined): string {
  return (value ?? "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,)])/g, "$1")
    .trim();
}

export function parseFoods(csv: string): Food[] {
  const [headers, ...rows] = parseCsvRows(csv);
  if (!headers) return [];

  return rows.flatMap((values) => {
    const record = Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""]),
    );
    const id = cleanText(record.food_no);
    const category = cleanText(record.category);
    const detail = cleanText(record.food);
    const measure = cleanText(record.measure);
    const weight = parseNumber(record.weight_g);
    const nutrients = emptyNutrients();

    for (const key of nutrientKeys)
      nutrients[key] = parseNumber(record[columnMap[key]]);

    if (!id || (!category && !detail) || weight <= 0 || nutrients.calories <= 0)
      return [];

    const nameParts = [category, detail].filter(Boolean);
    const name = [...new Set(nameParts)].join(" - ");

    return [
      {
        id,
        name,
        category,
        detail,
        measure: measure || `${weight} g`,
        weight,
        nutrients,
      },
    ];
  });
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

export function formatAmount(value: number, decimals = 1): string {
  if (value === 0) return "0";
  if (value < 0.1) return "<0.1";
  return value.toFixed(decimals).replace(/\.0$/, "");
}
