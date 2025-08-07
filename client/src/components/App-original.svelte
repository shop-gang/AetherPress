<script>
  // Basic App component for AetherPress Svelte frontend
  import { appState } from '../stores/appState.js';

  // Fetch backend health status on mount
  let health = null;
  let apiError = null;
  let prompt = '';
  let aiResult = '';
  let loadingAI = false;

  async function checkHealth() {
    appState.update(state => ({ ...state, loading: true, error: null }));
    try {
      const res = await fetch('/health'); // Use relative path for Vite proxy
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      health = data.status;
      appState.update(state => ({ ...state, loading: false }));
    } catch (err) {
      apiError = err.message;
      appState.update(state => ({ ...state, loading: false, error: err.message }));
    }
  }

  async function submitPrompt() {
    aiResult = '';
    apiError = null;
    loadingAI = true;
    try {
      const res = await fetch('/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (!res.ok) throw new Error(`AI error: ${res.status}`);
      const data = await res.json();
      aiResult = data.result || JSON.stringify(data);
    } catch (err) {
      apiError = err.message;
    } finally {
      loadingAI = false;
    }
  }

  checkHealth();
</script>

<main>
  <h1>AetherPress Svelte Frontend</h1>
  <p>Welcome! This is the starting point for your Svelte SPA.</p>
  <p>Current user: {$appState.user ? $appState.user : 'None'}</p>
  <p>Backend health: {health ? health : 'Checking...'}</p>

  <section style="margin-top:2rem; width:100%; max-width:500px;">
    <h2>AI-Powered eBook Creation</h2>
    <form on:submit|preventDefault={submitPrompt}>
      <label for="prompt">Enter your creative prompt:</label>
      <textarea id="prompt" bind:value={prompt} rows="4" style="width:100%;margin-top:0.5rem;"></textarea>
      <button type="submit" disabled={loadingAI || !prompt.trim()} style="margin-top:1rem;">Generate</button>
    </form>
    {#if loadingAI}
      <p>Generating with AI...</p>
    {/if}
    {#if aiResult}
      <div style="margin-top:1.5rem; padding:1rem; border:1px solid #ccc; border-radius:8px; background:#fafafa;">
        <h3>AI Result</h3>
        <pre style="white-space:pre-wrap;">{aiResult}</pre>
      </div>
    {/if}
    {#if apiError}
      <p style="color: red">API Error: {apiError}</p>
    {/if}
  </section>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 4rem;
    font-family: system-ui, sans-serif;
  }
  h1 {
    color: #ff3e00;
    margin-bottom: 1rem;
  }
  p {
    color: #444;
  }
  section {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    padding: 2rem;
  }
  textarea {
    font-size: 1rem;
    font-family: inherit;
    border-radius: 6px;
    border: 1px solid #ccc;
    padding: 0.5rem;
    resize: vertical;
  }
  button {
    background: #ff3e00;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1.5rem;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
  }
  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
</style>
