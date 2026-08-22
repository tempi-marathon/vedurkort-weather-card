import { describe, expect, it } from "vitest";
import {
  anchorEntityForDevice,
  deviceIdFromEntity,
  findCapAlertDevices,
  isCapAlertsEntity,
  isMeteoAlarmEntity,
  resolveCapDeviceId,
} from "./discovery";
import { resolveAlerts } from "./resolve";
import type { HassEntity, HomeAssistant } from "../types";

function entity(
  entity_id: string,
  state: string,
  attributes: Record<string, unknown> = {},
): HassEntity {
  return { entity_id, state, attributes };
}

function baseHass(states: Record<string, HassEntity>): HomeAssistant {
  return {
    states,
    config: { unit_system: { temperature: "°C", length: "km" } },
    connection: { subscribeMessage: async () => () => undefined },
    callWS: async () => {
      throw new Error("unused");
    },
  };
}

describe("findCapAlertDevices", () => {
  it("discovers devices via cap_alerts platform", () => {
    const hass = baseHass({
      "sensor.cap_alerts_nl_alert_count": entity(
        "sensor.cap_alerts_nl_alert_count",
        "0",
      ),
    });
    hass.entities = {
      "sensor.cap_alerts_nl_alert_count": {
        entity_id: "sensor.cap_alerts_nl_alert_count",
        device_id: "dev-nl",
        platform: "cap_alerts",
      },
    };
    hass.devices = {
      "dev-nl": { id: "dev-nl", name: "CAP Alerts MeteoAlarm NL" },
    };

    expect(findCapAlertDevices(hass)).toEqual([
      { id: "dev-nl", name: "CAP Alerts MeteoAlarm NL" },
    ]);
  });

  it("auto-selects the only CAP device", () => {
    const hass = baseHass({});
    hass.entities = {
      "sensor.cap_alerts_nl_alert_count": {
        entity_id: "sensor.cap_alerts_nl_alert_count",
        device_id: "dev-nl",
        platform: "cap_alerts",
      },
    };
    hass.devices = {
      "dev-nl": { id: "dev-nl", name: "CAP Alerts NL" },
    };
    expect(resolveCapDeviceId(hass)).toBe("dev-nl");
    expect(resolveCapDeviceId(hass, "explicit")).toBe("explicit");
  });
});

describe("alert entity helpers", () => {
  it("detects cap_alerts platform entities", () => {
    const hass = baseHass({
      "sensor.cap_alerts_nl_alert_count": entity(
        "sensor.cap_alerts_nl_alert_count",
        "0",
      ),
    });
    hass.entities = {
      "sensor.cap_alerts_nl_alert_count": {
        entity_id: "sensor.cap_alerts_nl_alert_count",
        device_id: "dev-nl",
        platform: "cap_alerts",
      },
    };
    expect(isCapAlertsEntity(hass, "sensor.cap_alerts_nl_alert_count")).toBe(
      true,
    );
    expect(deviceIdFromEntity(hass, "sensor.cap_alerts_nl_alert_count")).toBe(
      "dev-nl",
    );
    expect(anchorEntityForDevice(hass, "dev-nl")).toBe(
      "sensor.cap_alerts_nl_alert_count",
    );
  });

  it("detects core meteoalarm platform entities", () => {
    const hass = baseHass({
      "binary_sensor.meteoalarm": entity("binary_sensor.meteoalarm", "off", {
        attribution: "Information provided by MeteoAlarm",
      }),
    });
    hass.entities = {
      "binary_sensor.meteoalarm": {
        entity_id: "binary_sensor.meteoalarm",
        platform: "meteoalarm",
      },
    };
    expect(isMeteoAlarmEntity(hass, "binary_sensor.meteoalarm")).toBe(true);
    expect(isCapAlertsEntity(hass, "binary_sensor.meteoalarm")).toBe(false);
  });
});

describe("resolveAlerts auto CAP device", () => {
  it("uses the sole CAP device when no alerts_device is set", () => {
    const hass = baseHass({
      "sensor.cap_alerts_nl_cap_alert_wind": entity(
        "sensor.cap_alerts_nl_cap_alert_wind",
        "severe",
        {
          incident_platform_version: "1",
          id: "wind-1",
          event: "Wind",
          headline: "Orange wind",
          severity_normalized: "severe",
        },
      ),
    });
    hass.entities = {
      "sensor.cap_alerts_nl_cap_alert_wind": {
        entity_id: "sensor.cap_alerts_nl_cap_alert_wind",
        device_id: "dev-nl",
        platform: "cap_alerts",
      },
    };

    const alerts = resolveAlerts(hass, { show_alerts: true });
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.id).toBe("wind-1");
  });

  it("does not auto-use CAP when only an entity is configured", () => {
    const hass = baseHass({
      "binary_sensor.meteoalarm": entity("binary_sensor.meteoalarm", "on", {
        attribution: "Information provided by MeteoAlarm",
        event: "Wind",
        headline: "Yellow wind",
        awareness_level: "2; yellow; Moderate",
        awareness_type: "1; Wind",
      }),
      "sensor.cap_alerts_nl_cap_alert_wind": entity(
        "sensor.cap_alerts_nl_cap_alert_wind",
        "severe",
        {
          incident_platform_version: "1",
          id: "wind-1",
          event: "Wind",
          severity_normalized: "severe",
        },
      ),
    });
    hass.entities = {
      "sensor.cap_alerts_nl_cap_alert_wind": {
        entity_id: "sensor.cap_alerts_nl_cap_alert_wind",
        device_id: "dev-nl",
        platform: "cap_alerts",
      },
    };

    const alerts = resolveAlerts(hass, {
      show_alerts: true,
      alerts_entities: ["binary_sensor.meteoalarm"],
    });
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.provider).toBe("meteoalarm");
  });
});
