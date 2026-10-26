import type { MeteoconName } from "../icons/allowlist";
import { localize, type LocalizeKey } from "../localize";
import {
  getMoonSnapshot,
  moonPhaseIcon,
  moonPhaseLocalizeKey,
  type MoonSnapshot,
} from "./moon-phase";

export interface LunationArcDetailRow {
  label: string;
  value: string;
  summary?: boolean;
}

export interface LunationArcMarker {
  progress: number;
  x: number;
  label: string;
}

export interface LunationArcModel {
  heroIcon: MeteoconName;
  heroLabel: string;
  heroValue: string;
  path: string;
  viewWidth: number;
  viewHeight: number;
  horizonY: number;
  dotX: number;
  dotY: number;
  markers: LunationArcMarker[];
  details: LunationArcDetailRow[];
}

export const LUNATION_ARC_WIDTH = 360;
export const LUNATION_ARC_HEIGHT = 110;
export const LUNATION_ARC_HORIZON = 72;
export const LUNATION_ARC_AMPLITUDE = 48;

export function lunationArcX(progress: number): number {
  const p = Math.min(1, Math.max(0, progress));
  return p * LUNATION_ARC_WIDTH;
}

/** Peak at full (progress 0.5); new moons sit on the baseline. */
export function lunationArcY(progress: number): number {
  const p = Math.min(1, Math.max(0, progress));
  return LUNATION_ARC_HORIZON - LUNATION_ARC_AMPLITUDE * Math.sin(Math.PI * p);
}

export function buildLunationPath(samples = 64): string {
  const parts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const progress = i / samples;
    const x = lunationArcX(progress);
    const y = lunationArcY(progress);
    parts.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }
  return parts.join(" ");
}

function formatMoonDate(date: Date, language: string | undefined): string {
  try {
    return new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(
      date,
    );
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function copyKeyForPhase(phase: MoonSnapshot["phase"]): LocalizeKey {
  switch (phase) {
    case "new_moon":
      return "copy_moon_new";
    case "full_moon":
      return "copy_moon_full";
    case "waxing_crescent":
    case "first_quarter":
    case "waxing_gibbous":
      return "copy_moon_waxing";
    default:
      return "copy_moon_waning";
  }
}

export function buildLunationArcModel(
  language: string | undefined,
  now?: Date,
): LunationArcModel {
  const snap = getMoonSnapshot(now);
  const phaseKey = moonPhaseLocalizeKey(snap.phase);
  const phaseName = localize(phaseKey, language);
  const illumination = `${snap.illuminationPct}%`;

  const markers: LunationArcMarker[] = [
    {
      progress: 0,
      x: lunationArcX(0),
      label: localize("moon_mark_new", language),
    },
    {
      progress: 0.5,
      x: lunationArcX(0.5),
      label: localize("moon_mark_full", language),
    },
    {
      progress: 1,
      x: lunationArcX(1),
      label: localize("moon_mark_new", language),
    },
  ];

  const details: LunationArcDetailRow[] = [
    {
      label: localize("moon_phase", language),
      value: phaseName,
    },
    {
      label: localize("moon_illumination", language),
      value: illumination,
    },
    {
      label: localize("moon_age", language),
      value: localize("moon_age_days", language, {
        days: snap.ageDays.toFixed(1),
      }),
    },
    {
      label: localize("moon_next_full", language),
      value: formatMoonDate(snap.nextFull, language),
    },
    {
      label: localize("moon_next_new", language),
      value: formatMoonDate(snap.nextNew, language),
      summary: true,
    },
  ];

  return {
    heroIcon: moonPhaseIcon(snap.phase),
    heroLabel: "",
    heroValue: phaseName,
    path: buildLunationPath(),
    viewWidth: LUNATION_ARC_WIDTH,
    viewHeight: LUNATION_ARC_HEIGHT,
    horizonY: LUNATION_ARC_HORIZON,
    dotX: lunationArcX(snap.progress),
    dotY: lunationArcY(snap.progress),
    markers,
    details,
  };
}

export function moonInterpretationCopy(
  language: string | undefined,
  now?: Date,
): string {
  const snap = getMoonSnapshot(now);
  return localize(copyKeyForPhase(snap.phase), language, {
    pct: String(snap.illuminationPct),
  });
}
