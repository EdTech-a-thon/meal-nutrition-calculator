<script lang="ts">
  import { onMount } from 'svelte';
  import {
    calculateMeal,
    dailyValuePercent,
    formatAmount,
    parseFoods,
    type Food,
    type MealItem,
    type NutrientKey
  } from '$lib/nutrition';
  import { nutritionProfiles } from '$lib/nutrition-profiles';

  let foods: Food[] = [];
  let meal: MealItem[] = [];
  let query = '';
  let mealName = 'My meal';
  let servings = 1;
  let loading = true;
  let loadError = '';
  let showResults = false;
  let selectedProfileId = nutritionProfiles[0].id;

  const nutrientRows: { key: NutrientKey; label: string; unit: string; indent?: boolean }[] = [
    { key: 'totalFat', label: 'Total Fat', unit: 'g' },
    { key: 'saturatedFat', label: 'Saturated Fat', unit: 'g', indent: true },
    { key: 'cholesterol', label: 'Cholesterol', unit: 'mg' },
    { key: 'sodium', label: 'Sodium', unit: 'mg' },
    { key: 'carbohydrate', label: 'Total Carbohydrate', unit: 'g' },
    { key: 'fiber', label: 'Dietary Fiber', unit: 'g', indent: true },
    { key: 'protein', label: 'Protein', unit: 'g' }
  ];

  const vitaminRows: { key: NutrientKey; label: string; unit: string }[] = [
    { key: 'calcium', label: 'Calcium', unit: 'mg' },
    { key: 'iron', label: 'Iron', unit: 'mg' },
    { key: 'potassium', label: 'Potassium', unit: 'mg' }
  ];

  $: normalizedQuery = query.trim().toLowerCase();
  $: results = normalizedQuery
    ? foods
        .filter((food) => food.name.toLowerCase().includes(normalizedQuery))
        .sort((a, b) => {
          const aStarts = a.name.toLowerCase().startsWith(normalizedQuery) ? 0 : 1;
          const bStarts = b.name.toLowerCase().startsWith(normalizedQuery) ? 0 : 1;
          return aStarts - bStarts || a.name.localeCompare(b.name);
        })
        .slice(0, 12)
    : [];
  $: totals = calculateMeal(meal, servings);
  $: totalWeight = meal.reduce((sum, item) => sum + item.food.weight * item.quantity, 0);
  $: servingWeight = servings > 0 ? totalWeight / servings : totalWeight;
  $: selectedProfile =
    nutritionProfiles.find((profile) => profile.id === selectedProfileId) ?? nutritionProfiles[0];

  onMount(async () => {
    try {
      const response = await fetch('/data/nutritive_value_of_foods.csv');
      if (!response.ok) throw new Error('Food data could not be loaded.');
      foods = parseFoods(await response.text());
    } catch (error) {
      loadError = error instanceof Error ? error.message : 'Food data could not be loaded.';
    } finally {
      loading = false;
    }
  });

  function addFood(food: Food) {
    const existing = meal.find((item) => item.food.id === food.id);
    if (existing) {
      meal = meal.map((item) =>
        item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      meal = [...meal, { id: `${food.id}-${Date.now()}`, food, quantity: 1 }];
    }
    query = '';
    showResults = false;
  }

  function updateQuantity(id: string, value: number) {
    meal = meal.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(0.1, value || 0.1) } : item
    );
  }

  function removeFood(id: string) {
    meal = meal.filter((item) => item.id !== id);
  }

  function percent(key: NutrientKey) {
    return dailyValuePercent(key, totals[key], selectedProfile.targets);
  }
</script>

<svelte:head>
  <title>Meal Label Lab</title>
  <meta
    name="description"
    content="Build a meal from USDA food data and generate an estimated Nutrition Facts label."
  />
</svelte:head>

<header class="site-header">
  <div class="brand" aria-label="Meal Label Lab">
    <span class="brand-mark" aria-hidden="true">ML</span>
    <span>Meal Label Lab</span>
  </div>
  <p>Build it. Measure it. Read the label.</p>
</header>

