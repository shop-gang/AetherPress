import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";

const baseUrl = "http://localhost:3000";

describe("API: /prompt (AI Processing Layer)", () => {
  let createdPromptIds = [];
  let createdResultIds = [];

  // Verify server is running before tests
  beforeAll(async () => {
    try {
      const res = await request(baseUrl).get("/health");
      expect(res.status).toBe(200);
    } catch (error) {
      throw new Error("Server must be running on " + baseUrl);
    }
  });

  // Cleanup test data
  afterAll(async () => {
    // Clean up AI results first (foreign key constraint)
    for (const id of createdResultIds) {
      try {
        await request(baseUrl).delete(`/api/ai_results/${id}`);
      } catch (error) {
        console.warn("Cleanup failed for AI result:", id);
      }
    }
    // Then clean up prompts
    for (const id of createdPromptIds) {
      try {
        await request(baseUrl).delete(`/api/prompts/${id}`);
      } catch (error) {
        console.warn("Cleanup failed for prompt:", id);
      }
    }
  });

  it("should return a structured AI response for a valid prompt", async () => {
    const testPrompt = "Write a poem about the sea.";
    const res = await request(baseUrl)
      .post("/prompt")
      .send({ prompt: testPrompt });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("content");
    expect(res.body).toHaveProperty("metadata");
    expect(res.body).toHaveProperty("promptId");
    expect(res.body).toHaveProperty("resultId");

    // Content validation
    expect(res.body.content).toHaveProperty("title");
    expect(res.body.content).toHaveProperty("body");
    expect(res.body.content).toHaveProperty("layout");
    expect(typeof res.body.content.body).toBe("string");
    expect(res.body.content.body.length).toBeGreaterThan(0);

    // Metadata validation
    expect(res.body.metadata).toHaveProperty("model", "mock-1");
    expect(res.body.metadata).toHaveProperty("tokens");

    // Store IDs for cleanup
    createdPromptIds.push(res.body.promptId);
    createdResultIds.push(res.body.resultId);

    // Verify prompt storage
    const storedPrompt = await request(baseUrl).get(
      `/api/prompts/${res.body.promptId}`
    );
    expect(storedPrompt.status).toBe(200);
    expect(storedPrompt.body).toHaveProperty("prompt", testPrompt);

    // Verify AI result storage
    const storedResult = await request(baseUrl).get(
      `/api/ai_results/${res.body.resultId}`
    );
    expect(storedResult.status).toBe(200);
    expect(storedResult.body).toHaveProperty("result");
    expect(storedResult.body.result).toEqual(res.body.content);
  });

  it("should return 400 for missing or empty prompt", async () => {
    const res = await request(baseUrl).post("/prompt").send({ prompt: "   " });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400 for missing prompt field", async () => {
    const res = await request(baseUrl).post("/prompt").send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400 for invalid prompt type", async () => {
    const res = await request(baseUrl)
      .post("/prompt")
      .send({ prompt: { invalid: "object" } });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});
