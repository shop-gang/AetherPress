<script>
  import { loadPreview, saveOverride } from '../lib/api';
  export let content = null;
  
  let previewHtml = '';
  let loading = false;
  let error = '';
  let editing = false;
  let editedContent = null;
  
  $: if (content && !editing) {
    loadPreviewContent();
  }
  
  async function loadPreviewContent() {
    error = '';
    loading = true;
    try {
      previewHtml = await loadPreview(content);
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
  
  async function handleEdit() {
    editing = true;
    editedContent = { ...content };
  }
  
  async function handleSave() {
    error = '';
    loading = true;
    try {
      const result = await saveOverride(content, editedContent);
      content = result.content;
      editing = false;
      await loadPreviewContent();
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
  
  function handleCancel() {
    editing = false;
    editedContent = null;
  }
</script>

<div class="preview-card">
  <div class="controls">
    {#if !editing}
      <button on:click={handleEdit} disabled={loading}>Edit</button>
    {:else}
      <button on:click={handleSave} disabled={loading}>Save</button>
      <button on:click={handleCancel} disabled={loading}>Cancel</button>
    {/if}
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if editing}
    <div class="editor">
      <input 
        bind:value={editedContent.title}
        placeholder="Title"
      />
      <textarea 
        bind:value={editedContent.body}
        rows="5"
        placeholder="Content"
      ></textarea>
    </div>
  {:else if loading}
    <div class="loading">Loading preview...</div>
  {:else}
    <div class="preview">
      {@html previewHtml}
    </div>
  {/if}
</div>

<style>
  .preview-card {
    max-width: 600px;
    margin: 1rem auto;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .controls {
    margin-bottom: 1rem;
  }
  
  .error {
    color: red;
    margin: 1rem 0;
  }
  
  .editor input,
  .editor textarea {
    width: 100%;
    margin-bottom: 1rem;
    padding: 0.5rem;
  }
  
  .preview {
    padding: 1rem;
    border: 1px solid #eee;
    border-radius: 4px;
  }
  
  .loading {
    text-align: center;
    color: #666;
    padding: 1rem;
  }
</style>
