# AetherPress Prototype - Welcome

The goal is a quick-build prototype involving a Node.js backend (for Puppeteer compatibility and potentially Express/FastAPI) and a modern frontend SPA (Svelte). This project demonstrates the foundational architecture for a quick-build prototype of AetherPress, focusing on the core loop: Prompt -> AI Processing -> Preview -> Basic Override -> PDF Export.

## Development Philosophy

We maintain stability through structured change management:

1. Discuss and understand the full context
2. Document agreements and decisions
3. Create actionable, phased plans
4. Implement incrementally

All contributors, human and AI, must:

- Start with README.md
- Respect project structure
- Follow established patterns
- Propose changes that align with architecture

This approach prevents destabilizing changes and maintains our clean, component-based architecture.
🚨 **All contributors must read and follow the Development Philosophy before making any changes.** 🚨

## Vision

To empower creators (writers, poets, educators, marketers) to effortlessly design and publish visually stunning, graphically rich eBooks, leveraging AI for enhanced creativity, efficiency, and personalization by:

- Delivering eye-catching, benchmark-quality drafts at lightning speed.
- Empowering users with modular, precise control over every aspect of their eBook.
- Acting as your creative partner—the AI handles the heavy lifting, leaving you free to perfect your vision.

## Unified Testing & Module System (Summary)

**Client tests**: Powered by Vitest for fast, modern Svelte development.
**Server tests**: Powered by Vitest for Node.js/JavaScript workflows.
**Module System**: CommonJS (CJS) is used in the backend for compatibility; ESM is used in the frontend for Svelte/Vite.

## Project Structure

- `server/` — All backend code (Express server, Puppeteer, modules)
- `client/` — Svelte frontend SPA
- `data/` — (Optional) Database files
- `samples/` — Sample files (e.g., PNGs, PDFs)
- `docs/` — Project documentation
- `shared/` — Code or assets shared between client and server (e.g., utility functions, types, or constants).
- `scripts/` — Usually holds automation scripts (e.g., deployment, data migration, or setup scripts).
- `config/` — Configuration files (e.g., environment settings, service credentials, or build configs).

## Technology Vibe

- **Client:** Modern, component-based JS framework (Vite/Svelte). Focus on a clean, responsive UI.
- **Server:** Scalable platform (Express/Node.js). Ready to orchestrate multiple API calls.
- **Database:** For a balance of structure and flexibility (PostgreSQL/JSONB).
  - Production deployments can use any PostgreSQL-compatible service (Azure Database, AWS RDS, etc.)
  - Currently, SQLite3 is used for live development. Migration to PostgreSQL/JSONB is planned and health checks will be updated accordingly.
  - See `/server/index.js` for the current health check implementation and TODO note.
- **AI:**
  - **Default:** Use Google's Gemini for both text and image generation.
  - Leverage best-in-class third-party APIs for core GenAI (image generation, possibly LLM for assistant). Build custom logic for agent orchestration and workflow, not foundational models.
  - Support use of [GitHub Models](https://github.com/features/models) for discovery and experimentation with AI models (for free).
- **PDF Generation:** Use a proven, robust library, puppeteer for HTML-to-PDF.
- **Persistence:** Standard database for user accounts, projects, preferences, asset metadata.

## Key Features

- **Prompt Engine ("The Magic Wand"):**  
  Uses natural language processing to interpret your creative prompt, ensuring that your ideas—no matter how abstract—are understood and transformed into content.

- **AI Orchestrator ("The Conductor"):**  
  Seamlessly manages the AI Content Agent, Image Agent, Layout Engine, and Assembly Engine to balance creativity with consistency.

- **Modular Dashboard ("The Control Panel"):**  
  Provides distinct modules for content, images, layout, and settings, allowing for targeted tweaks without disrupting your entire project.

- **Dynamic Live Preview & Export:**  
  See changes in near real-time and export a high-fidelity PDF that mirrors the live preview down to the pixel.

## API Endpoints (Core Loop)

1. **POST /prompt** — Accepts a `prompt` and returns generated content
2. **GET /preview** — Returns an HTML preview for given content
3. **POST /override** — Accepts `content` and `override`, returns updated content
4. **GET /export** — Returns a PDF file for given content

## Implementation Notes

- **PDF Generation**: Uses Puppeteer for production-level HTML-to-PDF rendering
- **AI Service Abstraction**: Centralized logic for text and image generation
- **Template-Based Layouts**: Dynamic HTML/CSS templates for content and image rendering

## Future Enhancements

- Asynchronous processing for better performance
- Enhanced UI/UX
- User authentication and session management
- Expanded database schema for more complex workflows

## Documentation

See the `docs/` directory for devcontainer setup, dependency management, and architecture notes.

## Getting Started

### Backend

1. Navigate to the server directory:
   ```bash
   cd server
   npm install
   npm run dev
   ```
   (This runs the Express server from `/server/index.js`.)

### Frontend

1. Navigate to the client directory:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   (This runs the Svelte app on Vite.)

### Access the Application

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000](http://localhost:3000)
