import { env } from "$env/dynamic/private";

/**
 * Reads the Cloudflare Web Analytics site token at build time.
 *
 * SvelteKit only hands a variable straight to the browser when its name starts
 * with PUBLIC_, and the token is named plain CF_BEACON_TOKEN, so it is read
 * here on the server instead and passed down to the layout. Every page in this
 * app is prerendered, so "the server" means the build: the token is baked into
 * the HTML and no server runs in production.
 */
export const load = () => ({
  beaconToken: env.CF_BEACON_TOKEN ?? "",
});
