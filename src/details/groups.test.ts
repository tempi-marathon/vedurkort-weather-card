import { describe, expect, it } from "vitest";
import { chartMetricId, groupTitleKey, metricGroup } from "./groups";

describe("metric groups", () => {
  it("groups wind chips", () => {
    expect(metricGroup("wind_speed")).toBe("wind");
    expect(metricGroup("wind_gust")).toBe("wind");
    expect(metricGroup("wind_direction")).toBe("wind");
    expect(chartMetricId("wind_direction")).toBe("wind_speed");
  });

  it("keeps humidity and dew point as separate groups", () => {
    expect(metricGroup("humidity")).toBe("humidity");
    expect(metricGroup("dew_point")).toBe("dew_point");
    expect(chartMetricId("dew_point")).toBe("dew_point");
    expect(groupTitleKey("dew_point")).toBe("dew_point");
  });

  it("keeps precip chart on tapped chip", () => {
    expect(metricGroup("precipitation_probability")).toBe("precipitation");
    expect(chartMetricId("precipitation_probability")).toBe(
      "precipitation_probability",
    );
  });

  it("uses shared group titles", () => {
    expect(groupTitleKey("wind")).toBe("wind");
    expect(groupTitleKey("precipitation")).toBe("precipitation");
  });
});
