import { describe, expect, it } from "vitest";
import {
  calculateMeal,
  dailyValuePercent,
  emptyNutrients,
  parseFoods,
  parseNumber,
  type Food,
} from "./nutrition";

describe("nutrition data", () => {
  it("treats trace, unavailable, and blank values as zero", () => {
    expect(parseNumber("Tr")).toBe(0);
    expect(parseNumber("NA")).toBe(0);
    expect(parseNumber("")).toBe(0);
  });

  it("parses quoted commas and skips incomplete rows", () => {
    const csv =
      "food_no,category,food,measure,weight_g,calories,protein_g,total_fat_g,sat_fat_g,cholesterol_mg,carbohydrate_g,fiber_g,calcium_mg,iron_mg,potassium_mg,sodium_mg\n" +
      '1,Fruit,"Apple, raw",1 apple,100,50,1,Tr,Tr,0,12,2,5,0.2,100,1\n' +
      "2,,,,,,,,,,,,,,,\n";
    const foods = parseFoods(csv);

    expect(foods).toHaveLength(1);
    expect(foods[0].name).toBe("Fruit - Apple, raw");
    expect(foods[0].nutrients.totalFat).toBe(0);
  });

  it("multiplies quantities and divides a recipe into servings", () => {
    const nutrients = emptyNutrients();
    nutrients.calories = 100;
    nutrients.protein = 4;
    const food: Food = {
      id: "1",
      name: "Test food",
      category: "Test",
      detail: "",
      measure: "1 cup",
      weight: 100,
      nutrients,
    };
    const result = calculateMeal([{ id: "line-1", food, quantity: 3 }], 2);

    expect(result.calories).toBe(150);
    expect(result.protein).toBe(6);
  });

  it("calculates FDA daily value percentages", () => {
    expect(dailyValuePercent("sodium", 1150)).toBe(50);
    expect(dailyValuePercent("protein", 20)).toBeNull();
  });
});
