import { PDFExportOptions } from "./types";
export type { PDFExportOptions, CalendarEvent, } from "./types";
export declare function exportCalendarToPDF({ year, selectedMonths, events, backgroundUrl, }: PDFExportOptions): Promise<Uint8Array>;
