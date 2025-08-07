"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCalendarToPDF = exportCalendarToPDF;
// Main export function & integration logic
// drawMonthSection.ts -- Helper to render individual months + events
// constants.ts --	Month names, layout grid, shared values
// types.ts	-- TypeScript interfaces for CalendarEvent, Options etc.
const pdf_lib_1 = require("pdf-lib");
const drawMonthSection_1 = require("./drawMonthSection");
const constants_1 = require("./constants");
async function exportCalendarToPDF({ year, selectedMonths, events, backgroundUrl, }) {
    const pdfDoc = await pdf_lib_1.PDFDocument.create();
    const page = pdfDoc.addPage(pdf_lib_1.PageSizes.A3);
    const { width, height } = page.getSize();
    if (backgroundUrl) {
        const imgBytes = await fetch(backgroundUrl).then((r) => r.arrayBuffer());
        const img = backgroundUrl.startsWith("data:image/png")
            ? await pdfDoc.embedPng(imgBytes)
            : await pdfDoc.embedJpg(imgBytes);
        page.drawImage(img, {
            x: 0,
            y: 0,
            width,
            height,
            opacity: 0.5,
        });
    }
    const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
    const dayFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
    page.drawText(`${year} Calendar`, {
        x: 40,
        y: height - 60,
        size: 36,
        font,
        color: (0, pdf_lib_1.rgb)(0.2, 0.2, 0.2),
    });
    const cellWidth = (width - 80) / constants_1.GRID_COLS;
    const cellHeight = (height - 120) / constants_1.GRID_ROWS;
    for (let i = 0; i < 12; i++) {
        if (!selectedMonths.includes(constants_1.MONTH_NAMES[i]))
            continue;
        const col = i % constants_1.GRID_COLS;
        const row = Math.floor(i / constants_1.GRID_COLS);
        const xOffset = 40 + col * cellWidth;
        const yOffset = height - 100 - row * cellHeight;
        (0, drawMonthSection_1.drawMonthSection)(page, font, dayFont, year, i, cellWidth, cellHeight, xOffset, yOffset, events);
    }
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}
