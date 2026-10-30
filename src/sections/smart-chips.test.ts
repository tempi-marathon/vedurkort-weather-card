import { describe, expect, it } from "vitest";
import {
  chipSeverity,
  computeChipLayout,
  demotePrimaryChips,
  dropChip,
  isChipNoteworthy,
  isPrecipCondition,
  moveChip,
  MORE_PACK_UNDEMOTE_SPARE_PX,
  nextMorePackDemotions,
  partitionSmartChips,
  resolveChipOrder,
  resolveDetailChips,
  SMART_CHIP_ORDER,
  type MorePackLatch,
  type MorePackMeasure,
  type SmartChipId,
  type SmartChipValues,
} from "./smart-chips";
import { SYNODIC_MONTH_DAYS } from "../details/moon-phase";

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
  nowMs: 0,
  sunNextEventMs: null,
  moonAgeDays: 7,
  order: SMART_CHIP_ORDER,
};

const HOUR = 3_600_000;
const S = SYNODIC_MONTH_DAYS;
/** Sun event 30 min away and the moon at full → both noteworthy. */
const nearBoth: Partial<SmartChipValues> = {
  nowMs: 0,
  sunNextEventMs: HOUR / 2,
  moonAgeDays: S / 2,
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
  it("never keeps cloud coverage", () => {
    expect(isChipNoteworthy("cloud_coverage", base)).toBe(false);
  });

  it("sun only within 60 min before the next sunrise/sunset", () => {
    const at = (min: number) => ({ ...base, nowMs: 0, sunNextEventMs: min * 60_000 });
    expect(isChipNoteworthy("sun", at(30))).toBe(true);
    expect(isChipNoteworthy("sun", at(60))).toBe(true);
    expect(isChipNoteworthy("sun", at(61))).toBe(false);
    expect(isChipNoteworthy("sun", at(0))).toBe(false);
    expect(isChipNoteworthy("sun", at(-5))).toBe(false);
    // No sun data → not noteworthy (lands in More, not hidden).
    expect(isChipNoteworthy("sun", { ...base, sunNextEventMs: null })).toBe(false);
  });

  it("moon only within 24h of a major phase", () => {
    expect(isChipNoteworthy("moon", { ...base, moonAgeDays: S / 2 - 0.5 })).toBe(true);
    expect(isChipNoteworthy("moon", { ...base, moonAgeDays: S / 2 + 3 })).toBe(false);
    expect(isChipNoteworthy("moon", { ...base, moonAgeDays: S / 4 })).toBe(true);
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
      ...nearBoth,
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

  it("ranks a near sun first and a near moon last", () => {
    const values: SmartChipValues = {
      ...base,
      ...nearBoth,
      uvIndex: 9,
      precipitation: 5,
      visibility: 0.4,
      pressure: 980,
    };
    const { primary } = partitionSmartChips(
      ["precipitation", "moon", "uv_index", "sun", "visibility", "pressure"],
      values,
    );
    expect(primary[0]).toBe("sun");
    expect(primary[primary.length - 1]).toBe("moon");
    expect(primary.indexOf("pressure")).toBeLessThan(primary.indexOf("moon"));
    expect(chipSeverity("sun", values)).toBe(10_000);
    expect(chipSeverity("moon", values)).toBe(1);
  });

  it("sends sun and moon to More when no change is near", () => {
    const values: SmartChipValues = {
      ...base,
      nowMs: 0,
      sunNextEventMs: 2 * HOUR,
      moonAgeDays: S / 2 + 3,
      precipitation: 5,
    };
    const { primary, overflow } = partitionSmartChips(
      ["sun", "moon", "precipitation"],
      values,
    );
    expect(primary).toEqual(["precipitation"]);
    expect(overflow).toEqual(["sun", "moon"]);
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

  it("when smart is off, sun and moon stay primary even when not near", () => {
    const { primary } = resolveDetailChips(false, ["sun", "moon", "wind"], {
      ...base,
      sunNextEventMs: null,
      moonAgeDays: S / 2 + 3,
    });
    expect(primary).toEqual(["sun", "moon", "wind"]);
  });

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
      ...nearBoth,
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
  it("puts demoted chips at the top of More in on-row order", () => {
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

  it("demotes a near moon first (it ranks last on the row)", () => {
    const packed = demotePrimaryChips(
      {
        primary: ["sun", "wind", "uv_index", "moon"],
        overflow: ["humidity"],
      },
      1,
    );
    expect(packed.primary).toEqual(["sun", "wind", "uv_index"]);
    expect(packed.overflow).toEqual(["moon", "humidity"]);
  });

  it("no longer skips sun or moon when demoting", () => {
    const packed = demotePrimaryChips(
      { primary: ["sun", "moon"], overflow: [] },
      1,
    );
    expect(packed.primary).toEqual(["sun"]);
    expect(packed.overflow).toEqual(["moon"]);
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
      nextMorePackDemotions({ ...base, smartChips: false, current: 2 }).demotions,
    ).toBe(0);
    expect(nextMorePackDemotions({ ...base, hasMore: false, current: 2 }).demotions).toBe(
      0,
    );
  });

  it("demotes when More wraps", () => {
    expect(
      nextMorePackDemotions({ ...base, moreWrapped: true, current: 0 }).demotions,
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
      }).demotions,
    ).toBe(1);
  });

  it("undemotes only with clear spare hysteresis", () => {
    expect(
      nextMorePackDemotions({
        ...base,
        current: 1,
        moreWrapped: false,
        sparePx: MORE_PACK_UNDEMOTE_SPARE_PX,
      }).demotions,
    ).toBe(1);
    expect(
      nextMorePackDemotions({
        ...base,
        current: 1,
        moreWrapped: false,
        sparePx: MORE_PACK_UNDEMOTE_SPARE_PX + 1,
      }).demotions,
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
      }).demotions,
    ).toBe(1);
  });
});

