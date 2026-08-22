import { describe, expect, it } from "vitest";
import { parseEntityAlerts, sortAlerts } from "./adapters";
import { capAdapter } from "./adapters/cap";
import { meteoalarmAdapter } from "./adapters/meteoalarm";
import { resolveAlerts } from "./resolve";
import { summaryLabel } from "./summary";
import type { HassEntity, HomeAssistant } from "../types";

function entity(
  entity_id: string,
  state: string,
  attributes: Record<string, unknown>,
): HassEntity {
  return { entity_id, state, attributes };
}

function hass(states: Record<string, HassEntity>): HomeAssistant {
  return {
    states,
    config: { unit_system: { temperature: "°C", length: "km" } },
    connection: { subscribeMessage: async () => () => undefined },
    callWS: async () => {
      throw new Error("unused");
    },
  };
}

describe("meteoalarmAdapter", () => {
  const attrs = {
    attribution: "Information provided by MeteoAlarm",
    event: "Severe forest-fire warning",
    headline: "Orange forest-fire for Hedmark",
    description: "High grass fire hazard",
    instruction: "Be careful with open fire",
    severity: "Severe",
    awareness_level: "3; orange; Severe",
    awareness_type: "8; forest-fire",
    onset: "2019-05-02T22:00:00+00:00",
    expires: "2019-05-03T21:59:00+00:00",
  };

  it("detects MeteoAlarm attributes", () => {
    expect(meteoalarmAdapter.canHandle(attrs)).toBe(true);
  });

  it("returns empty when sensor is off", () => {
    expect(
      meteoalarmAdapter.parse("binary_sensor.meteoalarm", "off", attrs),
    ).toEqual([]);
  });

  it("parses a single active alert", () => {
    const alerts = meteoalarmAdapter.parse(
      "binary_sensor.meteoalarm",
      "on",
      attrs,
    );
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.severity).toBe("severe");
    expect(alerts[0]!.awarenessColor).toBe("orange");
    expect(alerts[0]!.headline).toContain("Orange");
    expect(alerts[0]!.description).toBe("High grass fire hazard");
    expect(alerts[0]!.instruction).toBe("Be careful with open fire");
  });
});

describe("capAdapter", () => {
  const attrs = {
    incident_platform_version: "1",
    id: "cap-alert-1",
    event: "Wind Warning",
    headline: "Orange wind warning",
    description: "Strong winds expected",
    instruction: "Secure loose objects",
    severity: "Severe",
    severity_normalized: "severe",
    onset: "2026-08-15T10:00:00+00:00",
    expires: "2026-08-15T18:00:00+00:00",
    phase: "new",
  };

  it("detects CAP attributes", () => {
    expect(capAdapter.canHandle(attrs)).toBe(true);
    expect(meteoalarmAdapter.canHandle(attrs)).toBe(false);
  });

  it("parses CAP alert entity", () => {
    const alerts = capAdapter.parse("sensor.cap_alert_wind", "severe", attrs);
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.id).toBe("cap-alert-1");
    expect(alerts[0]!.provider).toBe("cap");
    expect(alerts[0]!.severity).toBe("severe");
  });

  it("hides cancelled / expired phases", () => {
    expect(
      capAdapter.parse("sensor.cap_alert_wind", "severe", {
        ...attrs,
        phase: "cancel",
      }),
    ).toEqual([]);
  });

  it("hides MeteoAlarm green (no awareness needed)", () => {
    expect(
      capAdapter.parse("sensor.cap_heat", "unknown", {
        incident_platform_version: "1",
        id: "heat-1",
        event: "Hittewaarschuwing",
        headline: "Groene hittewaarschuwing",
        severity_normalized: "unknown",
        icon: "mdi:weather-sunny-alert",
        phase: "new",
        parameters: {
          awareness_level: "1; Green; Minor",
          awareness_type: "5; high-temperature",
        },
      }),
    ).toEqual([]);
  });

  it("keeps yellow+ CAP alerts and reads nested parameters", () => {
    const alerts = capAdapter.parse("sensor.cap_heat", "moderate", {
      incident_platform_version: "1",
      id: "heat-1",
      event: "Hittewaarschuwing",
      headline: "Gele hittewaarschuwing",
      severity_normalized: "moderate",
      icon: "mdi:weather-sunny-alert",
      phase: "new",
      parameters: {
        awareness_level: "2; Yellow; Moderate",
        awareness_type: "5; high-temperature",
      },
    });
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.severity).toBe("moderate");
    expect(alerts[0]!.awarenessColor).toBe("yellow");
    expect(alerts[0]!.awarenessTypeCode).toBe(5);
    expect(alerts[0]!.awarenessType).toBe("high-temperature");
    expect(alerts[0]!.providerIcon).toBe("mdi:weather-sunny-alert");
  });

  it("reads area_desc as location", () => {
    const alerts = capAdapter.parse("sensor.cap_heat", "moderate", {
      incident_platform_version: "1",
      id: "heat-2",
      event: "Gele waarschuwing voor hittegolf",
      headline: "Gele waarschuwing voor hittegolf in België - Henegouwen",
      area_desc: "Henegouwen",
      severity_normalized: "moderate",
      phase: "new",
    });
    expect(alerts[0]!.areaDesc).toBe("Henegouwen");
  });

  it("ignores non-mdi provider icons", () => {
    const alerts = capAdapter.parse("sensor.cap_alert_wind", "severe", {
      ...attrs,
      icon: "hass:alert",
    });
    expect(alerts[0]!.providerIcon).toBeUndefined();
  });
});

