export function resolveNextExecutionAtForCreate(enabled: boolean): Date | null {
  return enabled ? new Date() : null;
}

export function resolveNextExecutionAtForUpdate(
  enabled: boolean,
  currentNextExecutionAt: string | null,
  wasEnabled: boolean,
): Date | null | undefined {
  if (!enabled) {
    return undefined;
  }

  if (!wasEnabled && enabled) {
    return currentNextExecutionAt ? new Date(currentNextExecutionAt) : new Date();
  }

  return undefined;
}
