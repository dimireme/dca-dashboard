import {
  errorResponse,
  jsonResponse,
  parseJsonBody,
  validationErrorResponse,
} from "@/lib/api";
import { updateStrategySchema } from "@/lib/validators";
import {
  deleteStrategy,
  getStrategy,
  updateStrategy,
} from "@/services/dca-strategy.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const strategy = await getStrategy(id);

  if (!strategy) {
    return errorResponse("Strategy not found", 404);
  }

  return jsonResponse(strategy);
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await parseJsonBody<unknown>(request);

  if (!body) {
    return errorResponse("Invalid JSON body");
  }

  const parsed = updateStrategySchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const strategy = await updateStrategy(id, parsed.data);

  if (!strategy) {
    return errorResponse("Strategy not found", 404);
  }

  return jsonResponse(strategy);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const deleted = await deleteStrategy(id);

  if (!deleted) {
    return errorResponse("Strategy not found", 404);
  }

  return jsonResponse({ success: true });
}