<main>
  <section class="intro">
    <div>
      <span class="eyebrow">A nutrition classroom tool</span>
      <h1>What’s really in<br />your meal?</h1>
    </div>
    <p>
      Search USDA food data, combine ingredients, and watch a Nutrition Facts label take
      shape. Try changing portions to see what changes.
    </p>
  </section>

  <div class="workspace">
    <section class="builder" aria-labelledby="builder-title">
      <div class="section-heading">
        <span>01</span>
        <div>
          <h2 id="builder-title">Build your meal</h2>
          <p>Start with a name, then add foods and adjust their servings.</p>
        </div>
      </div>

      <div class="name-row">
        <label>
          Meal name
          <input bind:value={mealName} maxlength="60" placeholder="e.g. Power breakfast" />
        </label>
        <label>
          Recipe servings
          <input bind:value={servings} type="number" min="1" step="1" />
        </label>
        <label>
          Daily target for
          <select bind:value={selectedProfileId}>
            {#each nutritionProfiles as profile (profile.id)}
              <option value={profile.id}>{profile.label}</option>
            {/each}
          </select>
        </label>
      </div>

      <div class="search-wrap">
        <label for="food-search">Find a food</label>
        <div class="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            id="food-search"
            bind:value={query}
            onfocus={() => (showResults = true)}
            oninput={() => (showResults = true)}
            placeholder={loading ? 'Loading foods...' : 'Try “banana,” “rice,” or “chicken”'}
            autocomplete="off"
            disabled={loading || !!loadError}
          />
        </div>

        {#if loadError}
          <p class="error">{loadError}</p>
        {:else if showResults && normalizedQuery}
          <div class="results" aria-live="polite">
            {#if results.length}
              {#each results as food (food.id)}
                <button type="button" onclick={() => addFood(food)}>
                  <span>
                    <strong>{food.name}</strong>
                    <small>{food.measure} · {food.weight} g</small>
                  </span>
                  <span class="result-calories">{formatAmount(food.nutrients.calories, 0)} cal</span>
                  <span class="add" aria-hidden="true">+</span>
                </button>
              {/each}
            {:else}
              <p class="no-results">No matching foods. Try a shorter or different search.</p>
            {/if}
          </div>
        {/if}
      </div>

      <div class="meal-list">
        <div class="list-title">
          <h3>Your ingredients</h3>
          <span>{meal.length} {meal.length === 1 ? 'food' : 'foods'}</span>
        </div>

        {#if meal.length}
          {#each meal as item (item.id)}
            <article class="meal-item">
              <div class="food-icon" aria-hidden="true">{item.food.name.charAt(0)}</div>
              <div class="food-info">
                <strong>{item.food.name}</strong>
                <span>{item.food.measure} ({item.food.weight} g)</span>
              </div>
              <label class="quantity">
                <span>Servings</span>
                <input
                  value={item.quantity}
                  onchange={(event) =>
                    updateQuantity(item.id, Number((event.currentTarget as HTMLInputElement).value))}
                  type="number"
                  min="0.1"
                  step="0.25"
                  aria-label={`Servings of ${item.food.name}`}
                />
              </label>
              <button
                class="remove"
                type="button"
                onclick={() => removeFood(item.id)}
                aria-label={`Remove ${item.food.name}`}>×</button
              >
            </article>
          {/each}
        {:else}
          <div class="empty-meal">
            <span aria-hidden="true">+</span>
            <strong>Your plate is empty</strong>
            <p>Search above and add your first food.</p>
          </div>
        {/if}
      </div>
    </section>

    <aside class="preview" aria-labelledby="label-title">
      <div class="preview-heading">
        <div>
          <span>02</span>
          <h2 id="label-title">Your label</h2>
        </div>
        <button type="button" onclick={() => window.print()} disabled={!meal.length}>Print label</button>
      </div>

      <div class="print-meal-name">{mealName || 'Untitled meal'}</div>
      <div class:label-empty={!meal.length} class="nutrition-label">
        <div class="label-title">Nutrition Facts</div>
        <div class="serving-copy">{servings || 1} servings per recipe</div>
        <div class="serving-size">
          <strong>Serving size</strong>
          <strong>{servingWeight ? `${Math.round(servingWeight)} g` : '—'}</strong>
        </div>
        <div class="rule-heavy"></div>
        <div class="amount">Amount per serving</div>
        <div class="calories">
          <strong>Calories</strong>
          <strong>{Math.round(totals.calories)}</strong>
        </div>
        <div class="rule-medium"></div>
        <div class="target-profile">For {selectedProfile.label}</div>
        <div class="dv-heading">% of daily target*</div>

        {#each nutrientRows as row (row.key)}
          <div class:indent={row.indent} class:protein-row={row.key === 'protein'} class="nutrient-row">
            <span>
              <strong class:normal={row.indent || row.key === 'protein'}>{row.label}</strong>
              {formatAmount(totals[row.key])}{row.unit}
            </span>
            {#if percent(row.key) !== null}
              <strong>{percent(row.key)}%</strong>
            {/if}
          </div>
        {/each}

        <div class="rule-heavy small"></div>
        {#each vitaminRows as row (row.key)}
          <div class="nutrient-row vitamin-row">
            <span>{row.label} {formatAmount(totals[row.key])}{row.unit}</span>
            <span>{percent(row.key)}%</span>
          </div>
        {/each}
        <div class="rule-medium foot-rule"></div>
        <p class="daily-note">
          * Shows how much one serving contributes to the selected example target.
          {selectedProfile.description}. Needs vary by growth, activity, and health.
        </p>
      </div>

      <div class="data-note">
        <strong>About this estimate</strong>
        <p>
          Values come from USDA reference data. Added sugars, trans fat, and vitamin D
          are not available in this dataset, so they are not shown.
        </p>
      </div>
    </aside>
  </div>
</main>

<footer>
  <span>Made for learning, not medical advice.</span>
  <span>USDA nutritive value reference data</span>
</footer>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    background: #f3efe4;
    color: #17231e;
    font-family: Arial, Helvetica, sans-serif;
  }

  :global(button),
  :global(input),
  :global(select) {
    font: inherit;
  }

  .site-header {
    height: 74px;
    padding: 0 clamp(22px, 5vw, 78px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #c9c2b2;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 11px;
    color: inherit;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-decoration: none;
    text-transform: uppercase;
  }

  .brand-mark {
    display: grid;
    width: 34px;
    height: 34px;
    place-items: center;
    border-radius: 50%;
    background: #f16038;
    color: white;
    font-size: 12px;
    letter-spacing: -0.03em;
  }

  .site-header p {
    margin: 0;
    color: #6f766f;
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 58px clamp(22px, 5vw, 78px) 80px;
  }

  .intro {
    display: grid;
    grid-template-columns: minmax(420px, 1.3fr) minmax(260px, 0.7fr);
    gap: 60px;
    align-items: end;
    margin-bottom: 58px;
  }

  .eyebrow {
    display: block;
    margin-bottom: 14px;
    color: #d64d28;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(58px, 7vw, 104px);
    font-weight: 400;
    letter-spacing: -0.06em;
    line-height: 0.86;
  }

  .intro > p {
    max-width: 470px;
    margin: 0 0 4px;
    color: #59635e;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 19px;
    line-height: 1.55;
  }

  .workspace {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(360px, 0.65fr);
    border: 1px solid #bdb5a5;
    background: #faf8f1;
    box-shadow: 12px 12px 0 #d9d2c2;
  }

  .builder {
    min-width: 0;
    padding: clamp(26px, 4vw, 52px);
    border-right: 1px solid #bdb5a5;
  }

  .section-heading,
  .preview-heading > div {
    display: flex;
    gap: 18px;
    align-items: flex-start;
  }

  .section-heading > span,
  .preview-heading > div > span {
    padding-top: 5px;
    color: #d64d28;
    font-size: 12px;
    font-weight: 800;
  }

  h2 {
    margin: 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 30px;
    font-weight: 400;
    letter-spacing: -0.025em;
  }

  .section-heading p {
    margin: 7px 0 0;
    color: #68706b;
    font-size: 14px;
  }

  .name-row {
    display: grid;
    grid-template-columns: minmax(180px, 1fr) 140px minmax(190px, 0.7fr);
    gap: 16px;
    margin-top: 36px;
  }

  label,
  .search-wrap > label {
    display: grid;
    gap: 8px;
    color: #3e4943;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }

  input,
  select {
    width: 100%;
    height: 48px;
    border: 1px solid #aaa495;
    border-radius: 0;
    outline: none;
    background: #fffefa;
    color: #17231e;
    padding: 0 14px;
    text-transform: none;
  }

  input:focus {
    border-color: #163e2e;
    box-shadow: 0 0 0 2px #163e2e22;
  }

  select:focus {
    border-color: #163e2e;
    box-shadow: 0 0 0 2px #163e2e22;
  }

  .search-wrap {
    position: relative;
    margin-top: 28px;
  }

  .search-box {
    position: relative;
  }

  .search-box > span {
    position: absolute;
    top: 9px;
    left: 14px;
    z-index: 1;
    font-family: Georgia, serif;
    font-size: 29px;
    transform: rotate(-18deg);
  }

  .search-box input {
    height: 58px;
    padding-left: 50px;
    border: 2px solid #173b2d;
    font-size: 16px;
  }

  .results {
    position: absolute;
    z-index: 10;
    right: 0;
    left: 0;
    max-height: 430px;
    overflow-y: auto;
    border: 1px solid #173b2d;
    border-top: 0;
    background: #fffefa;
    box-shadow: 5px 7px 0 #173b2d22;
  }

  .results button {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr auto 30px;
    gap: 14px;
    align-items: center;
    padding: 14px 16px;
    border: 0;
    border-bottom: 1px solid #ded8ca;
    background: transparent;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .results button:hover,
  .results button:focus-visible {
    background: #e9f0e8;
  }

  .results strong,
  .results small {
    display: block;
  }

  .results strong {
    margin-bottom: 4px;
    font-size: 14px;
  }

  .results small {
    color: #69736e;
  }

  .result-calories {
    color: #59635e;
    font-size: 12px;
    white-space: nowrap;
  }

  .add {
    display: grid;
    width: 28px;
    height: 28px;
    place-items: center;
    border-radius: 50%;
    background: #f16038;
    color: white;
    font-size: 20px;
  }

  .no-results,
  .error {
    margin: 0;
    padding: 18px;
    color: #6d5047;
    font-size: 14px;
  }

  .meal-list {
    margin-top: 42px;
  }

  .list-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    border-bottom: 2px solid #173b2d;
  }

  .list-title h3 {
    margin: 0;
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .list-title span {
    color: #6a736e;
    font-size: 12px;
  }

  .meal-item {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr) 90px 30px;
    gap: 14px;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #d5cfc1;
  }

  .food-icon {
    display: grid;
    width: 40px;
    height: 40px;
    place-items: center;
    border-radius: 50%;
    background: #dfe7d8;
    color: #315b41;
    font-family: Georgia, serif;
    font-size: 20px;
  }

  .food-info {
    min-width: 0;
  }

  .food-info strong,
  .food-info span {
    display: block;
  }

  .food-info strong {
    overflow: hidden;
    font-size: 14px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .food-info span {
    margin-top: 4px;
    color: #747b77;
    font-size: 12px;
  }

  .quantity {
    gap: 4px;
  }

  .quantity span {
    font-size: 9px;
  }

  .quantity input {
    height: 36px;
    padding: 0 8px;
  }

  .remove {
    border: 0;
    background: transparent;
    color: #896d63;
    font-size: 25px;
    cursor: pointer;
  }

  .empty-meal {
    display: grid;
    min-height: 190px;
    place-content: center;
    justify-items: center;
    color: #758079;
    text-align: center;
  }

  .empty-meal > span {
    display: grid;
    width: 40px;
    height: 40px;
    margin-bottom: 10px;
    place-items: center;
    border: 1px dashed #89928c;
    border-radius: 50%;
    font-size: 22px;
  }

  .empty-meal p {
    margin: 5px 0 0;
    font-size: 13px;
  }

  .preview {
    padding: clamp(26px, 3.5vw, 46px);
    background: #dfe8df;
  }

  .preview-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
  }

  .preview-heading button {
    padding: 9px 12px;
    border: 1px solid #305543;
    background: transparent;
    color: #254735;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
  }

  .preview-heading button:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  .print-meal-name {
    margin-bottom: 10px;
    overflow: hidden;
    color: #294838;
    font-family: Georgia, serif;
    font-size: 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .nutrition-label {
    max-width: 440px;
    margin: 0 auto;
    padding: 8px 9px 10px;
    border: 2px solid #111;
    background: white;
    color: #050505;
    font-family: Arial, Helvetica, sans-serif;
    transition: opacity 160ms ease;
  }

  .nutrition-label.label-empty {
    opacity: 0.55;
  }

  .label-title {
    padding-bottom: 2px;
    border-bottom: 1px solid #111;
    font-size: clamp(35px, 4vw, 48px);
    font-weight: 900;
    letter-spacing: -0.07em;
    line-height: 0.94;
  }

  .serving-copy {
    padding-top: 3px;
    font-size: 12px;
  }

  .serving-size,
  .calories,
  .nutrient-row {
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }

  .serving-size {
    font-size: 14px;
  }

  .rule-heavy {
    height: 10px;
    margin-top: 4px;
    background: #111;
  }

  .rule-heavy.small {
    height: 6px;
  }

  .rule-medium {
    height: 5px;
    background: #111;
  }

  .amount {
    padding-top: 3px;
    font-size: 11px;
    font-weight: 700;
  }

  .calories {
    align-items: baseline;
    line-height: 1;
  }

  .calories strong:first-child {
    font-size: 29px;
    letter-spacing: -0.04em;
  }

  .calories strong:last-child {
    font-size: 39px;
    letter-spacing: -0.04em;
  }

  .dv-heading {
    padding: 3px 0 2px;
    border-bottom: 1px solid #111;
    font-size: 11px;
    font-weight: 800;
    text-align: right;
  }

  .target-profile {
    padding: 5px 0 4px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .nutrient-row {
    min-height: 25px;
    align-items: center;
    padding: 3px 0;
    border-bottom: 1px solid #777;
    font-size: 13px;
  }

  .nutrient-row.indent > span {
    padding-left: 16px;
  }

  .nutrient-row .normal {
    font-weight: 400;
  }

  .protein-row {
    border-bottom: 0;
  }

  .vitamin-row {
    font-size: 12px;
  }

  .foot-rule {
    margin-top: 4px;
  }

  .daily-note {
    margin: 5px 0 0;
    padding-left: 9px;
    font-size: 9px;
    line-height: 1.25;
    text-indent: -6px;
  }

  .data-note {
    max-width: 440px;
    margin: 20px auto 0;
    padding-top: 16px;
    border-top: 1px solid #95a598;
    color: #43584d;
    font-size: 12px;
    line-height: 1.5;
  }

  .data-note strong {
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .data-note p {
    margin: 5px 0 0;
  }

  footer {
    display: flex;
    justify-content: space-between;
    padding: 22px clamp(22px, 5vw, 78px);
    border-top: 1px solid #c9c2b2;
    color: #737871;
    font-size: 11px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  @media (max-width: 950px) {
    .intro {
      grid-template-columns: 1fr;
      gap: 28px;
    }

    .workspace {
      grid-template-columns: 1fr;
    }

    .builder {
      border-right: 0;
      border-bottom: 1px solid #bdb5a5;
    }

    .nutrition-label {
      max-width: 480px;
    }
  }

  @media (max-width: 600px) {
    .site-header {
      height: 64px;
    }

    .site-header p {
      display: none;
    }

    main {
      padding-top: 40px;
    }

    h1 {
      font-size: clamp(51px, 17vw, 76px);
    }

    .intro {
      margin-bottom: 38px;
    }

    .workspace {
      box-shadow: 6px 7px 0 #d9d2c2;
    }

    .name-row {
      grid-template-columns: 1fr;
    }

    .meal-item {
      grid-template-columns: 36px minmax(0, 1fr) 74px 24px;
      gap: 9px;
    }

    .food-icon {
      width: 36px;
      height: 36px;
    }

    .preview-heading {
      align-items: flex-start;
    }

    footer {
      gap: 16px;
      flex-direction: column;
    }
  }

  @media print {
    :global(body) {
      background: white;
    }

    .site-header,
    .intro,
    .builder,
    .preview-heading,
    .data-note,
    footer {
      display: none !important;
    }

    main {
      max-width: none;
      padding: 0;
    }

    .workspace {
      display: block;
      border: 0;
      box-shadow: none;
    }

    .preview {
      padding: 0;
      background: white;
    }

    .print-meal-name {
      display: block;
      max-width: 440px;
      margin: 0 auto 12px;
      color: black;
      font-size: 24px;
    }

    .nutrition-label {
      max-width: 440px;
      opacity: 1 !important;
    }
  }
</style>