describe("nextMorePackDemotions (fit-aware + latch)", () => {
  const m: MorePackMeasure = {
    smartChips: true,
    hasMore: true,
    moreWrapped: false,
    sparePx: 0,
    primaryCount: 3,
    current: 1,
    preCount: 4,
    nextReturnWidthPx: 118,
    columnGapPx: 16,
    containerWidthPx: 585,
    key: "sun,moon,precipitation,wind",
    latch: null,
  };

  it("(a) stays demoted when spare clears 120px but the chip does not fit", () => {
    expect(nextMorePackDemotions({ ...m, sparePx: 125 }).demotions).toBe(1);
  });

  it("(b) undemotes when spare covers chip + gap + 8px", () => {
    expect(nextMorePackDemotions({ ...m, sparePx: 118 + 16 + 8 }).demotions).toBe(0);
    expect(nextMorePackDemotions({ ...m, sparePx: 118 + 16 + 7 }).demotions).toBe(1);
  });

  it("(c) falls back to the 120px threshold when width is unknown", () => {
    const unknown = { ...m, nextReturnWidthPx: null };
    expect(
      nextMorePackDemotions({ ...unknown, sparePx: MORE_PACK_UNDEMOTE_SPARE_PX }).demotions,
    ).toBe(1);
    expect(
      nextMorePackDemotions({ ...unknown, sparePx: MORE_PACK_UNDEMOTE_SPARE_PX + 1 }).demotions,
    ).toBe(0);
  });

  it("(d) demoting on wrap sets a latch at this width", () => {
    const r = nextMorePackDemotions({ ...m, current: 0, primaryCount: 4, moreWrapped: true });
    expect(r.demotions).toBe(1);
    expect(r.latch).toEqual({ widthPx: 585, minStable: 1, key: m.key });
  });

  it("(e) never undemotes below the latch at the same width and key", () => {
    const latch: MorePackLatch = { widthPx: 586, minStable: 1, key: m.key! };
    const r = nextMorePackDemotions({ ...m, sparePx: 900, latch });
    expect(r.demotions).toBe(1);
    expect(r.latch).toEqual(latch);
  });

  it("(f) clears the latch on width change > 2px or key change", () => {
    const latch: MorePackLatch = { widthPx: 585, minStable: 1, key: m.key! };
    const wider = nextMorePackDemotions({
      ...m,
      containerWidthPx: 700,
      sparePx: 300,
      latch,
    });
    expect(wider.latch).toBeNull();
    expect(wider.demotions).toBe(0);
    const rekeyed = nextMorePackDemotions({
      ...m,
      key: "sun,precipitation,wind",
      sparePx: 300,
      latch,
    });
    expect(rekeyed.latch).toBeNull();
    expect(rekeyed.demotions).toBe(0);
  });

  it("(h) clamps: off/missing More → 0; never above primaryCount - 1", () => {
    expect(nextMorePackDemotions({ ...m, smartChips: false }).demotions).toBe(0);
    expect(nextMorePackDemotions({ ...m, hasMore: false }).demotions).toBe(0);
    expect(
      nextMorePackDemotions({ ...m, current: 0, primaryCount: 1, preCount: 1, moreWrapped: true })
        .demotions,
    ).toBe(0);
  });

  it("caps by the pre-demotion count, so two demotions stay put", () => {
    // Old rule capped at rendered primaryCount − 1 = 1 and forced a flip.
    const r = nextMorePackDemotions({
      ...m,
      current: 2,
      primaryCount: 2,
      preCount: 4,
      sparePx: 10,
    });
    expect(r.demotions).toBe(2);
  });

  it("(i) a demotion keeps the latch when the pre-demotion key is unchanged", () => {
    const first = nextMorePackDemotions({ ...m, current: 0, primaryCount: 4, moreWrapped: true });
    const next = nextMorePackDemotions({
      ...m,
      current: first.demotions,
      sparePx: 900,
      latch: first.latch,
    });
    expect(next.latch).toEqual(first.latch);
    expect(next.demotions).toBe(1);
  });

  /**
   * Recording (13:17:35 ↔ 13:17:43): sun, moon, 1.4 mm, wind 4 Bft · S, More.
   * Flex-wrap simulation at a width where the old fixed 120px rule flips.
   */
  describe("(g) recording scenario converges", () => {
    const GAP = 16;
    const widths: Record<string, number> = {
      sun: 90,
      moon: 160,
      precipitation: 90,
      wind: 118,
      more: 70,
    };
    const row = ["sun", "moon", "precipitation", "wind"];

    function layout(W: number, demotions: number) {
      const items = [...row.slice(0, row.length - demotions), "more"];
      let x = 0;
      let line = 0;
      let moreRight = 0;
      for (const id of items) {
        const w = widths[id]!;
        if (x > 0 && x + GAP + w > W) {
          line += 1;
          x = w;
        } else {
          x += (x > 0 ? GAP : 0) + w;
        }
        if (id === "more") moreRight = x;
      }
      return {
        moreWrapped: line > 0,
        sparePx: W - moreRight,
        primaryCount: items.length - 1,
      };
    }

    function run(W: number, useWidths: boolean, steps = 20) {
      let demotions = 0;
      let latch: MorePackLatch | null = null;
      const seen: number[] = [];
      for (let i = 0; i < steps; i++) {
        const l = layout(W, demotions);
        const returning = demotions > 0 ? row[row.length - demotions]! : null;
        const r = nextMorePackDemotions({
          smartChips: true,
          hasMore: true,
          current: demotions,
          preCount: row.length,
          ...l,
          nextReturnWidthPx: useWidths && returning ? widths[returning]! : null,
          columnGapPx: GAP,
          containerWidthPx: W,
          key: row.join(","),
          latch,
        });
        demotions = r.demotions;
        latch = r.latch;
        seen.push(demotions);
      }
      return seen;
    }

    it("old fixed-threshold band flips without the fix (sanity)", () => {
      // spare at d=1 is 127 (> 120) but wind needs 134 → old rule undemotes.
      expect(layout(585, 1).sparePx).toBe(127);
      expect(layout(585, 0).moreWrapped).toBe(true);
    });

    it("settles on wind-in-More with measured widths", () => {
      const seen = run(585, true);
      expect(seen.slice(1).every((d) => d === 1)).toBe(true);
    });

    it("settles via the latch even without measured widths", () => {
      const seen = run(585, false);
      expect(seen.slice(1).every((d) => d === 1)).toBe(true);
    });

    it("is stable at every width 280–800px (10px steps)", () => {
      for (let W = 280; W <= 800; W += 10) {
        const seen = run(W, true, 30);
        const tail = seen.slice(10);
        expect(new Set(tail).size, `width ${W}`).toBe(1);
        expect(layout(W, tail[0]!).moreWrapped && tail[0]! < 3, `width ${W}`).toBe(false);
      }
    });
  });
});

