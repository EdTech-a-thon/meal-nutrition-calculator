import elementarySchool from "./elementary-school.json";
import middleSchool from "./middle-school.json";
import highSchool from "./high-school.json";
import adult from "./adult.json";
import type { NutritionProfile } from "$lib/nutrition";

/*
 * Targets are grouped by grade band, the same way USDA groups its school meal
 * pattern standards (K-5, 6-8, 9-12). One meal feeds a whole class, so a target
 * aimed at a single body type would fit almost nobody in the room.
 *
 * Three rules decide which published number a band gets, depending on what kind
 * of number it is:
 *
 *   a requirement  take the highest in the band (protein, fiber, calcium, iron,
 *                  potassium), so a meal that hits the target works for every
 *                  student in the room, including the one who needs most
 *   a limit        take the lowest in the band (sodium, saturated fat), so the
 *                  target protects the youngest student in the room
 *   a range        take the middle (total fat, carbohydrate), since the source
 *                  gives a band of acceptable intakes rather than one figure
 *
 * Calories are neither: they are the Estimated Energy Requirement for a
 * moderately active child at the middle age of the band, averaged across boys
 * and girls, because eating too much is as much a miss as eating too little.
 *
 * `sources.ts` carries the citation for each of these, and the /daily-targets
 * page renders it. Change a target there as well as here.
 */
export const nutritionProfiles = [
  elementarySchool,
  middleSchool,
  highSchool,
  adult,
] as NutritionProfile[];
