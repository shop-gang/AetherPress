// Basic Express server setup
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const puppeteer = require("puppeteer");
const app = express();
const PORT = process.env.PORT || 3000;

// Puppeteer global browser instance
let browserInstance;
let puppeteerReady = false;
(async () => {
  try {
    browserInstance = await puppeteer.launch({
      executablePath: "/usr/bin/google-chrome",
      args: ["--no-sandbox"],
    });
    puppeteerReady = true;
    console.log("Puppeteer initialized successfully with system Chrome");
  } catch (err) {
    console.error("Puppeteer failed to launch:", err);
    // Optionally exit if critical: process.exit(1);
  }
})();

// Trust proxy for rate limiting
app.set("trust proxy", 1);

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Health endpoint
// Checks both SQLite3 and Puppeteer status
const db = require("./db");
app.get("/health", (req, res) => {
  db.get("SELECT 1", (err) => {
    if (err || !puppeteerReady) {
      return res.status(503).json({
        status: "error",
        db: err ? "unavailable" : "ok",
        puppeteer: puppeteerReady ? "ok" : "initializing",
      });
    }
    res.status(200).json({
      status: "ok",
      db: "sqlite3",
      puppeteer: "ok",
    });
  });
});

// Default route
app.get("/", (req, res) => {
  res.send("Hello, world! Your Express server is running.");
});

// Test error route
app.get("/test-error", (req, res, next) => {
  const err = new Error("Simulated error for testing");
  err.status = 418;
  next(err);
});

// Centralized error handler
app.use((err, req, res, next) => {
  // Log error details
  console.error("--- Error Handler ---");
  console.error("Time:", new Date().toISOString());
  console.error("Method:", req.method);
  console.error("URL:", req.originalUrl);
  console.error("Body:", req.body);
  console.error("Error Stack:", err.stack);

  // Differentiate error response by environment
  const isDev = process.env.NODE_ENV !== "production";
  res.status(err.status || 500).json({
    error: isDev ? err.message : "Internal Server Error",
    ...(isDev && { stack: err.stack }),
  });
});

// Database initialization
require("./db");

const crud = require("./crud");

// --- PROMPT PROCESSING ENDPOINT ---
const { MockAIService } = require("./aiService");
const aiService = new MockAIService();

app.post("/prompt", async (req, res, next) => {
  const { prompt } = req.body;
  // Input validation
  if (typeof prompt !== "string" || !prompt.trim()) {
    return res
      .status(400)
      .json({ error: "Prompt is required and must be a non-empty string." });
  }
  try {
    // Use AI service abstraction with new content format
    const aiResponse = await aiService.generateContent(prompt);
    crud.createPrompt(prompt, (err, dbResult) => {
      if (err) return next(err);
      // Store both prompt and generated content
      crud.createAIResult(dbResult.id, aiResponse.content, (err, aiResult) => {
        if (err) return next(err);
        res.status(201).json({
          ...aiResponse,
          promptId: dbResult.id,
          resultId: aiResult.id,
        });
      });
    });
  } catch (err) {
    // AI service error handling
    next(err);
  }
});