describe("resolveAlerts", () => {
  it("returns nothing when show_alerts is false", () => {
    const h = hass({
      "binary_sensor.meteoalarm": entity("binary_sensor.meteoalarm", "on", {
        attribution: "Information provided by MeteoAlarm",
        event: "Wind",
        headline: "Wind",
        awareness_level: "2; yellow; Moderate",
        awareness_type: "1; Wind",
      }),
    });
    expect(
      resolveAlerts(h, {
        show_alerts: false,
        alerts_entity: "binary_sensor.meteoalarm",
      }),
    ).toEqual([]);
  });

  it("reads core MeteoAlarm entity when enabled", () => {
    const h = hass({
      "binary_sensor.meteoalarm": entity("binary_sensor.meteoalarm", "on", {
        attribution: "Information provided by MeteoAlarm",
        event: "Wind",
        headline: "Yellow wind",
        awareness_level: "2; yellow; Moderate",
        awareness_type: "1; Wind",
        description: "Windy",
      }),
    });
    const alerts = resolveAlerts(h, {
      show_alerts: true,
      alerts_entity: "binary_sensor.meteoalarm",
    });
    expect(alerts).toHaveLength(1);
    expect(summaryLabel(alerts)).toBe("Wind");
  });

  it("discovers CAP children via device registry", () => {
    const h = hass({
      "sensor.cap_alerts_meteoalarm_alert_count": entity(
        "sensor.cap_alerts_meteoalarm_alert_count",
        "1",
        {},
      ),
      "sensor.cap_alerts_meteoalarm_cap_alert_wind_abc": entity(
        "sensor.cap_alerts_meteoalarm_cap_alert_wind_abc",
        "severe",
        {
          incident_platform_version: "1",
          id: "wind-1",
          event: "Wind",
          headline: "Orange wind",
          severity_normalized: "severe",
          awareness_level: "3; orange; Severe",
        },
      ),
    });
    h.entities = {
      "sensor.cap_alerts_meteoalarm_alert_count": {
        entity_id: "sensor.cap_alerts_meteoalarm_alert_count",
        device_id: "dev-cap",
      },
      "sensor.cap_alerts_meteoalarm_cap_alert_wind_abc": {
        entity_id: "sensor.cap_alerts_meteoalarm_cap_alert_wind_abc",
        device_id: "dev-cap",
      },
    };

    const alerts = resolveAlerts(h, {
      show_alerts: true,
      alerts_device: "dev-cap",
    });
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.id).toBe("wind-1");
  });

  it("sorts by severity", () => {
    const a = parseEntityAlerts(
      entity("sensor.a", "moderate", {
        incident_platform_version: "1",
        id: "a",
        event: "A",
        severity_normalized: "moderate",
      }),
    );
    const b = parseEntityAlerts(
      entity("sensor.b", "extreme", {
        incident_platform_version: "1",
        id: "b",
        event: "B",
        severity_normalized: "extreme",
      }),
    );
    const sorted = sortAlerts([...a, ...b]);
    expect(sorted[0]!.id).toBe("b");
  });
});
