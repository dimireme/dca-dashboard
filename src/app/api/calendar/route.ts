import { errorResponse, jsonResponse } from "@/lib/api";
import { calendarQuerySchema } from "@/lib/validators";
import { getCalendarMonth, getCalendarYear } from "@/services/calendar.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = calendarQuerySchema.safeParse({
    year: searchParams.get("year"),
    month: searchParams.get("month") ?? undefined,
  });

  if (!parsed.success) {
    return errorResponse("Invalid year or month");
  }

  if (parsed.data.month) {
    const calendar = await getCalendarMonth(parsed.data.year, parsed.data.month);

    if (!calendar) {
      return errorResponse("Settings not found", 404);
    }

    return jsonResponse(calendar);
  }

  const calendar = await getCalendarYear(parsed.data.year);

  if (!calendar) {
    return errorResponse("Settings not found", 404);
  }

  return jsonResponse(calendar);
}
