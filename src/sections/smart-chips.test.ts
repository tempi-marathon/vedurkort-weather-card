import { describe, expect, it } from "vitest";
import {
  chipSeverity,
  demotePrimaryChips,
  isChipNoteworthy,
  isPrecipCondition,
  MORE_PACK_UNDEMOTE_SPARE_PX,
  nextMorePackDemotions,
  partitionSmartChips,
  resolveDetailChips,
  type SmartChipValues,
} from "./smart-chips";

const base: SmartChipValues = {
  condition: "sunny",
  humidity: 50,
  windBft: 2,
  gustBft: 2,
  uvIndex: 1,
  pressure: 1013,
  pressureUnit: "hPa",
  cloudCoverage: 40,
  dewPoint: 12,
  visibility: 10,
  visibilityUnit: "km",
  precipitation: 0,
  precipitationProbability: 10,
  pollenLevel: "none",
};

describe("isPrecipCondition", () => {
  it("covers wet HA conditions", () => {
    expect(isPrecipCondition("rainy")).toBe(true);
    expect(isPrecipCondition("pouring")).toBe(true);
    expect(isPrecipCondition("snowy-rainy")).toBe(true);
    expect(isPrecipCondition("sunny")).toBe(false);
  });
});

describe("isChipNoteworthy", () => {
  it("always keeps sun; never keeps cloud coverage", () => {
    expect(isChipNoteworthy("sun", base)).toBe(true);
    expect(isChipNoteworthy("cloud_coverage", base)).toBe(false);
  });

  it("UV only from moderate up", () => {
    expect(isChipNoteworthy("uv_index", { ...base, uvIndex: 2 })).toBe(false);
    expect(isChipNoteworthy("uv_index", { ...base, uvIndex: 3 })).toBe(true);
    expect(isChipNoteworthy("uv_index", { ...base, uvIndex: 8 })).toBe(true);
  });

  it("wind at Bft ≥ 4 or gust ≥ 5", () => {
    expect(isChipNoteworthy("wind", { ...base, windBft: 3, gustBft: 3 })).toBe(
      false,
    );
    expect(isChipNoteworthy("wind", { ...base, windBft: 4, gustBft: 3 })).toBe(
      true,
    );
    expect(isChipNoteworthy("wind", { ...base, windBft: 2, gustBft: 5 })).toBe(
      true,
    );
  });

  it("precip amount and probability rules", () => {
    expect(isChipNoteworthy("precipitation", base)).toBe(false);
    expect(
      isChipNoteworthy("precipitation", { ...base, precipitation: 0.2 }),
    ).toBe(true);

    expect(isChipNoteworthy("precipitation_probability", base)).toBe(false);
    expect(
      isChipNoteworthy("precipitation_probability", {
        ...base,
        precipitationProbability: 40,
      }),
    ).toBe(true);
    expect(
      isChipNoteworthy("precipitation_probability", {
        ...base,
        precipitationProbability: 10,
        condition: "rainy",
      }),
    ).toBe(true);
  });

  it("humidity / dew / pressure / visibility extremes only", () => {
    expect(isChipNoteworthy("humidity", base)).toBe(false);
    expect(isChipNoteworthy("humidity", { ...base, humidity: 25 })).toBe(true);
    expect(isChipNoteworthy("humidity", { ...base, humidity: 75 })).toBe(true);

    expect(isChipNoteworthy("dew_point", base)).toBe(false);
    expect(isChipNoteworthy("dew_point", { ...base, dewPoint: 8 })).toBe(true);

    expect(isChipNoteworthy("pressure", base)).toBe(false);
    expect(isChipNoteworthy("pressure", { ...base, pressure: 990 })).toBe(true);

    expect(isChipNoteworthy("visibility", base)).toBe(false);
    expect(
      isChipNoteworthy("visibility", { ...base, visibility: 0.4 }),
    ).toBe(true);
  });

  it("pollen when not none", () => {
    expect(isChipNoteworthy("pollen", base)).toBe(false);
    expect(isChipNoteworthy("pollen", { ...base, pollenLevel: "low" })).toBe(
      true,
    );
  });
});

