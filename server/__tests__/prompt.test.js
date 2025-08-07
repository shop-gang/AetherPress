import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import db from "../db";

const baseUrl = "http://localhost:3000";
let createdId;

describe("API: /api/prompts", () => {
  let initialPromptCount;

  // Setup: clean database + verify server
  beforeAll(async () => {
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run("DELETE FROM prompts");
        db.run("DELETE FROM ai_results");
        db.run("DELETE FROM overrides");
        db.run("DELETE FROM pdf_exports", [], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });

    try {
      const health = await request(baseUrl).get("/health");
      expect(health.status).toBe(200);

      const res = await request(baseUrl).get("/api/prompts");
      initialPromptCount = res.body.length;
    } catch (error) {
      throw new Error("Server must be running on " + baseUrl);
    }
  });

  // Cleanup: delete test-created data only
  afterAll(async () => {
    if (createdId) {
      try {
        await request(baseUrl).delete(`/api/prompts/${createdId}`);
      } catch (error) {
        console.warn("Cleanup failed for prompt:", createdId);
      }
    }

    // Ensure no trace of our test prompt remains
    const final = await request(baseUrl).get("/api/prompts");
    const exists = final.body.some((p) => p.id === createdId);
    expect(exists).toBe(false);
  });

  it("should create a prompt", async () => {
    const testPrompt = { prompt: "Test prompt" };
    const res = await request(baseUrl).post("/api/prompts").send(testPrompt);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    createdId = res.body.id;
  });

  it("should get all prompts", async () => {
    const res = await request(baseUrl).get("/api/prompts");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((p) => p.id === createdId)).toBe(true);
  });

  it("should get a prompt by id", async () => {
    const res = await request(baseUrl).get(`/api/prompts/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", createdId);
    expect(res.body).toHaveProperty("prompt");
  });

  it("should handle non-existent prompt id", async () => {
    const res = await request(baseUrl).get("/api/prompts/99999");
    expect(res.status).toBe(404);
  });

  it("should update a prompt", async () => {
    const updatedPrompt = { prompt: "Updated prompt" };
    const res = await request(baseUrl).put(`/api/prompts/${createdId}`).send(updatedPrompt);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("changes");

    const verify = await request(baseUrl).get(`/api/prompts/${createdId}`);
    expect(verify.body.prompt).toBe(updatedPrompt.prompt);
  });

  it("should delete a prompt", async () => {
    const res = await request(baseUrl).delete(`/api/prompts/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("changes");

    const check = await request(baseUrl).get(`/api/prompts/${createdId}`);
    expect(check.status).toBe(404);
    createdId = null;
  });
});
