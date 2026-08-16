import type { MeteoconName } from "../icons/allowlist";

/** Format onset/expires for alert detail (date + time). */
export function formatAlertDateTime(
  iso: string | undefined,
  language?: string,
): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(language ?? undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export type { MeteoconName };