// --- PREVIEW ENDPOINT ---
const previewTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    .preview { max-width: 800px; margin: 2rem auto; font-family: system-ui; }
    .preview h1 { color: #2c3e50; }
    .preview .content { line-height: 1.6; }
  </style>
</head>
<body>
  <div class="preview">
    <h1>${content.title}</h1>
    <div class="content">${content.body}</div>
  </div>
</body>
</html>
`;

app.get("/preview", (req, res) => {
  const { content } = req.query;
  if (!content) {
    return res.status(400).json({ error: "Content parameter is required" });
  }
  try {
    const contentObj = JSON.parse(content);
    if (!contentObj.title || !contentObj.body) {
      return res.status(400).json({
        error: "Content must include title and body",
      });
    }
    res.send(previewTemplate(contentObj));
  } catch (err) {
    res.status(400).json({
      error: "Invalid content format",
      details: err.message,
    });
  }
});

// --- OVERRIDE ENDPOINT ---
app.post("/override", (req, res) => {
  const { content, changes } = req.body;

  // Basic input validation
  if (!content || !changes || typeof content !== "object") {
    return res.status(400).json({ error: "Invalid input format" });
  }

  try {
    const updated = { ...content, ...changes };
    res.json({ content: updated });
  } catch (err) {
    res.status(400).json({
      error: "Failed to update content",
      details: err.message,
    });
  }
});

// --- PDF EXPORT ENDPOINT ---
app.post("/export", async (req, res, next) => {
  // Log and persist the received request body
  console.log("--- /export request body ---");
  console.log(req.body);
  const fs = require("fs");
  const path = require("path");
  try {
    const reqBodyPath = path.resolve(
      __dirname,
      "../samples/export_request_body.json"
    );
    fs.writeFileSync(reqBodyPath, JSON.stringify(req.body, null, 2));
  } catch (e) {
    console.error("Failed to write export_request_body.json:", e);
  }

  const { title, body } = req.body;
  if (!title || !body) {
    return res
      .status(400)
      .json({ error: "Content must include title and body" });
  }

  if (!puppeteerReady || !browserInstance) {
    return res.status(503).json({
      error: "PDF generation service not ready",
      details: "Puppeteer is still initializing or failed to launch",
    });
  }

  console.log("--- Starting PDF generation ---");
  let page;
  try {
    page = await browserInstance.newPage();
    console.log("Created new Puppeteer page");

    const contentObj = { title, body };
    await page.setContent(previewTemplate(contentObj));
    console.log("Set page content successfully");

    console.log("Starting PDF generation with Puppeteer...");
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "1cm",
        right: "1cm",
        bottom: "1cm",
        left: "1cm",
      },
    });
    // Log and persist the first 16 bytes of the PDF buffer
    console.log("--- /export PDF buffer (first 16 bytes) ---");
    console.log(pdf.slice(0, 16));
    try {
      const pdfFirst16Path = path.resolve(
        __dirname,
        "../samples/export_pdf_first16.bin"
      );
      fs.writeFileSync(pdfFirst16Path, pdf.slice(0, 16));
    } catch (e) {
      console.error("Failed to write export_pdf_first16.bin:", e);
    }
    console.log("\n--- Preparing response ---");
    res.setHeader("Content-Disposition", "inline; filename=output.pdf");
    res.setHeader("Content-Type", "application/pdf");

    console.log("Response headers set:", {
      "Content-Type": res.getHeader("Content-Type"),
      "Content-Disposition": res.getHeader("Content-Disposition"),
    });

    console.log(`PDF Buffer details:
    - Total size: ${pdf.length} bytes
    - First 5 bytes: ${pdf.slice(0, 5).toString()}
    - Is Buffer?: ${Buffer.isBuffer(pdf)}
    `);

    console.log("Sending PDF response...");
    // Use res.end() instead of res.send() to avoid Express's automatic handling
    res.end(pdf);
    console.log("PDF response sent successfully");
  } catch (err) {
    err.message = `Failed to generate PDF: ${err.message}`;
    next(err);
  } finally {
    if (page) await page.close();
  }
});

// --- PROMPTS CRUD API ---
app.post("/api/prompts", (req, res, next) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });
  crud.createPrompt(prompt, (err, result) => {
    if (err) return next(err);
    res.status(201).json(result);
  });
});

app.get("/api/prompts", (req, res, next) => {
  crud.getPrompts((err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
});

app.get("/api/prompts/:id", (req, res, next) => {
  crud.getPromptById(req.params.id, (err, row) => {
    if (err) return next(err);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  });
});

app.put("/api/prompts/:id", (req, res, next) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });
  crud.updatePrompt(req.params.id, prompt, (err, result) => {
    if (err) return next(err);
    res.json(result);
  });
});

app.delete("/api/prompts/:id", (req, res, next) => {
  crud.deletePrompt(req.params.id, (err, result) => {
    if (err) return next(err);
    res.json(result);
  });
});

// --- AI_RESULTS CRUD API ---
app.post("/api/ai_results", (req, res, next) => {
  const { prompt_id, result } = req.body;
  if (!prompt_id || !result)
    return res.status(400).json({ error: "prompt_id and result are required" });
  crud.createAIResult(prompt_id, result, (err, resultObj) => {
    if (err) return next(err);
    res.status(201).json(resultObj);
  });
});

app.get("/api/ai_results", (req, res, next) => {
  crud.getAIResults((err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
});

app.get("/api/ai_results/:id", (req, res, next) => {
  crud.getAIResultById(req.params.id, (err, row) => {
    if (err) return next(err);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  });
});

app.put("/api/ai_results/:id", (req, res, next) => {
  const { result } = req.body;
  if (!result) return res.status(400).json({ error: "result is required" });
  crud.updateAIResult(req.params.id, result, (err, resultObj) => {
    if (err) return next(err);
    res.json(resultObj);
  });
});

app.delete("/api/ai_results/:id", (req, res, next) => {
  crud.deleteAIResult(req.params.id, (err, resultObj) => {
    if (err) return next(err);
    res.json(resultObj);
  });
});

// --- OVERRIDES CRUD API ---
app.post("/api/overrides", (req, res, next) => {
  const { ai_result_id, override } = req.body;
  if (!ai_result_id || !override)
    return res
      .status(400)
      .json({ error: "ai_result_id and override are required" });
  crud.createOverride(ai_result_id, override, (err, resultObj) => {
    if (err) return next(err);
    res.status(201).json(resultObj);
  });
});

app.get("/api/overrides", (req, res, next) => {
  crud.getOverrides((err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
});

app.get("/api/overrides/:id", (req, res, next) => {
  crud.getOverrideById(req.params.id, (err, row) => {
    if (err) return next(err);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  });
});

app.put("/api/overrides/:id", (req, res, next) => {
  const { override } = req.body;
  if (!override) return res.status(400).json({ error: "override is required" });
  crud.updateOverride(req.params.id, override, (err, resultObj) => {
    if (err) return next(err);
    res.json(resultObj);
  });
});

app.delete("/api/overrides/:id", (req, res, next) => {
  crud.deleteOverride(req.params.id, (err, resultObj) => {
    if (err) return next(err);
    res.json(resultObj);
  });
});

// --- PDF_EXPORTS CRUD API ---
app.post("/api/pdf_exports", (req, res, next) => {
  const { ai_result_id, file_path } = req.body;
  if (!ai_result_id || !file_path)
    return res
      .status(400)
      .json({ error: "ai_result_id and file_path are required" });
  crud.createPDFExport(ai_result_id, file_path, (err, resultObj) => {
    if (err) return next(err);
    res.status(201).json(resultObj);
  });
});

app.get("/api/pdf_exports", (req, res, next) => {
  crud.getPDFExports((err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
});

app.get("/api/pdf_exports/:id", (req, res, next) => {
  crud.getPDFExportById(req.params.id, (err, row) => {
    if (err) return next(err);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  });
});

app.put("/api/pdf_exports/:id", (req, res, next) => {
  const { file_path } = req.body;
  if (!file_path)
    return res.status(400).json({ error: "file_path is required" });
  crud.updatePDFExport(req.params.id, file_path, (err, resultObj) => {
    if (err) return next(err);
    res.json(resultObj);
  });
});

app.delete("/api/pdf_exports/:id", (req, res, next) => {
  crud.deletePDFExport(req.params.id, (err, resultObj) => {
    if (err) return next(err);
    res.json(resultObj);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Graceful shutdown for Puppeteer and DB
process.on("SIGINT", async () => {
  console.log("Received SIGINT. Closing resources...");
  if (browserInstance) await browserInstance.close();
  db.close();
  process.exit(0);
});
