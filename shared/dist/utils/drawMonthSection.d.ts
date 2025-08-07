import { PDFPage } from "pdf-lib";
import { CalendarEvent } from "./types";
export declare function drawMonthSection(page: PDFPage, font: any, dayFont: any, year: number, monthIndex: number, cellWidth: number, cellHeight: number, xOffset: number, yOffset: number, events: CalendarEvent[]): void;
