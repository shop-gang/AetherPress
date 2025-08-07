// API utilities with retry logic

const DEFAULT_CONFIG = {
  maxRetries: 3,
  initialBackoffMs: 1000,
  maxBackoffMs: 10000,
  retryableStatuses: [401, 408, 429, 500, 502, 503, 504],
};

async function fetchWithRetry(url, options = {}) {
  const config = {
    ...DEFAULT_CONFIG,
    ...options.retryConfig,
  };
  delete options.retryConfig;

  let lastError;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Successful response
      if (response.ok) return response;

      // Check if we should retry based on status
      if (config.retryableStatuses.includes(response.status)) {
        if (attempt < config.maxRetries) {
          // Calculate backoff with jitter
          const backoff = Math.min(
            config.maxBackoffMs,
            config.initialBackoffMs * Math.pow(2, attempt - 1)
          );
          const jitter = Math.random() * 100;

          console.log(
            `Request failed with status ${
              response.status
            }. Retrying in ${Math.round(
              (backoff + jitter) / 1000
            )}s... (Attempt ${attempt}/${config.maxRetries})`
          );

          await new Promise((resolve) => setTimeout(resolve, backoff + jitter));
          continue;
        }
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt === config.maxRetries) throw error;

      const backoff = Math.min(
        config.maxBackoffMs,
        config.initialBackoffMs * Math.pow(2, attempt - 1)
      );

      console.log(
        `Request failed with error: ${error.message}. Retrying in ${Math.round(
          backoff / 1000
        )}s... (Attempt ${attempt}/${config.maxRetries})`
      );

      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }

  throw lastError;
}

// API endpoints
export async function submitPrompt(prompt) {
  const response = await fetchWithRetry("/prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
    retryConfig: {
      maxRetries: 3,
      retryableStatuses: [401], // Focus on auth errors
    },
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  return response.json();
}

export async function loadPreview(content) {
  const response = await fetchWithRetry(
    `/preview?content=${encodeURIComponent(JSON.stringify(content))}`,
    {
      retryConfig: {
        maxRetries: 3,
        retryableStatuses: [500, 503], // Server errors most likely for preview
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Preview failed: ${response.status}`);
  }

  return response.text();
}

export async function saveOverride(content, changes) {
  const response = await fetchWithRetry("/override", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, changes }),
    retryConfig: {
      maxRetries: 3,
      retryableStatuses: [500, 503], // Server errors most likely for override
    },
  });

  if (!response.ok) {
    throw new Error(`Override failed: ${response.status}`);
  }

  return response.json();
}