describe("computeChipLayout", () => {
  const values: SmartChipValues = {
    ...base,
    windBft: 4,
    precipitation: 1.4,
  };
  const available: SmartChipId[] = ["precipitation", "wind", "humidity"];

  it("fills the row: noteworthy first, then quiet chips in user order", () => {
    const l = computeChipLayout(true, available, values, 0);
    expect(l.pre.primary).toEqual(["precipitation", "wind", "humidity"]);
    expect(l.pre.overflow).toEqual([]);
    expect(l.final).toEqual(l.pre);
  });

  it("demotes from the end; returning is the last demoted chip", () => {
    const l = computeChipLayout(true, available, values, 2);
    expect(l.final.primary).toEqual(["precipitation"]);
    expect(l.final.overflow).toEqual(["wind", "humidity"]);
    expect(l.returning).toBe("wind");
  });

  it("with no noteworthy chips, quiet chips still fill the row", () => {
    const quiet: SmartChipValues = { ...base, order: resolveChipOrder(["humidity", "pressure"]) };
    const l = computeChipLayout(true, ["pressure", "humidity", "dew_point", "cloud_coverage"], quiet, 2);
    // User order: humidity, pressure, then defaults (… cloud_coverage, dew_point …).
    expect(l.final.primary).toEqual(["humidity", "pressure"]);
    expect(l.final.overflow).toEqual(["cloud_coverage", "dew_point"]);
  });

  it("no demotions → returning null; smart off → everything primary", () => {
    expect(computeChipLayout(true, available, values, 0).returning).toBeNull();
    const off = computeChipLayout(false, available, values, 2);
    expect(off.final.primary).toEqual(available);
    expect(off.returning).toBeNull();
  });
});

