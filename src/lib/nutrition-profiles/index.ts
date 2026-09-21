import elementarySchool from "./elementary-school.json";
import middleSchool from "./middle-school.json";
import highSchool from "./high-school.json";
import adult from "./adult.json";
import type { NutritionProfile } from "$lib/nutrition";

/*
 * Targets are grouped by grade band, the same way USDA groups its school meal
 * pattern standards (K-5, 6-8, 9-12). One meal feeds a whole class, so a target
 * aimed at a single body type would fit almost nobody in the room. Where boys
 * and girls in a band need different amounts (protein, iron, potassium), each
 * profile uses the larger number: a meal that meets the highest need in the
 * band works for everyone in it.
 *
 * Within a profile:
 *   calories      DRI estimated energy requirement, moderately active,
 *                 at the middle of the age band
 *   total fat     30% of calories / 9 (middle of the recommended range)
 *   saturated fat 10% of calories / 9 (Dietary Guidelines upper limit)
 *   fiber         14 g per 1,000 calories
 *   carbohydrate  130 g (the RDA, which is the same at every age)
 *   protein,
 *   calcium,
 *   iron,
 *   potassium     DRI for the age band
 *   sodium        CDRR limit for the age band
 *   cholesterol   300 mg, the long-standing Nutrition Facts label figure;
 *                 there is no DRI for cholesterol
 */
export const nutritionProfiles = [
  elementarySchool,
  middleSchool,
  highSchool,
  adult,
] as NutritionProfile[];
