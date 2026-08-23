import { describe, expect, it } from "vitest";
import { chartMetricId, groupTitleKey, metricGroup } from "./groups";

describe("metric groups", () => {
  it("groups wind chips", () => {
    expect(metricGroup("wind_speed")).toBe("wind");
    expect(metricGroup("wind_gust")).toBe("wind");
    expect(metricGroup("wind_direction")).toBe("wind");
    expect(chartMetricId("wind_direction")).toBe("wind_speed");
  });

  it("groups humidity chips", () => {
    expect(metricGroup("dew_point")).toBe("humidity");
    expect(chartMetricId("dew_point")).toBe("humidity");
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