describe("resolveChipOrder", () => {
  it("returns the default order for non-arrays", () => {
    expect(resolveChipOrder(undefined)).toEqual([...SMART_CHIP_ORDER]);
    expect(resolveChipOrder("wind")).toEqual([...SMART_CHIP_ORDER]);
  });

  it("drops unknown ids and duplicates, appends missing in default order", () => {
    const out = resolveChipOrder(["wind", "bogus", "wind", "sun"]);
    expect(out.slice(0, 2)).toEqual(["wind", "sun"]);
    expect(out.slice(2)).toEqual(
      SMART_CHIP_ORDER.filter((id) => id !== "wind" && id !== "sun"),
    );
  });

  it("always returns a full permutation", () => {
    const out = resolveChipOrder(["pollen", 3, null, "moon"]);
    expect(out).toHaveLength(SMART_CHIP_ORDER.length);
    expect(new Set(out)).toEqual(new Set(SMART_CHIP_ORDER));
  });
});

describe("moveChip", () => {
  const order: SmartChipId[] = ["sun", "moon", "wind", "humidity"];

  it("moves down and up", () => {
    expect(moveChip(order, 0, 2)).toEqual(["moon", "wind", "sun", "humidity"]);
    expect(moveChip(order, 3, 0)).toEqual(["humidity", "sun", "moon", "wind"]);
  });

  it("same index is a no-op; out-of-range indexes clamp", () => {
    expect(moveChip(order, 1, 1)).toEqual(order);
    expect(moveChip(order, 0, 99)).toEqual(["moon", "wind", "humidity", "sun"]);
    expect(moveChip(order, -4, 1)).toEqual(["moon", "sun", "wind", "humidity"]);
  });

  it("does not mutate the input", () => {
    const copy = [...order];
    moveChip(order, 0, 3);
    expect(order).toEqual(copy);
  });
});

describe("partitionSmartChips with a user order", () => {
  it("user order breaks severity ties and sorts More", () => {
    const order = resolveChipOrder(["dew_point", "humidity", "pressure"]);
    const values: SmartChipValues = { ...base, order };
    const { overflow } = partitionSmartChips(
      ["humidity", "pressure", "dew_point", "cloud_coverage"],
      values,
    );
    expect(overflow).toEqual(["dew_point", "humidity", "pressure", "cloud_coverage"]);

    // Haze visibility and rainy 0% probability both score 580.
    const tie: SmartChipValues = {
      ...base,
      visibility: 2,
      visibilityUnit: "km",
      precipitationProbability: 0,
      condition: "rainy",
    };
    expect(chipSeverity("visibility", tie)).toBe(
      chipSeverity("precipitation_probability", tie),
    );
    const userFirst = partitionSmartChips(
      ["visibility", "precipitation_probability"],
      { ...tie, order: resolveChipOrder(["precipitation_probability"]) },
    );
    expect(userFirst.primary).toEqual(["precipitation_probability", "visibility"]);
    const defaultOrder = partitionSmartChips(
      ["precipitation_probability", "visibility"],
      tie,
    );
    expect(defaultOrder.primary).toEqual(["visibility", "precipitation_probability"]);
  });
});

describe("dropChip", () => {
  const order: SmartChipId[] = ["sun", "moon", "wind"];

  it("drops before or after a target in either direction", () => {
    expect(dropChip(order, "sun", "wind", true)).toEqual(["moon", "wind", "sun"]);
    expect(dropChip(order, "sun", "wind", false)).toEqual(["moon", "sun", "wind"]);
    expect(dropChip(order, "wind", "sun", false)).toEqual(["wind", "sun", "moon"]);
    expect(dropChip(order, "wind", "sun", true)).toEqual(["sun", "wind", "moon"]);
  });

  it("skips over hidden chips by targeting the visible neighbour", () => {
    const full: SmartChipId[] = ["sun", "pollen", "wind"];
    expect(dropChip(full, "sun", "wind", true)).toEqual(["pollen", "wind", "sun"]);
  });

  it("no-ops on self or unknown ids", () => {
    expect(dropChip(order, "sun", "sun", true)).toEqual(order);
    expect(dropChip(order, "humidity", "sun", true)).toEqual(order);
  });
});

