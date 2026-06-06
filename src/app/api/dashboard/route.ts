import { errorResponse, jsonResponse } from "@/lib/api";
import { getDashboardMetrics } from "@/services/dashboard.service";

export async function GET() {
  const metrics = await getDashboardMetrics();

  if (!metrics) {
    return errorResponse("Settings not found", 404);
  }

  return jsonResponse(metrics);
}
