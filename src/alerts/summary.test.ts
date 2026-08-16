import { describe, expect, it } from "vitest";
import {
  formatAlertTimeStatus,
  formatDurationMs,
  sanitizeAlertHtml,
} from "./format";
import { alertIconName, alertSubtitle, summaryLabel } from "./summary";
import type { WeatherAlert } from "./types";

function alert(partial: Partial<WeatherAlert>): WeatherAlert {
  return {
    id: "1",
    provider: "cap",
    event: "Wind",
    headline: "Wind",
    description: "",
    instruction: "",
    severity: "moderate",
    severityLabel: "Moderate",
    ...partial,
  };
}

describe("alertIconName", () => {
  it("prefers awareness_type code over everything else", () => {
    expect(
      alertIconName(
        alert({
          event: "Mistwaarschuwing",
          awarenessTypeCode: 4,
          awarenessType: "fog",
          providerIcon: "mdi:weather-sunny-alert",
        }),
      ),
    ).toBe("fog");
    expect(
      alertIconName(
        alert({
          event: "Hittewaarschuwing",
          awarenessTypeCode: 5,
          providerIcon: "mdi:weather-fog",
        }),
      ),
    ).toBe("clear-day");
  });

  it("uses English awareness_type label when code is missing", () => {
    expect(
      alertIconName(alert({ event: "Waarschuwing", awarenessType: "fog" })),
    ).toBe("fog");
    expect(
      alertIconName(
        alert({ event: "Waarschuwing", awarenessType: "high-temperature" }),
      ),
    ).toBe("clear-day");
    expect(
      alertIconName(
        alert({ event: "Waarschuwing", awarenessType: "snow-ice" }),
      ),
    ).toBe("sleet");
    expect(
      alertIconName(
        alert({ event: "Waarschuwing", awarenessType: "forest-fire" }),
      ),
    ).toBe("weather-alert");
  });

  it("maps provider MDI to a Meteocon, never returns MDI", () => {
    expect(
      alertIconName(
        alert({
          event: "Localized title",
          providerIcon: "mdi:weather-sunny-alert",
        }),
      ),
    ).toBe("clear-day");
    expect(
      alertIconName(
        alert({ event: "Localized title", providerIcon: "mdi:weather-fog" }),
      ),
    ).toBe("fog");
    const icon = alertIconName(
      alert({ event: "x", providerIcon: "mdi:weather-windy" }),
    );
    expect(icon).toBe("wind");
    expect(icon.startsWith("mdi:")).toBe(false);
  });

  it("ignores non-mdi provider icons and falls back to severity", () => {
    expect(
      alertIconName(
        alert({
          event: "Anything",
          severity: "severe",
          providerIcon: "hass:alert",
        }),
      ),
    ).toBe("code-orange");
  });

  it("does not use localized event text for icons", () => {
    expect(alertIconName(alert({ event: "Mistwaarschuwing" }))).toBe(
      "code-yellow",
    );
    expect(alertIconName(alert({ event: "Minor fog warning" }))).toBe(
      "code-yellow",
    );
  });
});

describe("summaryLabel", () => {
  it("uses the event title for a single alert", () => {
    expect(
      summaryLabel([
        alert({
          event: "Gele waarschuwing voor hittegolf",
          awarenessColor: "yellow",
        }),
      ]),
    ).toBe("Gele waarschuwing voor hittegolf");
  });

  it("lists count plus top event without color", () => {
    expect(
      summaryLabel([
        alert({
          id: "a",
          event: "Hittegolf",
          awarenessColor: "yellow",
        }),
        alert({
          id: "b",
          event: "Mist",
          awarenessColor: "yellow",
        }),
      ]),
    ).toBe("2 alerts · Hittegolf");
  });
});

describe("alertSubtitle", () => {
  it("shows location from headline without repeating the title", () => {
    expect(
      alertSubtitle(
        alert({
          event: "Gele waarschuwing voor hittegolf",
          headline:
            "Gele waarschuwing voor hittegolf in België - Henegouwen",
          areaDesc: "Henegouwen",
        }),
      ),
    ).toBe("België - Henegouwen");
  });

  it("falls back to area_desc when headline has no stripable location", () => {
    expect(
      alertSubtitle(
        alert({
          event: "Wind",
          headline: "Wind",
          areaDesc: "Zuid-Holland",
        }),
      ),
    ).toBe("Zuid-Holland");
  });

  it("hides secondary line when there is no location", () => {
    expect(alertSubtitle(alert({ event: "Wind", headline: "Wind" }))).toBe(
      undefined,
    );
  });
});

describe("formatDurationMs", () => {
  it("floors minute/hour boundaries", () => {
    expect(formatDurationMs(59_000)).toBe("<1m");
    expect(formatDurationMs(3_599_000)).toBe("59m");
    expect(formatDurationMs(3_600_000)).toBe("1h");
    expect(formatDurationMs(5_400_000)).toBe("1h 30m");
    expect(formatDurationMs(7_199_000)).toBe("1h 59m");
    expect(formatDurationMs(90_000_000)).toBe("1d 1h");
  });
});

describe("formatAlertTimeStatus", () => {
  const now = Date.parse("2026-08-16T12:00:00Z");

  it("shows Ends in when active with future expiry", () => {
    expect(
      formatAlertTimeStatus(
        alert({
          onset: "2026-08-16T08:00:00Z",
          expires: "2026-08-16T18:00:00Z",
        }),
        now,
      ),
    ).toBe("Ends in 6h");
  });

  it("shows Starts in when onset is in the future", () => {
    expect(
      formatAlertTimeStatus(
        alert({
          onset: "2026-08-16T14:30:00Z",
          expires: "2026-08-16T20:00:00Z",
        }),
        now,
      ),
    ).toBe("Starts in 2h 30m");
  });

  it("shows Ended ago when past expiry", () => {
    expect(
      formatAlertTimeStatus(
        alert({
          onset: "2026-08-16T08:00:00Z",
          expires: "2026-08-16T10:00:00Z",
        }),
        now,
      ),
    ).toBe("Ended 2h ago");
  });

  it("shows Started ago when active without expiry", () => {
    expect(
      formatAlertTimeStatus(alert({ onset: "2026-08-16T10:00:00Z" }), now),
    ).toBe("Started 2h ago");
  });
});

describe("sanitizeAlertHtml", () => {
  it("escapes plain text and keeps newlines", () => {
    expect(sanitizeAlertHtml("a < b\nc")).toBe("a &lt; b<br>c");
  });

  it("strips unsafe tags when DOMParser is available", () => {
    if (typeof DOMParser === "undefined") return;
    const html = sanitizeAlertHtml(
      '<p>Hi</p><script>alert(1)</script><a href="https://example.com">x</a>',
    );
    expect(html).toContain("<p>Hi</p>");
    expect(html).not.toContain("script");
    expect(html).toContain('href="https://example.com"');
  });
});
