<script lang="ts">
  import { resolve } from "$app/paths";

  /* The home page shows the brand as plain text; every other page turns it into
     a way back. */
  export let linkHome = true;
  export let tagline = "";
  export let backLabel = "";
</script>

<header class="site-header">
  {#if linkHome}
    <a class="brand" href={resolve("/")} aria-label="Label Your Lunch">
      <span class="brand-mark" aria-hidden="true">LYL</span>
      <span>Label Your Lunch</span>
    </a>
  {:else}
    <div class="brand" aria-label="Label Your Lunch">
      <span class="brand-mark" aria-hidden="true">LYL</span>
      <span>Label Your Lunch</span>
    </div>
  {/if}

  {#if tagline}
    <p>{tagline}</p>
  {:else if backLabel}
    <a class="back" href={resolve("/")}>{backLabel}</a>
  {/if}
</header>

<style>
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

  .back {
    color: #6f766f;
    font-size: 13px;
  }

  @media (max-width: 600px) {
    .site-header {
      height: 64px;
    }

    .site-header p {
      display: none;
    }
  }

  @media print {
    .site-header {
      display: none;
    }
  }
</style>
