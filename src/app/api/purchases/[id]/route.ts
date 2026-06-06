import {
  errorResponse,
  jsonResponse,
  parseJsonBody,
  validationErrorResponse,
} from "@/lib/api";
import { updatePurchaseSchema } from "@/lib/validators";
import {
  deletePurchase,
  getPurchase,
  updatePurchase,
} from "@/services/purchase.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const purchase = await getPurchase(id);

  if (!purchase) {
    return errorResponse("Purchase not found", 404);
  }

  return jsonResponse(purchase);
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await parseJsonBody<unknown>(request);

  if (!body) {
    return errorResponse("Invalid JSON body");
  }

  const parsed = updatePurchaseSchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const purchase = await updatePurchase(id, parsed.data);

  if (!purchase) {
    return errorResponse("Purchase not found", 404);
  }

  return jsonResponse(purchase);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const deleted = await deletePurchase(id);

  if (!deleted) {
    return errorResponse("Purchase not found", 404);
  }

  return jsonResponse({ success: true });
}
