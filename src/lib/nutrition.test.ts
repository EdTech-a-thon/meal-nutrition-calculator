import { describe, expect, it } from "vitest";
import {
  calculateMeal,
  dailyValuePercent,
  emptyNutrients,
  foodLabel,
  formatDailyValuePercent,
  formatMeasure,
  measureAmount,
  measureUnit,
  parseFoods,
  parseMeasure,
  quantityFromAmount,
  parseNumber,
  searchFoods,
  nutrientKeys,
  type Food,
  type NutrientKey,
} from "./nutrition";
import { nutritionProfiles } from "./nutrition-profiles";
import { nutrientSources, referenceById } from "./nutrition-profiles/sources";

function makeFood(overrides: Partial<Food> = {}): Food {
  return {
    id: "1",
    name: "Test food",
    variant: "",
    group: "Test",
    measure: "1 cup",
    weight: 100,
    keywords: [],
    nutrients: emptyNutrients(),
    ...overrides,
  };
}

describe("nutrition data", () => {
  it("treats trace, unavailable, and blank values as zero", () => {
    expect(parseNumber("Tr")).toBe(0);
    expect(parseNumber("NA")).toBe(0);
    expect(parseNumber("")).toBe(0);
  });

  it("skips dataset rows that are missing a name or a weight", () => {
    const foods = parseFoods({
      foods: [
        {
          id: "1064",
          name: "Broccoli, raw",
          variant: "Chopped or diced",
          group: "Vegetables",
          measure: "1 cup",
          weight: 88,
          keywords: [],
          nutrients: { calories: 25, protein: 3 },
        },
        {
          id: "2",
          name: "No weight",
          measure: "1 cup",
          weight: 0,
          nutrients: {},
        },
        { id: "3", measure: "1 cup", weight: 10, nutrients: {} },
      ],
    });

    expect(foods).toHaveLength(1);
    expect(foodLabel(foods[0])).toBe("Broccoli, raw - Chopped or diced");
    expect(foods[0].nutrients.calories).toBe(25);
    expect(foods[0].nutrients.totalFat).toBe(0);
  });

  it("finds foods by name, variant, and keyword", () => {
    const broccoli = makeFood({
      id: "1064",
      name: "Broccoli, raw",
      variant: "Chopped or diced",
    });
    const beans = makeFood({
      id: "1049",
      name: "Snap beans, cooked from raw",
      variant: "Green",
      keywords: ["green beans", "string beans"],
    });
    const cheese = makeFood({
      id: "54",
      name: "Cheddar cheese",
      keywords: ["cheese"],
    });
    const foods = [broccoli, beans, cheese];

    expect(searchFoods(foods, "broccoli")).toEqual([broccoli]);
    expect(searchFoods(foods, "green beans")).toEqual([beans]);
    expect(searchFoods(foods, "cheese")).toEqual([cheese]);
    expect(searchFoods(foods, "zucchini")).toEqual([]);
  });

  it("ranks a name match above a keyword-only match", () => {
    const cheddar = makeFood({ id: "54", name: "Cheddar cheese" });
    const mozzarella = makeFood({ id: "69", name: "Mozzarella cheese" });
    const pizza = makeFood({
      id: "851",
      name: "Pizza, cheese",
      keywords: ["cheddar"],
    });

    expect(searchFoods([pizza, mozzarella, cheddar], "cheddar")).toEqual([
      cheddar,
      pizza,
    ]);
  });

  it("multiplies quantities and divides a recipe into servings", () => {
    const nutrients = emptyNutrients();
    nutrients.calories = 100;
    nutrients.protein = 4;
    const food = makeFood({ nutrients });
    const result = calculateMeal([{ id: "line-1", food, quantity: 3 }], 2);

    expect(result.calories).toBe(150);
    expect(result.protein).toBe(6);
  });

  it("calculates FDA daily value percentages", () => {
    expect(dailyValuePercent("sodium", 1150)).toBe(50);
    expect(dailyValuePercent("protein", 20)).toBeNull();
  });

  it("calculates percentages from a selected nutrition profile", () => {
    expect(dailyValuePercent("protein", 23, { protein: 46 })).toBe(50);
  });

  it("formats daily target percentages", () => {
    expect(formatDailyValuePercent(50)).toBe("50%");
    expect(formatDailyValuePercent(0)).toBe("0%");
    expect(formatDailyValuePercent(null)).toBe("");
  });
});

