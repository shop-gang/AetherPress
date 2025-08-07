<script>
  import { submitPrompt as submitPromptApi } from '../lib/api';
  import ContentPreview from './ContentPreview.svelte';

  let prompt = '';
  let loading = false;
  let error = '';
  let generatedContent = null;

  async function submitPrompt() {
    error = '';
    loading = true;
    generatedContent = null;
    
    try {
      const data = await submitPromptApi(prompt);
      generatedContent = data.content || {
        title: 'Generated Content',
        body: data.result || JSON.stringify(data),
        layout: 'default'
      };
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="prompt-card">
  <h2>AetherPress Prompt</h2>
  <form on:submit|preventDefault={submitPrompt}>
    <textarea
      bind:value={prompt}
      rows="3"
      placeholder="Enter your creative prompt..."
      required
    ></textarea>
    <button type="submit" disabled={loading || !prompt.trim()}>
      {loading ? 'Generating...' : 'Generate'}
    </button>
  </form>
  {#if error}
    <div class="error">{error}</div>
  {/if}
  {#if generatedContent}
    <ContentPreview content={generatedContent} />
  {/if}
</div>

<style>
  .prompt-card {
    max-width: 420px;
    margin: 2rem auto;
    padding: 1.5rem 1.2rem;
    border-radius: 12px;
    box-shadow: 0 2px 12px #0001;
    background: #fff;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  textarea {
    width: 100%;
    font-size: 1rem;
    border-radius: 6px;
    border: 1px solid #ccc;
    padding: 0.5rem;
    resize: vertical;
  }
  button {
    width: 100%;
    padding: 0.7rem;
    font-size: 1rem;
    border-radius: 6px;
    border: none;
    background: #ff3e00;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s;
  }
  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  .error {
    color: #b00020;
    background: #ffeaea;
    border-radius: 6px;
    padding: 0.5rem;
    font-size: 0.95rem;
  }
  /* Component styles end */
</style>
