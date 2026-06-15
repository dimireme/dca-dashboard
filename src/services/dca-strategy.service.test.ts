import { describe, expect, it } from "vitest";
import {
  resolveNextExecutionAtForCreate,
  resolveNextExecutionAtForUpdate,
} from "@/lib/dca-strategy-schedule";

describe("dca-strategy.service scheduling", () => {
  it("sets nextExecutionAt on create when enabled", () => {
    const next = resolveNextExecutionAtForCreate(true);
    expect(next).toBeInstanceOf(Date);
  });

  it("clears nextExecutionAt on create when disabled", () => {
    expect(resolveNextExecutionAtForCreate(false)).toBeNull();
  });

  it("sets nextExecutionAt when enabling a paused strategy without schedule", () => {
    const next = resolveNextExecutionAtForUpdate(true, null, false);
    expect(next).toBeInstanceOf(Date);
  });

  it("keeps existing nextExecutionAt when re-enabling", () => {
    const existing = "2026-06-14T10:00:00.000Z";
    const next = resolveNextExecutionAtForUpdate(true, existing, false);
    expect(next?.toISOString()).toBe(existing);
  });

  it("does not change nextExecutionAt when staying enabled", () => {
    expect(resolveNextExecutionAtForUpdate(true, null, true)).toBeUndefined();
  });

  it("does not change nextExecutionAt when disabling", () => {
    expect(resolveNextExecutionAtForUpdate(false, "2026-06-14T10:00:00.000Z", true)).toBeUndefined();
  });
});