describe("measures", () => {
  it("splits a measure into how many and of what", () => {
    expect(parseMeasure("1 cup")).toEqual({ count: 1, unit: "cup" });
    expect(parseMeasure("10 halves")).toEqual({ count: 10, unit: "halves" });
    expect(parseMeasure("1/2 breast")).toEqual({ count: 0.5, unit: "breast" });
    expect(parseMeasure("portion of 21-oz can")).toEqual({
      count: 1,
      unit: "portion of 21-oz can",
    });
  });

  it("names the unit to match the amount", () => {
    expect(measureUnit("1 cup", 0.25)).toBe("cups");
    expect(measureUnit("1 floweret", 35)).toBe("flowerets");
    expect(measureUnit("10 halves", 1)).toBe("half");
    expect(measureUnit("10 cherries", 1)).toBe("cherry");
    expect(measureUnit("4 crackers", 1)).toBe("cracker");
    expect(measureUnit("1 oz (24 nuts)", 3)).toBe("oz (24 nuts)");
    expect(measureUnit('1 bagel (3" dia)', 2)).toBe('bagels (3" dia)');
  });

  it("counts a meal line in the food's own unit", () => {
    const broccoli = makeFood({ measure: "1 cup" });
    const almonds = makeFood({ measure: "10 halves" });

    expect(measureAmount(broccoli, 0.25)).toBe(0.25);
    expect(measureAmount(almonds, 3.5)).toBe(35);
    expect(quantityFromAmount(almonds, 35)).toBe(3.5);
    expect(formatMeasure(broccoli, 0.25)).toBe("0.25 cups");
    expect(formatMeasure(almonds, 0.1)).toBe("1 half");
  });
});

describe("daily targets", () => {
  it("gives every nutrient on the label a documented source", () => {
    const documented = nutrientSources.map((source) => source.key);
    expect([...documented].sort()).toEqual([...nutrientKeys].sort());

    for (const source of nutrientSources) {
      expect(source.refs.length).toBeGreaterThan(0);
      for (const id of source.refs) expect(referenceById(id)).toBeDefined();
    }
  });

  it("sets a positive target for every nutrient in every profile", () => {
    for (const profile of nutritionProfiles)
      for (const key of nutrientKeys)
        expect(profile.targets[key], `${profile.id}.${key}`).toBeGreaterThan(0);
  });

  /*
   * Fat, saturated fat, and carbohydrate are percentages of the profile's own
   * calorie figure, so they cannot be checked against a published table - only
   * against the arithmetic that produced them. Everything else is copied from a
   * source and is covered by the value test below.
   */
  it("derives the energy-based targets from each profile's calories", () => {
    const fatShare: Record<string, number> = {
      "elementary-school": 0.3,
      "middle-school": 0.3,
      "high-school": 0.3,
      adult: 0.275,
    };

    for (const profile of nutritionProfiles) {
      const { calories } = profile.targets;
      expect(profile.targets.totalFat).toBe(
        Math.round((calories * fatShare[profile.id]) / 9),
      );
      expect(profile.targets.saturatedFat).toBe(
        Math.round((calories * 0.1) / 9),
      );
      expect(profile.targets.carbohydrate).toBe(
        Math.round((calories * 0.55) / 4 / 5) * 5,
      );
    }
  });

  it("matches the published figure for each cited nutrient", () => {
    const published: Record<string, Partial<Record<NutrientKey, number>>> = {
      // Highest requirement in the band, lowest limit in the band.
      "elementary-school": {
        calories: 1600,
        sodium: 1500,
        fiber: 31,
        protein: 34,
        calcium: 1300,
        iron: 10,
        potassium: 2500,
      },
      "middle-school": {
        calories: 2100,
        sodium: 1800,
        fiber: 31,
        protein: 34,
        calcium: 1300,
        iron: 8,
        potassium: 2500,
      },
      "high-school": {
        calories: 2400,
        sodium: 2300,
        fiber: 38,
        protein: 52,
        calcium: 1300,
        iron: 15,
        potassium: 3000,
      },
      adult: {
        calories: 2000,
        sodium: 2300,
        fiber: 38,
        protein: 56,
        calcium: 1000,
        iron: 18,
        potassium: 3400,
      },
    };

    for (const profile of nutritionProfiles)
      for (const [key, value] of Object.entries(published[profile.id]))
        expect(
          profile.targets[key as NutrientKey],
          `${profile.id}.${key}`,
        ).toBe(value);

    for (const profile of nutritionProfiles)
      expect(profile.targets.cholesterol).toBe(300);
  });
});
