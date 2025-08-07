import { writable } from "svelte/store";

// Example: global app state
export const appState = writable({
  user: null,
  loading: false,
  error: null,
});
