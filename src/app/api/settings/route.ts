import { errorResponse, jsonResponse, parseJsonBody, validationErrorResponse } from "@/lib/api";
import { updateSettingsSchema } from "@/lib/validators";
import { getSettings, upsertSettings } from "@/repositories/settings.repository";

export async function GET() {
  const settings = await getSettings();

  if (!settings) {
    return errorResponse("Settings not found", 404);
  }

  return jsonResponse(settings);
}

export async function PUT(request: Request) {
  const body = await parseJsonBody<unknown>(request);

  if (!body) {
    return errorResponse("Invalid JSON body");
  }

  const parsed = updateSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const settings = await upsertSettings(parsed.data);
  return jsonResponse(settings);
}
