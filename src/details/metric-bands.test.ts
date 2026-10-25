import { describe, expect, it } from "vitest";
import {
  cloudBand,
  dewComfort,
  pressureBand,
  visibilityBand,
} from "./metric-bands";

describe("metric-bands", () => {
  it("dewComfort cutoffs", () => {
    expect(dewComfort(null)).toBe("unknown");
    expect(dewComfort(9)).toBe("dry");
    expect(dewComfort(12)).toBe("comfortable");
    expect(dewComfort(18)).toBe("humid");
    expect(dewComfort(22)).toBe("muggy");
  });

  it("pressureBand cutoffs", () => {
    expect(pressureBand(995, "hPa")).toBe("low");
    expect(pressureBand(1013, "hPa")).toBe("normal");
    expect(pressureBand(1030, "hPa")).toBe("high");
    expect(pressureBand(30.5, "inHg")).toBe("high");
  });

  it("visibilityBand cutoffs", () => {
    expect(visibilityBand(0.5, "km")).toBe("fog");
    expect(visibilityBand(2, "km")).toBe("haze");
    expect(visibilityBand(10, "km")).toBe("clear");
  });

  it("cloudBand cutoffs", () => {
    expect(cloudBand(10)).toBe("clear");
    expect(cloudBand(40)).toBe("partly");
    expect(cloudBand(70)).toBe("mostly");
    expect(cloudBand(95)).toBe("overcast");
  });
});
