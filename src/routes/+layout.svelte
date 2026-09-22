<script lang="ts">
  import type { LayoutData } from "./$types";

  export let data: LayoutData;

  /* Cloudflare Web Analytics counts visits without cookies or fingerprinting.
     The site token differs per deployment, so it comes from the
     CF_BEACON_TOKEN environment variable (set it in Vercel's project
     settings). Leave it unset and no beacon is loaded at all. */
  $: beaconToken = data.beaconToken;

  /* Written as raw markup because a <script> tag placed in the markup of a
     Svelte component is never executed by the browser. */
  $: beaconTag =
    `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" ` +
    `data-cf-beacon='${JSON.stringify({ token: beaconToken })}'><` +
    `/script>`;
</script>

<svelte:head>
  {#if beaconToken}
    {@html beaconTag}
  {/if}
</svelte:head>

<slot />
