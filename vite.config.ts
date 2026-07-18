import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    allowedHosts: [".exe.xyz", ".edtechathon.com"],
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