describe("partitionSmartChips", () => {
  it("puts quiet chips in overflow and severity-sorts primary", () => {
    const values: SmartChipValues = {
      ...base,
      uvIndex: 8,
      windBft: 5,
      gustBft: 5,
      precipitation: 2,
      humidity: 50,
      cloudCoverage: 80,
      pollenLevel: "none",
    };
    const { primary, overflow } = partitionSmartChips(
      [
        "sun",
        "humidity",
        "wind",
        "uv_index",
        "cloud_coverage",
        "precipitation",
      ],
      values,
    );

    expect(primary[0]).toBe("sun");
    expect(primary.slice(1)).toEqual(["precipitation", "uv_index", "wind"]);
    expect(overflow).toEqual(["humidity", "cloud_coverage"]);
  });

  it("ranks higher UV ahead of lower UV when both noteworthy", () => {
    const values: SmartChipValues = {
      ...base,
      uvIndex: 9,
      windBft: 4,
      gustBft: 4,
      visibility: 2,
    };
    const { primary } = partitionSmartChips(
      ["wind", "uv_index", "visibility"],
      values,
    );
    expect(primary[0]).toBe("uv_index");
    expect(chipSeverity("uv_index", values)).toBeGreaterThan(
      chipSeverity("wind", values),
    );
  });

  it("keeps overflow in config order", () => {
    const { overflow } = partitionSmartChips(
      ["cloud_coverage", "humidity", "pressure", "dew_point"],
      base,
    );
    expect(overflow).toEqual([
      "humidity",
      "pressure",
      "cloud_coverage",
      "dew_point",
    ]);
  });
});

describe("resolveDetailChips", () => {
  const available = [
    "sun",
    "humidity",
    "wind",
    "uv_index",
    "cloud_coverage",
  ] as const;

  it("when smart is off, keeps full available order and no overflow", () => {
    const { primary, overflow } = resolveDetailChips(false, available, {
      ...base,
      uvIndex: 1,
      windBft: 2,
      humidity: 50,
    });
    expect(primary).toEqual([...available]);
    expect(overflow).toEqual([]);
  });

  it("when smart is on, partitions noteworthy vs More", () => {
    const { primary, overflow } = resolveDetailChips(true, available, {
      ...base,
      uvIndex: 8,
      windBft: 5,
      humidity: 50,
    });
    expect(primary[0]).toBe("sun");
    expect(primary).toContain("uv_index");
    expect(primary).toContain("wind");
    expect(overflow).toEqual(["humidity", "cloud_coverage"]);
  });
});

describe("demotePrimaryChips", () => {
  it("puts demoted chips at the top of More in on-row order, never sun", () => {
    const packed = demotePrimaryChips(
      {
        primary: ["sun", "precipitation", "wind", "uv_index"],
        overflow: ["humidity", "cloud_coverage"],
      },
      2,
    );
    expect(packed.primary).toEqual(["sun", "precipitation"]);
    // wind then uv (row order), then quiet overflow
    expect(packed.overflow).toEqual([
      "wind",
      "uv_index",
      "humidity",
      "cloud_coverage",
    ]);
  });

  it("no-ops when count is 0", () => {
    const input = {
      primary: ["sun", "wind"] as const,
      overflow: ["humidity"] as const,
    };
    expect(demotePrimaryChips({ ...input, primary: [...input.primary], overflow: [...input.overflow] }, 0)).toEqual({
      primary: ["sun", "wind"],
      overflow: ["humidity"],
    });
  });
});

describe("nextMorePackDemotions", () => {
  const base = {
    smartChips: true,
    hasMore: true,
    moreWrapped: false,
    sparePx: 0,
    primaryCount: 3,
    current: 0,
  };

  it("returns 0 when smart is off or More is missing", () => {
    expect(
      nextMorePackDemotions({ ...base, smartChips: false, current: 2 }),
    ).toBe(0);
    expect(nextMorePackDemotions({ ...base, hasMore: false, current: 2 })).toBe(
      0,
    );
  });

  it("demotes when More wraps", () => {
    expect(
      nextMorePackDemotions({ ...base, moreWrapped: true, current: 0 }),
    ).toBe(1);
  });

  it("clamps stale current above max demote", () => {
    expect(
      nextMorePackDemotions({
        ...base,
        primaryCount: 2,
        current: 5,
        moreWrapped: false,
        sparePx: 0,
      }),
    ).toBe(1);
  });

  it("undemotes only with clear spare hysteresis", () => {
    expect(
      nextMorePackDemotions({
        ...base,
        current: 1,
        moreWrapped: false,
        sparePx: MORE_PACK_UNDEMOTE_SPARE_PX,
      }),
    ).toBe(1);
    expect(
      nextMorePackDemotions({
        ...base,
        current: 1,
        moreWrapped: false,
        sparePx: MORE_PACK_UNDEMOTE_SPARE_PX + 1,
      }),
    ).toBe(0);
  });

  it("does not undemote while still wrapped", () => {
    expect(
      nextMorePackDemotions({
        ...base,
        current: 1,
        moreWrapped: true,
        sparePx: 500,
        primaryCount: 2,
      }),
    ).toBe(1);
  });
});
