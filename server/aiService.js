// AI Service Abstraction for AetherPressDeux
// This module defines the interface and mock implementation for AI-powered content generation.

class AIService {
  /**
   * Generate text content from a prompt.
   * @param {string} prompt - The user prompt.
   * @returns {Promise<{ content: { title: string, body: string, layout: string }, metadata: object }>}
   */
  async generateContent(prompt) {
    throw new Error("Not implemented");
  }
}

// Mock implementation for development and testing
class MockAIService extends AIService {
  async generateContent(prompt) {
    // Simulate realistic, structured AI output
    return {
      content: {
        title: `Generated from: ${prompt}`,
        body: `This is a simple response to demonstrate the flow.
               Later we can integrate real AI here.
               For now, we're testing the core loop.`,
        layout: "default",
      },
      metadata: {
        model: "mock-1",
        tokens: prompt.split(/\s+/).length,
      },
    };
  }
}

module.exports = {
  AIService,
  MockAIService,
};
