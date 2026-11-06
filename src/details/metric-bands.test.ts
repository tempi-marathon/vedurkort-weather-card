import { describe, expect, it } from "vitest";
import {
  cloudBand,
  dewComfort,
  isDewPointChipNoteworthy,
  isHumidityChipNoteworthy,
  isPressureChipNoteworthy,
  pressureBand,
  pressureToHpa,
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

describe("chip noteworthy helpers", () => {
  it("humidity: ≤ 25 or ≥ 80, nothing for missing", () => {
    expect(isHumidityChipNoteworthy(25)).toBe(true);
    expect(isHumidityChipNoteworthy(26)).toBe(false);
    expect(isHumidityChipNoteworthy(79)).toBe(false);
    expect(isHumidityChipNoteworthy(80)).toBe(true);
    expect(isHumidityChipNoteworthy(null)).toBe(false);
    expect(isHumidityChipNoteworthy(NaN)).toBe(false);
  });

  it("dew point: < 5 °C or ≥ 18 °C, including °F input", () => {
    expect(isDewPointChipNoteworthy(4.9)).toBe(true);
    expect(isDewPointChipNoteworthy(5)).toBe(false);
    expect(isDewPointChipNoteworthy(17.9)).toBe(false);
    expect(isDewPointChipNoteworthy(18)).toBe(true);
    expect(isDewPointChipNoteworthy(40, "°F")).toBe(true);
    expect(isDewPointChipNoteworthy(41, "°F")).toBe(false);
    expect(isDewPointChipNoteworthy(64, "°F")).toBe(false);
    expect(isDewPointChipNoteworthy(65, "°F")).toBe(true);
    expect(isDewPointChipNoteworthy(undefined)).toBe(false);
  });

  it("pressure: < 990 or > 1030 hPa in any unit", () => {
    expect(isPressureChipNoteworthy(989, "hPa")).toBe(true);
    expect(isPressureChipNoteworthy(990, "hPa")).toBe(false);
    expect(isPressureChipNoteworthy(1030, "hPa")).toBe(false);
    expect(isPressureChipNoteworthy(1031, "hPa")).toBe(true);
    expect(isPressureChipNoteworthy(98.5, "kPa")).toBe(true);
    expect(isPressureChipNoteworthy(30.5, "inHg")).toBe(true);
    expect(isPressureChipNoteworthy(30.0, "inHg")).toBe(false);
    expect(isPressureChipNoteworthy(760, "mmHg")).toBe(false);
    expect(isPressureChipNoteworthy(null, "hPa")).toBe(false);
  });

  it("reads mmHg as mmHg, not hPa", () => {
    expect(pressureToHpa(760, "mmHg")).toBeCloseTo(1013.2, 0);
    expect(pressureBand(760, "mmHg")).toBe("normal");
    expect(pressureBand(730, "mmHg")).toBe("low");
    expect(pressureBand(780, "mmHg")).toBe("high");
  });

  it("keeps the comfort and pressure bands unchanged", () => {
    expect(dewComfort(9.9)).toBe("dry");
    expect(dewComfort(16)).toBe("humid");
    expect(pressureBand(999, "hPa")).toBe("low");
    expect(pressureBand(1026, "hPa")).toBe("high");
    expect(pressureBand(1000, "hPa")).toBe("normal");
  });
});
