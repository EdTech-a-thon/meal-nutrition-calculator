import type { NutrientKey } from "$lib/nutrition";

/*
 * Every number in the four profiles, traced back to a published source.
 * The daily-targets page renders this file, so a citation cannot drift away
 * from the value it justifies: change a target, change its entry here.
 */

export type Reference = {
  id: string;
  short: string;
  title: string;
  url: string;
};

export const references: Reference[] = [
  {
    id: "dri-energy",
    short: "DRI calorie table",
    title:
      "Estimated Calorie Needs per Day, by Age, Sex, and Physical Activity Level (Dietary Guidelines, Appendix 2)",
    url: "https://odphp.health.gov/our-work/food-nutrition/2015-2020-dietary-guidelines/guidelines/appendix-2/",
  },
  {
    id: "dri-macro",
    short: "DRI macronutrients",
    title:
      "Dietary Reference Intakes: Total Water and Macronutrients (Food and Nutrition Board, National Academies)",
    url: "https://www.nationalacademies.org/read/25353/chapter/28",
  },
  {
    id: "dri-elements",
    short: "DRI elements",
    title:
      "Dietary Reference Intakes: Elements (Food and Nutrition Board, National Academies)",
    url: "https://www.nationalacademies.org/read/25353/chapter/28",
  },
  {
    id: "dri-sodium",
    short: "DRI sodium and potassium",
    title:
      "Dietary Reference Intakes for Sodium and Potassium (National Academies, 2019)",
    url: "https://www.nationalacademies.org/read/25353/chapter/28",
  },
  {
    id: "dga",
    short: "Dietary Guidelines",
    title: "Dietary Guidelines for Americans, 2020-2025",
    url: "https://www.dietaryguidelines.gov/",
  },
  {
    id: "fda-dv",
    short: "FDA Daily Values",
    title: "Daily Value on the Nutrition and Supplement Facts Labels (FDA)",
    url: "https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels",
  },
];

export type NutrientSource = {
  key: NutrientKey;
  label: string;
  unit: string;
  /** How the target was derived from the source, in a sentence. */
  basis: string;
  /** Anything a teacher would reasonably push back on. */
  caveat?: string;
  refs: string[];
};

export const nutrientSources: NutrientSource[] = [
  {
    key: "calories",
    label: "Calories",
    unit: "kcal",
    basis:
      "Estimated Energy Requirement for a moderately active child at the middle age of the band, averaged across boys and girls.",
    caveat:
      "The adult profile instead uses the FDA's 2,000-calorie reference day.",
    refs: ["dri-energy", "fda-dv"],
  },
  {
    key: "totalFat",
    label: "Total Fat",
    unit: "g",
    basis:
      "Middle of the acceptable range - 30% of calories for ages 4-18, 27.5% for adults - divided by 9 calories per gram.",
    refs: ["dri-macro"],
  },
  {
    key: "saturatedFat",
    label: "Saturated Fat",
    unit: "g",
    basis:
      "Under 10% of calories, the limit that applies from age 2 up, divided by 9 calories per gram.",
    refs: ["dga"],
  },
  {
    key: "cholesterol",
    label: "Cholesterol",
    unit: "mg",
    basis: "300 mg at every age, the long-standing Daily Value.",
    refs: ["fda-dv", "dri-macro"],
  },
  {
    key: "sodium",
    label: "Sodium",
    unit: "mg",
    basis:
      "Chronic Disease Risk Reduction limit: 1,500 mg for ages 4-8, 1,800 mg for 9-13, 2,300 mg from 14 up.",
    caveat:
      "Grades K-5 span the 1,500 and 1,800 mg limits. The lower limit is used in this instance.",
    refs: ["dri-sodium"],
  },
  {
    key: "carbohydrate",
    label: "Total Carbohydrate",
    unit: "g",
    basis:
      "Middle of the acceptable range, 55% of calories, divided by 4 calories per gram - the same basis behind the FDA's 275 g Daily Value.",
    refs: ["dri-macro", "fda-dv"],
  },
  {
    key: "fiber",
    label: "Dietary Fiber",
    unit: "g",
    basis:
      "Highest Adequate Intake in the band: 25 g for ages 4-8, 31 g for boys 9-13, 38 g for boys 14-18 and men 19-30.",
    refs: ["dri-macro", "fda-dv"],
  },
  {
    key: "protein",
    label: "Protein",
    unit: "g",
    basis:
      "Highest RDA in the band: 34 g for ages 9-13, 52 g for boys 14-18, 56 g for men 19-30.",
    refs: ["dri-macro"],
  },
  {
    key: "calcium",
    label: "Calcium",
    unit: "mg",
    basis:
      "Highest RDA in the band: 1,300 mg for ages 9-18, 1,000 mg for ages 4-8 and adults.",
    refs: ["dri-elements"],
  },
  {
    key: "iron",
    label: "Iron",
    unit: "mg",
    basis:
      "Highest RDA in the band: 10 mg for ages 4-8, 8 mg for 9-13, 15 mg for girls 14-18, 18 mg for women 19-50.",
    caveat:
      "Menstruating girls and women need roughly twice what boys and men the same age do.",
    refs: ["dri-elements"],
  },
  {
    key: "potassium",
    label: "Potassium",
    unit: "mg",
    basis:
      "Highest Adequate Intake in the band under the 2019 revision: 2,500 mg for boys 9-13, 3,000 mg for boys 14-18, 3,400 mg for men 19 and up.",
    refs: ["dri-sodium", "fda-dv"],
  },
];

export function referenceById(id: string): Reference | undefined {
  return references.find((reference) => reference.id === id);
}
