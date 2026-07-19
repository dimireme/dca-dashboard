export function formatUsdt(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatUsdWhole(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatBtc(value: number): string {
  return `${value.toFixed(6)} BTC`;
}

export function formatNumber(value: number, digits = 2): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function formatDateTime(iso: string | null): string {
  if (!iso) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatStrategySummary(amountUsdc: number, intervalHours: number): string {
  return `${formatUsdt(amountUsdc)} · every ${intervalHours}h`;
}

/** Shorten a hash with an ellipsis in the middle, e.g. 0x1234…abcd */
export function formatTxHash(hash: string, head = 6, tail = 4): string {
  if (hash.length <= head + tail + 1) {
    return hash;
  }

  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}
