/**
 * Keeps the meal a student is building in the browser's local storage, so a
 * refresh (or a closed tab) doesn't lose their work. Only the food's id and
 * how much of it is stored; the full nutrition numbers are looked up again
 * from the food dataset when the page loads.
 */
import type { Food, MealItem } from "$lib/nutrition";

const storageKey = "label-your-lunch:meal";

export type SavedMeal = {
  mealName: string;
  servings: number;
  profileId: string;
  items: { foodId: string; quantity: number }[];
};

/** Reads the saved meal, or null if there isn't one (or it can't be read). */
export function loadSavedMeal(): SavedMeal | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<SavedMeal>;
    if (!Array.isArray(parsed.items)) return null;

    return {
      mealName: typeof parsed.mealName === "string" ? parsed.mealName : "",
      servings: Number(parsed.servings) > 0 ? Number(parsed.servings) : 1,
      profileId: typeof parsed.profileId === "string" ? parsed.profileId : "",
      items: parsed.items
        .filter((item) => item && typeof item.foodId === "string")
        .map((item) => ({
          foodId: item.foodId,
          quantity: Number(item.quantity) || 0,
        })),
    };
  } catch {
    /* A full or blocked storage area shouldn't break the page. */
    return null;
  }
}

export function saveMeal(meal: SavedMeal): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(meal));
  } catch {
    /* Saving is a convenience; carry on without it. */
  }
}

export function clearSavedMeal(): void {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    /* Nothing to do if storage is unavailable. */
  }
}

/** Turns saved food ids back into meal items, dropping foods we no longer have. */
export function restoreMealItems(saved: SavedMeal, foods: Food[]): MealItem[] {
  const byId = new Map(foods.map((food) => [food.id, food]));

  return saved.items.flatMap((item, index) => {
    const food = byId.get(item.foodId);
    if (!food) return [];
    return [
      { id: `${food.id}-restored-${index}`, food, quantity: item.quantity },
    ];
  });
}
