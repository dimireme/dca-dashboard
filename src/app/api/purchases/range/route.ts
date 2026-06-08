import {
  errorResponse,
  jsonResponse,
  parseJsonBody,
  validationErrorResponse,
} from "@/lib/api";
import { createPurchaseRangeSchema } from "@/lib/validators";
import { createPurchaseRange } from "@/services/purchase.service";

export async function POST(request: Request) {
  const body = await parseJsonBody<unknown>(request);

  if (!body) {
    return errorResponse("Invalid JSON body");
  }

  const parsed = createPurchaseRangeSchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const result = await createPurchaseRange(parsed.data);
    return jsonResponse(result, 201);
  } catch {
    return errorResponse("Failed to create purchase range", 500);
  }
}