describe("nextMorePackDemotions (fill the row)", () => {
  const m: MorePackMeasure = {
    smartChips: true,
    hasMore: false,
    moreWrapped: false,
    sparePx: 0,
    primaryCount: 6,
    current: 0,
    preCount: 6,
    columnGapPx: 16,
    containerWidthPx: 400,
    key: "a",
    latch: null,
  };

  it("demotes every wrapped chip at once, even without More yet", () => {
    expect(nextMorePackDemotions({ ...m, wrappedChips: 3 }).demotions).toBe(3);
  });

  it("all chips fit and no More → no demotions", () => {
    expect(nextMorePackDemotions(m).demotions).toBe(0);
  });

  it("returning the last demoted chip credits the More width", () => {
    const one = {
      ...m,
      hasMore: true,
      current: 1,
      primaryCount: 5,
      nextReturnWidthPx: 100,
      moreWidthPx: 70,
    };
    // Needs 100 + 16 + 8 = 124; spare 40 + (70 + 16) = 126 → fits.
    expect(nextMorePackDemotions({ ...one, sparePx: 40 }).demotions).toBe(0);
    expect(nextMorePackDemotions({ ...one, sparePx: 30 }).demotions).toBe(1);
    // No credit when more chips stay in More.
    expect(
      nextMorePackDemotions({ ...one, current: 2, primaryCount: 4, sparePx: 40 }).demotions,
    ).toBe(2);
  });

  /** User report: top noteworthy chips disabled → row must fill from More. */
  describe("quiet-only row converges to as many chips as fit", () => {
    const GAP = 16;
    const MORE = 70;
    const chips = [
      ["humidity", 80],
      ["pressure", 110],
      ["dew_point", 90],
      ["cloud_coverage", 70],
      ["uv_index", 60],
      ["visibility", 90],
    ] as const;

    function layout(W: number, d: number) {
      const shown = chips.slice(0, chips.length - d);
      const items: number[] = [...shown.map(([, w]) => w)];
      if (d > 0) items.push(MORE);
      let x = 0;
      let line = 0;
      let wrappedChips = 0;
      let moreRight = 0;
      items.forEach((w, i) => {
        if (x > 0 && x + GAP + w > W) {
          line += 1;
          x = w;
        } else x += (x > 0 ? GAP : 0) + w;
        const isMore = d > 0 && i === items.length - 1;
        if (isMore) moreRight = x;
        else if (line > 0) wrappedChips += 1;
      });
      return {
        hasMore: d > 0,
        moreWrapped: d > 0 && line > 0 && moreRight > 0 && x === moreRight && line > 0,
        wrappedChips,
        sparePx: d > 0 ? W - moreRight : 0,
        primaryCount: shown.length,
        firstLineFull: line === 0,
      };
    }

    function run(W: number) {
      let d = 0;
      let latch: MorePackLatch | null = null;
      const seen: number[] = [];
      for (let i = 0; i < 20; i++) {
        const l = layout(W, d);
        const returning = d > 0 ? chips[chips.length - d]![1] : null;
        const r = nextMorePackDemotions({
          smartChips: true,
          current: d,
          preCount: chips.length,
          ...l,
          nextReturnWidthPx: returning,
          moreWidthPx: MORE,
          columnGapPx: GAP,
          containerWidthPx: W,
          key: "quiet",
          latch,
        });
        d = r.demotions;
        latch = r.latch;
        seen.push(d);
      }
      return seen;
    }

    it("settles on one line with More at every width 280–800px", () => {
      for (let W = 280; W <= 800; W += 10) {
        const seen = run(W);
        const tail = seen.slice(8);
        expect(new Set(tail).size, `width ${W}`).toBe(1);
        expect(layout(W, tail[0]!).firstLineFull, `width ${W}`).toBe(true);
        // Never leaves the row empty.
        expect(chips.length - tail[0]!, `width ${W}`).toBeGreaterThan(0);
      }
    });

    it("shows 3 chips + More at 420px", () => {
      const d = run(420).at(-1)!;
      // 80+16+110+16+90 = 312; +16+70 More = 398 ≤ 420; a 4th (70) would not fit with More.
      expect(chips.length - d).toBe(3);
    });
  });
});
