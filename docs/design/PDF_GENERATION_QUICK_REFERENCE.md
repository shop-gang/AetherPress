# PDF Generation Architecture - Quick Reference

## File Location

**Full Documentation**: `docs/design/PDF_GENERATION_ARCHITECTURE.md` (1,477 lines)

## Key Sections at a Glance

### 1. E2E Summary (lines 18-48)

- Overview of dual-path architecture
- Latency profile table
- Payload size analysis

### 2. System Architecture (lines 50-220)

- **High-level flow diagram**: Shows full pipeline from frontend to browser
- **Content flow states**: Synchronous vs asynchronous paths
- Visual representation of module interactions

### 3. Backend Flow (lines 222-650)

Detailed breakdown of 7 steps:

1. Request entry (`POST /export`)
2. Export service (mode routing)
3. Input router (strategy selection)
4. PDF configuration
5. PDF generation orchestration
6. Rendering via Puppeteer
7. HTTP response

Each step includes:

- File references
- Code snippets
- Decision logic tables
- ASCII flow diagrams

### 4. Frontend Flow (lines 652-750)

- Request initiation with validation
- Binary response handling
- Download trigger mechanism
- UI component integration
- Svelte component code

### 5. Delivery Mechanism (lines 752-850)

- **Binary stream transport diagram**
- Blob object creation process
- Object URL creation & download
- Why this approach works (attribute table)

### 6. Implementation Details (lines 852-1050)

- Canonical envelope format (structure + fields)
- Transformation pipeline (before/after examples)
- Configuration merging strategy (priority levels)

### 7. Error Handling (lines 1052-1200)

- Error flow diagram
- Error response formats (400, 500, 503)
- Frontend retry logic with exponential backoff

### 8. Performance Characteristics (lines 1202-1350)

- **Latency breakdown**: Detailed timing for each component
- **Payload size analysis**: Input/output ratios
- **Resource utilization**: Memory, CPU, network

### 9. Implementation Checklist (lines 1352-1420)

- Backend setup requirements
- Frontend setup requirements
- Testing checklist
- Deployment considerations

---

## Visual Assets Included

✓ High-level architecture diagram (60+ lines ASCII)
✓ Content flow states (dual-path visualization)
✓ Input routing decision tree
✓ Binary stream transport diagram
✓ Error flow diagram
✓ Latency breakdown chart
✓ Payload size analysis
✓ Resource utilization breakdown

---

## How to Use This Document

### For Implementation

1. Start with **System Architecture** for overall understanding
2. Use **Implementation Details** for data structures
3. Follow **Backend Flow** steps 1-7 sequentially
4. Use **Frontend Flow** for client-side integration
5. Reference **Deployment Considerations** for production

### For Debugging

- **Performance Issues**: See Performance Characteristics section
- **Error Handling**: See Error Handling section with response formats
- **Latency Problems**: See latency breakdown with timing for each component

### For Design Review

- **E2E Summary** for executive overview
- **System Architecture** for design decisions
- **Performance Characteristics** for SLA validation

### For Reproduction

- Follow **Implementation Checklist** step-by-step
- Use exact file paths and module names
- Reference code snippets for key functions
- Cross-check error handling patterns

---

## Code File References

Backend modules:

- `server/index.js` (lines 1301-1360: POST /export endpoint)
- `server/exportService.js` (lines 1-140: mode routing)
- `server/pdfGenerator.js` (lines 45-160: orchestration)
- `server/inputRouter.js` (lines 1-70: strategy routing)
- `server/pdfConfigurator.js` (referenced, configuration management)
- `server/renderStrategies.js` (conceptual: rendering implementations)
- `server/puppeteerBridge.js` (referenced: browser interface)

Frontend modules:

- `client/src/lib/api.js` (lines 430-460: exportToPdf function)
- `client/src/lib/endpoints.js` (lines 89-107: response handling)
- `client/src/components/ExportButton.svelte` (lines 20-50: UI trigger)

---

## Key Metrics

| Metric                 | Value      | Notes               |
| ---------------------- | ---------- | ------------------- |
| Request-to-PDF latency | ~500ms     | Synchronous path    |
| Input size range       | 1-50 KB    | Canonical envelope  |
| Output PDF size        | 50-300 KB  | Typical range       |
| Compression ratio      | 2-4x       | PDF includes fonts  |
| Puppeteer memory       | 100-150 MB | Shared process      |
| Per-page memory        | 10-20 MB   | Per concurrent page |
| Browser overhead       | ~50 ms     | Page creation       |
| HTML rendering         | ~200 ms    | Layout + paint      |
| PDF serialization      | ~150 ms    | PDF encoding        |

---

## Critical Design Decisions

1. **Dual-path architecture**: Prompt OR envelope (not both)
2. **Input priority routing**: Full HTML > Stack-based > Wrapped
3. **Binary streaming**: Not base64 (~25% smaller payload)
4. **Blob-based download**: No server session state needed
5. **Configuration merging**: Theme > Quality > Defaults (priority)
6. **Error retry strategy**: Exponential backoff (1s, 2s, 4s)
7. **Memory cleanup**: `revokeObjectURL()` prevents leaks

---

## Next Steps

1. Review `PDF_GENERATION_ARCHITECTURE.md` completely
2. Validate against existing implementation
3. Update with any production findings
4. Reference in architecture decision records (ADR)
5. Link from main README.md
