import { jsonResponse } from "@/lib/api";
import { getDashboardMetrics } from "@/services/dashboard.service";

export async function GET() {
  const metrics = await getDashboardMetrics();
  return jsonResponse(metrics);
}
