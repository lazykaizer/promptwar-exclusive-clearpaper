/**
 * iCalendar (.ics) generator for key document dates.
 */

interface CalendarEvent {
  uid: string;
  summary: string;
  description?: string;
  dtstart: string; // ISO 8601 date: YYYY-MM-DD
  dtend?: string;
}

function formatICSDate(isoDate: string): string {
  // Convert YYYY-MM-DD to YYYYMMDD
  return isoDate.replace(/-/g, "");
}

function escapeICS(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function formatEvent(event: CalendarEvent): string {
  const dtstart = formatICSDate(event.dtstart);
  const dtend = event.dtend ? formatICSDate(event.dtend) : dtstart;

  return [
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `SUMMARY:${escapeICS(event.summary)}`,
    event.description
      ? `DESCRIPTION:${escapeICS(event.description)}`
      : null,
    `DTSTART;VALUE=DATE:${dtstart}`,
    `DTEND;VALUE=DATE:${dtend}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15)}Z`,
    "END:VEVENT",
  ]
    .filter(Boolean)
    .join("\r\n");
}

export function generateICS(
  events: CalendarEvent[],
  calendarName: string = "ClearPaper Key Dates"
): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ClearPaper//Legal Document Key Dates//EN",
    `X-WR-CALNAME:${escapeICS(calendarName)}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events.map((e) => formatEvent(e)),
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}

export interface DateForCalendar {
  label: string;
  date_iso: string | null;
  relative: string | null;
}

export function buildCalendarEvents(
  dates: DateForCalendar[],
  documentTitle: string
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const item of dates) {
    if (!item.date_iso) continue; // Skip relative-only dates

    // Validate ISO date format
    if (!/^\d{4}-\d{2}-\d{2}/.test(item.date_iso)) continue;

    const dateStr = item.date_iso.slice(0, 10);

    events.push({
      uid: `clearpaper-${dateStr}-${Math.random().toString(36).slice(2)}@clearpaper`,
      summary: `[${documentTitle}] ${item.label}`,
      description: `Key date from your document reviewed on ClearPaper. Label: ${item.label}. This is a reminder only, not legal advice.`,
      dtstart: dateStr,
    });
  }

  return events;
}
