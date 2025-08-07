"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawMonthSection = drawMonthSection;
// Helper to render individual months + events
const pdf_lib_1 = require("pdf-lib");
const constants_1 = require("./constants");
function drawMonthSection(page, font, dayFont, year, monthIndex, cellWidth, cellHeight, xOffset, yOffset, events) {
    const monthName = constants_1.MONTH_NAMES[monthIndex];
    const x = xOffset;
    const y = yOffset;
    page.drawText(monthName, {
        x: x + 8,
        y: y - 32,
        size: 18,
        font,
        color: (0, pdf_lib_1.rgb)(0.1, 0.1, 0.1),
    });
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDay = new Date(year, monthIndex, 1).getDay();
    let dayX = x + 8;
    let dayY = y - 56;
    let day = 1;
    for (let week = 0; week < 6; week++) {
        for (let d = 0; d < 7; d++) {
            if ((week === 0 && d < firstDay) || day > daysInMonth) {
                dayX += 22;
                continue;
            }
            page.drawText(String(day), {
                x: dayX,
                y: dayY,
                size: 10,
                font: dayFont,
                color: (0, pdf_lib_1.rgb)(0.2, 0.2, 0.2),
            });
            const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = events.filter((e) => e.date === dateStr);
            if (dayEvents.length > 0) {
                page.drawText(dayEvents.map((e) => e.title).join(", "), {
                    x: dayX,
                    y: dayY - 10,
                    size: 7,
                    font: dayFont,
                    color: (0, pdf_lib_1.rgb)(0.7, 0.4, 0.1),
                });
            }
            dayX += 22;
            day++;
        }
        dayX = x + 8;
        dayY -= 18;
    }
}
