<script lang="ts">
  import { nutritionProfiles } from "$lib/nutrition-profiles";
  import {
    nutrientSources,
    referenceById,
  } from "$lib/nutrition-profiles/sources";
  import { resolve } from "$app/paths";
</script>

<svelte:head>
  <title>Where the daily targets come from - Label Your Lunch</title>
  <meta
    name="description"
    content="Every daily target in Label Your Lunch, with the published source it came from."
  />
</svelte:head>

<header class="site-header">
  <a class="brand" href={resolve("/")} aria-label="Label Your Lunch">
    <span class="brand-mark" aria-hidden="true">LYL</span>
    <span>Label Your Lunch</span>
  </a>
  <a class="back" href={resolve("/")}>Back to the calculator</a>
</header>

<main>
  <h1>Where the daily targets come from</h1>
  <p class="lede">
    The label compares a serving against a whole day, and the day depends on who
    is eating. Requirements take the highest figure in the age band, so a meal
    works for everyone in the room; limits take the lowest; fat and carbohydrate
    are published as ranges, so they take the middle.
  </p>

  <table>
    <thead>
      <tr>
        <th scope="col">Nutrient</th>
        {#each nutritionProfiles as profile (profile.id)}
          <th scope="col">{profile.label}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each nutrientSources as source (source.key)}
        <tr>
          <th scope="row">{source.label}</th>
          {#each nutritionProfiles as profile (profile.id)}
            <td>
              {profile.targets[source.key].toLocaleString("en-US")}<span
                class="unit">{source.unit}</span
              >
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>

  <dl>
    {#each nutrientSources as source (source.key)}
      <dt>{source.label}</dt>
      <dd>
        {source.basis}
        {#if source.caveat}<span class="caveat">{source.caveat}</span>{/if}
        <span class="cites">
          {#each source.refs as refId, index (refId)}
            {@const reference = referenceById(refId)}
            {#if reference}
              {index > 0 ? " · " : ""}<a
                href={reference.url}
                title={reference.title}
                target="_blank"
                rel="external noreferrer">{reference.short}</a
              >
            {/if}
          {/each}
        </span>
      </dd>
    {/each}
  </dl>

  <p class="fine">
    These are reference values for healthy populations, published so meals can
    be planned and labels compared. They are not a prescription for any one
    student, and a student with a medical diet should follow it over anything
    here.
  </p>
</main>

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
    font-weight: 700;
    text-decoration: none;
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

  .back {
    color: #6f766f;
    font-size: 13px;
  }

  main {
    max-width: 760px;
    margin: 0 auto;
    padding: 46px clamp(22px, 5vw, 40px) 70px;
  }

  h1 {
    margin: 0 0 14px;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(30px, 5vw, 40px);
    font-weight: 400;
    letter-spacing: -0.03em;
    line-height: 1.1;
  }

  .lede {
    margin: 0 0 36px;
    color: #59635e;
    font-size: 16px;
    line-height: 1.6;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  th,
  td {
    padding: 8px 10px;
    border-bottom: 1px solid #ddd6c6;
    text-align: right;
    white-space: nowrap;
  }

  thead th {
    border-bottom: 1px solid #17231e;
    color: #6f766f;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  thead th:first-child,
  tbody th {
    text-align: left;
  }

  .unit {
    margin-left: 2px;
    color: #8b8f88;
    font-size: 11px;
  }

  dl {
    margin: 40px 0 0;
  }

  dt {
    margin-top: 22px;
    font-weight: 700;
    font-size: 15px;
  }

  dd {
    margin: 4px 0 0;
    color: #4a534e;
    font-size: 14px;
    line-height: 1.6;
  }

  .caveat {
    color: #6f766f;
  }

  .cites {
    display: block;
    margin-top: 3px;
    font-size: 13px;
  }

  a {
    color: #b93c1c;
  }

  .fine {
    margin: 44px 0 0;
    padding-top: 18px;
    border-top: 1px solid #ddd6c6;
    color: #6f766f;
    font-size: 13px;
    line-height: 1.6;
  }

  /* The table is the one thing that cannot reflow, so let it scroll alone. */
  @media (max-width: 620px) {
    table {
      display: block;
      overflow-x: auto;
    }
  }
</style>
