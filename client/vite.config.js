import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    proxy: {
      "/health": "http://localhost:3000",
      "/prompt": "http://localhost:3000",
      // Add more API routes here as needed
    },
  },
});
