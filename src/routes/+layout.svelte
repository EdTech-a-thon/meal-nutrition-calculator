<script lang="ts">
  import { env } from "$env/dynamic/public";

  /* Cloudflare Web Analytics counts visits without cookies or fingerprinting.
     The site token is not a secret (it ships in the page), but it differs per
     deployment, so it comes from the PUBLIC_CF_BEACON_TOKEN environment
     variable. Set it in Vercel's project settings; leave it unset locally and
     no beacon is loaded at all. */
  const beaconToken = env.PUBLIC_CF_BEACON_TOKEN ?? "";

  /* Written as raw markup because a <script> tag placed in the markup of a
     Svelte component is never executed by the browser. */
  const beaconTag =
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
