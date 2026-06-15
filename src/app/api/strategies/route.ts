import {
  errorResponse,
  jsonResponse,
  parseJsonBody,
  validationErrorResponse,
} from "@/lib/api";
import { createStrategySchema } from "@/lib/validators";
import { createStrategy, listStrategies } from "@/services/dca-strategy.service";

export async function GET() {
  const strategies = await listStrategies();
  return jsonResponse({ strategies });
}

export async function POST(request: Request) {
  const body = await parseJsonBody<unknown>(request);

  if (!body) {
    return errorResponse("Invalid JSON body");
  }

  const parsed = createStrategySchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const strategy = await createStrategy(parsed.data);
    return jsonResponse(strategy, 201);
  } catch {
    return errorResponse("Failed to create strategy", 500);
  }
}
