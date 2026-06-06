import {
  errorResponse,
  jsonResponse,
  parseJsonBody,
  validationErrorResponse,
} from "@/lib/api";
import { createPurchaseSchema, purchasesQuerySchema } from "@/lib/validators";
import {
  createPurchase,
  listPurchases,
} from "@/services/purchase.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = purchasesQuerySchema.safeParse({
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const purchases = await listPurchases(parsed.data.from, parsed.data.to);
  return jsonResponse({ purchases });
}

export async function POST(request: Request) {
  const body = await parseJsonBody<unknown>(request);

  if (!body) {
    return errorResponse("Invalid JSON body");
  }

  const parsed = createPurchaseSchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const purchase = await createPurchase(parsed.data);
  return jsonResponse(purchase, 201);
}
