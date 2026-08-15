import { css, html, nothing, type TemplateResult } from "lit";
import type { HaWeatherCondition } from "../types";

export type BackgroundScene =
  | "clear-day"
  | "clear-night"
  | "partlycloudy-day"
  | "partlycloudy-night"
  | "cloudy"
  | "rain"
  | "pouring"
  | "snow"
  | "snowy-rainy"
  | "lightning"
  | "lightning-rainy"
  | "hail"
  | "fog"
  | "wind"
  | "exceptional";

/** Deterministic [0,1) values — stable across re-renders. */
function seed(n: number, salt = 1): number[] {
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const r = Math.sin((i + 1) * 12.9898 * salt) * 43758.5453;
    out[i] = r - Math.floor(r);
  }
  return out;
}

function streams(n: number, ...salts: number[]): number[][] {
  return salts.map((s) => seed(n, s));
}

type RainDrop = {
  left: number;
  height: number;
  delay: number;
  duration: number;
  layer: "far" | "mid" | "near";
};

type SplashSpec = { left: number; delay: number; duration: number };

type FlakeSpec = {
  left: number;
  size: number;
  fallDur: number;
  swayDur: number;
  swayDelay: number;
  blur: number;
  opacity: number;
  fallDelay: number;
};

type HailSpec = {
  left: number;
  size: number;
  duration: number;
  delay: number;
};

type WindStreak = { top: number; width: number; duration: number; delay: number };
type WindDust = { top: number; duration: number; delay: number };

type StarSpec = {
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
};

const CLOUD_PATH =
  "M14 44 L90 44 C104 44 104 30 90 28 C94 16 76 8 64 16 C60 4 40 4 36 16 C28 6 10 12 16 24 C4 28 4 44 14 44 Z";

const BOLT_MAIN =
  "M 55 0 L 50 22 L 58 24 L 42 50 L 50 52 L 38 80 M 50 22 L 38 30 M 42 50 L 32 58 L 36 62";
const BOLT_SIDE = "M 22 0 L 18 20 L 26 22 L 14 44 M 18 20 L 10 26";

function buildRainLayer(
  count: number,
  layer: RainDrop["layer"],
  minDur: number,
  maxDur: number,
  minH: number,
  maxH: number,
  salt: number,
): RainDrop[] {
  const [xs, ds, ts, hs] = streams(count, salt, salt + 1, salt + 2, salt + 3);
  return xs.map((x, i) => ({
    left: x * 110 - 5,
    height: minH + (hs[i] ?? 0) * (maxH - minH),
    delay: -((ts[i] ?? 0) * maxDur),
    duration: minDur + (ds[i] ?? 0) * (maxDur - minDur),
    layer,
  }));
}

function buildSplashes(count: number, salt: number): SplashSpec[] {
  const [xs, ds, ts] = streams(count, salt, salt + 1, salt + 2);
  return xs.map((x, i) => ({
    left: x * 100,
    delay: (ts[i] ?? 0) * 2,
    duration: 1.4 + (ds[i] ?? 0) * 0.4,
  }));
}

const RAIN_DROPS: RainDrop[] = [
  ...buildRainLayer(6, "far", 3, 3.8, 30, 55, 1),
  ...buildRainLayer(10, "mid", 1.9, 2.4, 20, 38, 5),
  ...buildRainLayer(16, "near", 1.3, 1.7, 10, 20, 9),
];
const RAIN_SPLASHES = buildSplashes(6, 13);

const POUR_DROPS: RainDrop[] = [
  ...buildRainLayer(8, "far", 2.4, 3.2, 32, 58, 1),
  ...buildRainLayer(14, "mid", 1.4, 1.9, 22, 40, 5),
  ...buildRainLayer(22, "near", 0.9, 1.3, 12, 22, 9),
];
const POUR_SPLASHES = buildSplashes(8, 13);

const LIGHTNING_RAIN = buildRainLayer(14, "mid", 1.3, 1.8, 16, 30, 31);

function buildFlakes(count: number): FlakeSpec[] {
  const [xs, depth, sway, swayDelay] = streams(count, 1, 2, 3, 4);
  return xs.map((left, i) => {
    const d = depth[i] ?? 0.5;
    return {
      left: left * 100,
      size: 3 + d * 8,
      fallDur: 8 + (1 - d) * 8,
      swayDur: 3 + (sway[i] ?? 0) * 2,
      swayDelay: (swayDelay[i] ?? 0) * 3,
      blur: (1 - d) * 1.5,
      opacity: 0.4 + d * 0.5,
      fallDelay: -(left * (8 + (1 - d) * 8)),
    };
  });
}

const SNOW_FLAKES = buildFlakes(22);
const MIXED_RAIN = buildRainLayer(7, "mid", 1.8, 2.3, 14, 26, 21);

function buildHail(count: number): HailSpec[] {
  const [xs, dur, delay, size] = streams(count, 1, 2, 3, 4);
  return xs.map((left, i) => {
    const d = 0.9 + (dur[i] ?? 0) * 0.4;
    return {
      left: left * 100,
      size: 3 + (size[i] ?? 0) * 3,
      duration: d,
      delay: -((delay[i] ?? 0) * d),
    };
  });
}

const HAIL_PELLETS = buildHail(14);

const WIND_STREAKS: WindStreak[] = (() => {
  const [ys, lens, durs, delays] = streams(8, 1, 2, 3, 4);
  return ys.map((y, i) => ({
    top: 5 + y * 90,
    width: 40 + (lens[i] ?? 0) * 80,
    duration: 2.5 + (durs[i] ?? 0) * 1.5,
    delay: -((delays[i] ?? 0) * 4),
  }));
})();

const WIND_DUST: WindDust[] = (() => {
  const [ys, durs, delays] = streams(12, 5, 6, 7);
  return ys.map((y, i) => ({
    top: y * 100,
    duration: 4 + (durs[i] ?? 0) * 4,
    delay: -((delays[i] ?? 0) * 5),
  }));
})();

const NIGHT_STARS: StarSpec[] = (() => {
  const [xs, ys, sizes, delays] = streams(7, 1, 2, 3, 4);
  return xs.map((x, i) => ({
    left: 8 + x * 84,
    top: 8 + (ys[i] ?? 0) * 55,
    size: 1 + (sizes[i] ?? 0) * 1.5,
    delay: (delays[i] ?? 0) * 5,
    duration: 3.5 + (sizes[i] ?? 0) * 3,
  }));
})();

export function conditionToScene(
  condition: HaWeatherCondition | undefined,
  isDay: boolean,
): BackgroundScene {
  switch (condition) {
    case "sunny":
      return isDay ? "clear-day" : "clear-night";
    case "clear-night":
      return "clear-night";
    case "partlycloudy":
      return isDay ? "partlycloudy-day" : "partlycloudy-night";
    case "cloudy":
      return "cloudy";
    case "rainy":
      return "rain";
    case "pouring":
      return "pouring";
    case "hail":
      return "hail";
    case "snowy":
      return "snow";
    case "snowy-rainy":
      return "snowy-rainy";
    case "lightning":
      return "lightning";
    case "lightning-rainy":
      return "lightning-rainy";
    case "exceptional":
      return "exceptional";
    case "fog":
      return "fog";
    case "windy":
    case "windy-variant":
      return "wind";
    default:
      return isDay ? "clear-day" : "clear-night";
  }
}

function renderRainDrops(drops: RainDrop[]): TemplateResult {
  return html`${drops.map(
    (drop) => html`
      <span
        class="vk-rain-drop vk-rain-drop--${drop.layer}"
        style="left:${drop.left}%;height:${drop.height}px;animation-delay:${drop.delay}s;animation-duration:${drop.duration}s"
      ></span>
    `,
  )}`;
}

function renderSplashes(splashes: SplashSpec[]): TemplateResult {
  return html`${splashes.map(
    (s) => html`
      <span
        class="vk-rain-splash"
        style="left:${s.left}%;animation-delay:${s.delay}s;animation-duration:${s.duration}s"
      ></span>
    `,
  )}`;
}

function renderFlakes(flakes: FlakeSpec[]): TemplateResult {
  return html`${flakes.map(
    (f) => html`
      <span
        class="vk-snow-flake"
        style="left:${f.left}%;width:${f.size}px;height:${f.size}px;animation-duration:${f.fallDur}s;animation-delay:${f.fallDelay}s"
      >
        <span
          class="vk-snow-flake__inner"
          style="opacity:${f.opacity};filter:blur(${f.blur}px);animation-duration:${f.swayDur}s;animation-delay:${f.swayDelay}s"
        ></span>
      </span>
    `,
  )}`;
}

function renderHail(pellets: HailSpec[]): TemplateResult {
  return html`${pellets.map(
    (p) => html`
      <span
        class="vk-hail"
        style="left:${p.left}%;width:${p.size}px;height:${p.size}px;animation-duration:${p.duration}s;animation-delay:${p.delay}s"
      ></span>
    `,
  )}`;
}

function renderWindFx(): TemplateResult {
  return html`
    <div class="vk-wind-sweep"></div>
    ${WIND_STREAKS.map(
      (s) => html`
        <span
          class="vk-wind-streak"
          style="top:${s.top}%;width:${s.width}px;animation-duration:${s.duration}s;animation-delay:${s.delay}s"
        ></span>
      `,
    )}
    ${WIND_DUST.map(
      (d) => html`
        <span
          class="vk-wind-dust"
          style="top:${d.top}%;animation-duration:${d.duration}s;animation-delay:${d.delay}s"
        ></span>
      `,
    )}
  `;
}

function renderCloudSvg(
  top: string,
  left: string,
  width: string,
  duration: string,
  opacity: number,
  delay = "0s",
): TemplateResult {
  return html`
    <svg
      class="vk-cloud"
      viewBox="0 0 120 50"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      style="top:${top};left:${left};width:${width};opacity:${opacity};animation-duration:${duration};animation-delay:${delay}"
    >
      <path d=${CLOUD_PATH} fill="currentColor"></path>
    </svg>
  `;
}

function renderDayClouds(dense: boolean): TemplateResult {
  const o = dense ? [0.55, 0.65, 0.5] : [0.5, 0.58, 0.42];
  return html`
    ${renderCloudSvg("4%", "-40%", "38%", dense ? "60s" : "70s", o[0]!)}
    ${renderCloudSvg("14%", "-50%", "42%", dense ? "45s" : "52s", o[1]!, "-12s")}
    ${renderCloudSvg("8%", "-35%", "30%", dense ? "30s" : "38s", o[2]!, "-6s")}
  `;
}

function renderNightClouds(): TemplateResult {
  return html`
    ${renderCloudSvg("6%", "-40%", "36%", "66s", 0.35)}
    ${renderCloudSvg("16%", "-48%", "40%", "48s", 0.4, "-10s")}
    ${renderCloudSvg("10%", "-32%", "28%", "36s", 0.3, "-5s")}
  `;
}

function renderLightningBolts(): TemplateResult {
  return html`
    <svg
      class="vk-bolt-svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <filter id="vk-bolt-glow">
          <feGaussianBlur stdDeviation="0.8" result="b"></feGaussianBlur>
          <feMerge>
            <feMergeNode in="b"></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
        </filter>
      </defs>
      <path
        class="vk-bolt vk-bolt--main"
        d=${BOLT_MAIN}
        fill="none"
        stroke="white"
        stroke-width="0.4"
        stroke-linecap="round"
        filter="url(#vk-bolt-glow)"
      ></path>
      <path
        class="vk-bolt vk-bolt--side"
        d=${BOLT_SIDE}
        fill="none"
        stroke="rgba(210, 200, 255, 0.85)"
        stroke-width="0.3"
        stroke-linecap="round"
        filter="url(#vk-bolt-glow)"
      ></path>
    </svg>
    <div class="vk-sky-flash"></div>
  `;
}

function renderClearNightFx(): TemplateResult {
  return html`
    <div class="vk-milky-way"></div>
    ${NIGHT_STARS.map(
      (s) => html`
        <span
          class="vk-star"
          style="left:${s.left}%;top:${s.top}%;width:${s.size}px;height:${s.size}px;animation-delay:${s.delay}s;animation-duration:${s.duration}s"
        ></span>
      `,
    )}
    <span class="vk-shooting-star"></span>
  `;
}

function renderExceptionalFx(): TemplateResult {
  return html`${[0, 2, 4, 6].map(
    (delay) => html`
      <span class="vk-warn-ring" style="animation-delay:${delay}s"></span>
    `,
  )}`;
}

function renderPrecip(scene: BackgroundScene): TemplateResult | typeof nothing {
  switch (scene) {
    case "rain":
      return html`
        <div class="vk-rain-skew">${renderRainDrops(RAIN_DROPS)}</div>
        <div class="vk-rain-splashes">${renderSplashes(RAIN_SPLASHES)}</div>
      `;
    case "pouring":
      return html`
        <div class="vk-rain-skew">${renderRainDrops(POUR_DROPS)}</div>
        <div class="vk-rain-splashes">${renderSplashes(POUR_SPLASHES)}</div>
      `;
    case "snow":
      return html`
        ${renderFlakes(SNOW_FLAKES)}
        <div class="vk-snow-veil"></div>
      `;
    case "snowy-rainy":
      return html`
        ${renderFlakes(SNOW_FLAKES)}
        <div class="vk-snow-veil"></div>
        <div class="vk-rain-skew">${renderRainDrops(MIXED_RAIN)}</div>
      `;
    case "hail":
      return renderHail(HAIL_PELLETS);
    case "lightning-rainy":
      return html`
        <div class="vk-rain-skew">${renderRainDrops(LIGHTNING_RAIN)}</div>
      `;
    default:
      return nothing;
  }
}

function renderFx(scene: BackgroundScene): TemplateResult | typeof nothing {
  switch (scene) {
    case "wind":
      return renderWindFx();
    case "lightning":
    case "lightning-rainy":
      return renderLightningBolts();
    case "clear-night":
      return renderClearNightFx();
    case "partlycloudy-night":
      return html`
        ${NIGHT_STARS.slice(0, 5).map(
          (s) => html`
            <span
              class="vk-star"
              style="left:${s.left}%;top:${s.top}%;width:${s.size}px;height:${s.size}px;animation-delay:${s.delay}s;animation-duration:${s.duration}s;opacity:0.7"
            ></span>
          `,
        )}
      `;
    case "exceptional":
      return renderExceptionalFx();
    case "clear-day":
    case "partlycloudy-day":
      return html`<div class="vk-sun-glow"></div>`;
    default:
      return nothing;
  }
}

function renderClouds(scene: BackgroundScene): TemplateResult | typeof nothing {
  switch (scene) {
    case "partlycloudy-day":
      return renderDayClouds(false);
    case "partlycloudy-night":
      return renderNightClouds();
    case "cloudy":
      return renderDayClouds(true);
    case "rain":
    case "pouring":
    case "hail":
    case "snow":
    case "snowy-rainy":
      return renderDayClouds(true);
    case "lightning":
    case "lightning-rainy":
      return html`<div class="vk-storm-clouds"></div>`;
    case "fog":
      return html`<div class="vk-fog-wisps"></div>`;
    default:
      return nothing;
  }
}

export function renderBackground(
  enabled: boolean,
  scene: BackgroundScene,
  cloudCoverage: number | null = null,
): TemplateResult | typeof nothing {
  if (!enabled) return nothing;
  const cloudOpacity =
    cloudCoverage == null || Number.isNaN(cloudCoverage)
      ? undefined
      : Math.max(0.2, Math.min(1, cloudCoverage / 100));
  return html`
    <div class="vk-bg vk-bg--${scene}" aria-hidden="true">
      <div class="vk-bg__layer vk-bg__sky"></div>
      <div
        class="vk-bg__layer vk-bg__clouds"
        style=${cloudOpacity != null ? `opacity:${cloudOpacity}` : ""}
      >
        ${renderClouds(scene)}
      </div>
      <div class="vk-bg__layer vk-bg__precip">${renderPrecip(scene)}</div>
      <div class="vk-bg__scrim"></div>
      <div class="vk-bg__layer vk-bg__fx">${renderFx(scene)}</div>
    </div>
  `;
}

export const backgroundStyles = css`
  .vk-bg {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: var(--ha-card-border-radius, 12px);
    pointer-events: none;
    z-index: 0;
    container-type: size;
  }
  .vk-bg__layer {
    position: absolute;
    inset: 0;
  }
  .vk-bg__scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.15) 0%,
      rgba(0, 0, 0, 0.35) 100%
    );
  }

  /* ---- clear day (kept calm) ---- */
  .vk-bg--clear-day .vk-bg__sky {
    background: linear-gradient(180deg, #4aa8ff 0%, #a8d4ff 55%, #e8f4ff 100%);
  }
  /* Soft sky bloom behind .main-icon — atmosphere, not a second sun disc. */
  .vk-sun-glow {
    position: absolute;
    right: -8px;
    top: -8px;
    width: 152px;
    height: 152px;
    background: radial-gradient(
      circle at 50% 48%,
      rgba(255, 220, 150, 0.22) 0%,
      rgba(255, 200, 130, 0.12) 28%,
      rgba(255, 190, 120, 0.05) 52%,
      transparent 72%
    );
  }

  /* ---- clear night ---- */
  .vk-bg--clear-night .vk-bg__sky {
    background: radial-gradient(
      ellipse at 50% 110%,
      #2a3560 0%,
      #141a38 55%,
      #0a0e22 100%
    );
  }
  .vk-bg--clear-night .vk-bg__scrim {
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.12) 0%,
      rgba(0, 0, 0, 0.4) 100%
    );
  }
  .vk-milky-way {
    position: absolute;
    inset: 0;
    opacity: 0.28;
    background: linear-gradient(
      105deg,
      transparent 30%,
      rgba(180, 180, 255, 0.12) 45%,
      rgba(220, 200, 255, 0.18) 50%,
      rgba(180, 180, 255, 0.12) 55%,
      transparent 70%
    );
    filter: blur(10px);
    mix-blend-mode: screen;
  }
  .vk-star {
    position: absolute;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 4px rgba(255, 255, 255, 0.55);
    animation: vk-star-twinkle ease-in-out infinite;
  }
  .vk-shooting-star {
    position: absolute;
    top: 18%;
    right: -20%;
    width: 72px;
    height: 1px;
    background: linear-gradient(
      90deg,
      #fff 0%,
      rgba(255, 255, 255, 0.85) 30%,
      transparent 100%
    );
    filter: drop-shadow(0 0 3px #fff);
    transform: rotate(-18deg);
    opacity: 0;
    animation: vk-shooting-star 22s ease-out infinite;
  }

  /* ---- partly cloudy / cloudy ---- */
  .vk-bg--partlycloudy-day .vk-bg__sky {
    background: linear-gradient(180deg, #4aa8ff 0%, #8ec8f5 55%, #b8d9f5 100%);
  }
  .vk-bg--partlycloudy-day .vk-bg__scrim {
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.08) 0%,
      rgba(0, 0, 0, 0.22) 100%
    );
  }
  .vk-bg--partlycloudy-night .vk-bg__sky {
    background: radial-gradient(
      ellipse at 50% 110%,
      #2a3560 0%,
      #141a38 55%,
      #0a0e22 100%
    );
  }
  .vk-bg--partlycloudy-night .vk-bg__scrim {
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.18) 0%,
      rgba(0, 0, 0, 0.42) 100%
    );
  }
  .vk-bg--cloudy .vk-bg__sky {
    background: linear-gradient(180deg, #6b7c93 0%, #9aabbd 50%, #c5d0db 100%);
  }
  .vk-bg__clouds {
    overflow: hidden;
  }
  .vk-cloud {
    position: absolute;
    height: auto;
    color: rgba(255, 255, 255, 0.92);
    animation: vk-cloud-drift linear infinite;
    will-change: transform;
  }
  .vk-bg--partlycloudy-night .vk-cloud {
    color: rgba(120, 130, 155, 0.75);
  }

  /* ---- rain / pouring ---- */
  .vk-bg--rain .vk-bg__sky {
    background: linear-gradient(180deg, #3a4a62 0%, #516780 55%, #6a7f96 100%);
  }
  .vk-bg--pouring .vk-bg__sky {
    background: linear-gradient(180deg, #1c2433 0%, #2a3548 50%, #243040 100%);
  }
  .vk-bg--pouring .vk-bg__scrim {
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.22) 0%,
      rgba(0, 0, 0, 0.48) 100%
    );
  }
  .vk-rain-skew {
    position: absolute;
    inset: 0;
    transform: skewX(-9deg);
    transform-origin: top center;
  }
  .vk-rain-drop {
    position: absolute;
    top: 0;
    width: 1px;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(210, 228, 255, 0.75)
    );
    animation: vk-rain-fall linear infinite;
    will-change: transform;
  }
  .vk-rain-drop--far {
    filter: blur(2px);
    opacity: 0.45;
  }
  .vk-rain-drop--mid {
    filter: blur(0.5px);
    opacity: 0.7;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(220, 235, 250, 0.75)
    );
  }
  .vk-rain-drop--near {
    width: 1.5px;
    opacity: 0.9;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(255, 255, 255, 0.85) 80%,
      #fff 100%
    );
  }
  .vk-rain-splashes {
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    height: 8px;
  }
  .vk-rain-splash {
    position: absolute;
    bottom: 0;
    width: 8px;
    height: 1px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.4);
    filter: blur(0.5px);
    animation: vk-rain-splash linear infinite;
  }

  /* ---- snow ---- */
  .vk-bg--snow .vk-bg__sky,
  .vk-bg--snowy-rainy .vk-bg__sky {
    background: linear-gradient(180deg, #7a8fa8 0%, #b0c0d2 55%, #dce6f0 100%);
  }
  .vk-snow-flake {
    position: absolute;
    top: 0;
    animation: vk-snow-fall linear infinite;
    will-change: transform;
  }
  .vk-snow-flake__inner {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      #fff 30%,
      rgba(255, 255, 255, 0.4) 70%,
      transparent
    );
    animation: vk-snow-sway ease-in-out infinite;
    will-change: transform;
  }
  .vk-snow-veil {
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    height: 12px;
    background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.5));
    filter: blur(2px);
  }

  /* ---- hail ---- */
  .vk-bg--hail .vk-bg__sky {
    background: linear-gradient(180deg, #5a6a7e 0%, #7a8fa3 100%);
  }
  .vk-hail {
    position: absolute;
    top: 0;
    border-radius: 50%;
    background: radial-gradient(
      circle at 35% 35%,
      #fff 0%,
      rgba(220, 235, 250, 0.9) 60%,
      rgba(180, 200, 220, 0.7) 100%
    );
    box-shadow: 0 0 4px rgba(220, 235, 250, 0.5);
    animation: vk-hail-fall linear infinite;
    will-change: transform;
  }

  /* ---- lightning ---- */
  .vk-bg--lightning .vk-bg__sky,
  .vk-bg--lightning-rainy .vk-bg__sky {
    background: linear-gradient(180deg, #1e1838 0%, #120e28 55%, #0a0818 100%);
  }
  .vk-bg--lightning .vk-bg__scrim,
  .vk-bg--lightning-rainy .vk-bg__scrim {
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.28) 0%,
      rgba(0, 0, 0, 0.55) 100%
    );
  }
  .vk-storm-clouds {
    position: absolute;
    inset: -8% -8% auto;
    height: 66%;
    opacity: 0.9;
    background:
      radial-gradient(
        ellipse 60% 80% at 30% 70%,
        rgba(28, 22, 55, 0.95) 0%,
        transparent 70%
      ),
      radial-gradient(
        ellipse 50% 70% at 75% 60%,
        rgba(18, 14, 40, 0.9) 0%,
        transparent 65%
      );
    filter: blur(18px);
  }
  .vk-bolt-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .vk-bolt {
    stroke-dasharray: 200;
    stroke-dashoffset: 200;
    opacity: 0;
  }
  .vk-bolt--main {
    animation: vk-bolt-strike 8s ease-out infinite;
  }
  .vk-bolt--side {
    animation: vk-bolt-strike 13s ease-out 3s infinite;
  }
  .vk-sky-flash {
    position: absolute;
    inset: 0;
    background: #fff;
    mix-blend-mode: screen;
    opacity: 0;
    animation: vk-sky-flash 8s ease-out infinite;
    pointer-events: none;
  }

  /* ---- fog ---- */
  .vk-bg--fog .vk-bg__sky {
    background: linear-gradient(180deg, #b8bcb6 0%, #9da29b 55%, #828780 100%);
  }
  .vk-fog-wisps {
    position: absolute;
    inset: 0 -25%;
    background:
      radial-gradient(
        ellipse 30% 50% at 18% 12%,
        rgba(255, 255, 255, 0.5) 0%,
        transparent 70%
      ),
      radial-gradient(
        ellipse 32% 45% at 65% 8%,
        rgba(255, 255, 255, 0.45) 0%,
        transparent 70%
      ),
      radial-gradient(
        ellipse 38% 55% at 22% 88%,
        rgba(255, 255, 255, 0.55) 0%,
        transparent 70%
      ),
      radial-gradient(
        ellipse 35% 50% at 70% 92%,
        rgba(255, 255, 255, 0.5) 0%,
        transparent 70%
      );
    filter: blur(22px);
    -webkit-mask-image: linear-gradient(
      180deg,
      #000 0%,
      rgba(0, 0, 0, 0.12) 35%,
      rgba(0, 0, 0, 0.12) 65%,
      #000 100%
    );
    mask-image: linear-gradient(
      180deg,
      #000 0%,
      rgba(0, 0, 0, 0.12) 35%,
      rgba(0, 0, 0, 0.12) 65%,
      #000 100%
    );
    animation: vk-fog-drift 70s linear infinite alternate;
    will-change: transform;
  }
  .vk-bg--fog .vk-bg__scrim {
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(220, 224, 218, 0.35) 100%
    );
  }

  /* ---- wind ---- */
  .vk-bg--wind .vk-bg__sky {
    background: linear-gradient(180deg, #6aa8b8 0%, #8fc4d0 55%, #c5e0e8 100%);
  }
  .vk-wind-sweep {
    position: absolute;
    inset: 0;
    opacity: 0.4;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(160, 200, 210, 0.3) 30%,
      rgba(180, 220, 230, 0.4) 50%,
      rgba(160, 200, 210, 0.3) 70%,
      transparent 100%
    );
    mix-blend-mode: overlay;
    animation: vk-wind-sweep 12s ease-in-out infinite;
    will-change: transform;
  }
  .vk-wind-streak {
    position: absolute;
    left: -20%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(220, 240, 245, 0.6),
      transparent
    );
    filter: blur(0.5px);
    animation: vk-wind-streak ease-out infinite;
    will-change: transform;
  }
  .vk-wind-dust {
    position: absolute;
    left: -5%;
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: rgba(255, 236, 200, 0.4);
    animation: vk-wind-dust linear infinite;
    will-change: transform;
  }

  /* ---- exceptional ---- */
  .vk-bg--exceptional .vk-bg__sky {
    background: linear-gradient(180deg, #5a3428 0%, #3a2218 100%);
  }
  .vk-bg--exceptional .vk-bg__fx::before {
    content: "";
    position: absolute;
    right: 16px;
    top: 16px;
    width: 96px;
    height: 96px;
    opacity: 0.35;
    background: radial-gradient(
      circle at 50% 50%,
      rgba(255, 180, 80, 0.55),
      transparent 70%
    );
    mix-blend-mode: overlay;
  }
  .vk-warn-ring {
    position: absolute;
    right: 16px;
    top: 16px;
    width: 96px;
    height: 96px;
    border-radius: 50%;
    border: 1px solid rgba(252, 211, 77, 0.4);
    transform-origin: center center;
    animation: vk-warn-ring 8s ease-out infinite;
    will-change: transform;
  }
  .vk-bg--exceptional .vk-bg__scrim {
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.2) 0%,
      rgba(0, 0, 0, 0.45) 100%
    );
  }

  /* ---- keyframes ---- */
  @keyframes vk-rain-fall {
    from {
      transform: translateY(-20%);
    }
    to {
      transform: translateY(calc(100cqh + 30px));
    }
  }
  @keyframes vk-rain-splash {
    0%,
    80% {
      transform: scale(0);
      opacity: 0;
    }
    85% {
      transform: scale(1);
      opacity: 0.8;
    }
    100% {
      transform: scale(2.5);
      opacity: 0;
    }
  }
  @keyframes vk-snow-fall {
    from {
      transform: translateY(-10%);
    }
    to {
      transform: translateY(calc(100cqh + 20px));
    }
  }
  @keyframes vk-snow-sway {
    0%,
    100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(12px);
    }
  }
  @keyframes vk-hail-fall {
    0% {
      transform: translateY(-10%) scaleY(1);
    }
    88% {
      transform: translateY(100cqh) scaleY(1);
    }
    92% {
      transform: translateY(calc(100cqh - 8px)) scaleY(0.7);
    }
    96% {
      transform: translateY(calc(100cqh - 4px)) scaleY(1);
    }
    100% {
      transform: translateY(calc(100cqh + 20px)) scaleY(1);
      opacity: 0;
    }
  }
  @keyframes vk-cloud-drift {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(380%);
    }
  }
  @keyframes vk-fog-drift {
    from {
      transform: translateX(-12%);
    }
    to {
      transform: translateX(12%);
    }
  }
  @keyframes vk-wind-sweep {
    0%,
    100% {
      transform: translateX(-5%);
    }
    50% {
      transform: translateX(5%);
    }
  }
  @keyframes vk-wind-streak {
    0% {
      transform: translateX(0);
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    100% {
      transform: translateX(150cqw);
      opacity: 0;
    }
  }
  @keyframes vk-wind-dust {
    0% {
      transform: translate(0, 0);
    }
    50% {
      transform: translate(60cqw, -10px);
    }
    100% {
      transform: translate(120cqw, 5px);
    }
  }
  @keyframes vk-star-twinkle {
    0%,
    100% {
      opacity: 0.45;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.35);
    }
  }
  @keyframes vk-shooting-star {
    0%,
    88% {
      transform: translate(0, 0) rotate(-18deg);
      opacity: 0;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translate(-180%, 60%) rotate(-18deg);
      opacity: 0;
    }
  }
  @keyframes vk-bolt-strike {
    0%,
    92% {
      stroke-dashoffset: 200;
      opacity: 0;
    }
    93% {
      stroke-dashoffset: 0;
      opacity: 1;
    }
    95% {
      opacity: 0.3;
    }
    96% {
      opacity: 1;
    }
    98% {
      opacity: 0;
    }
    100% {
      stroke-dashoffset: 200;
      opacity: 0;
    }
  }
  @keyframes vk-sky-flash {
    0%,
    92% {
      opacity: 0;
    }
    93% {
      opacity: 0.35;
    }
    94% {
      opacity: 0.05;
    }
    95% {
      opacity: 0.5;
    }
    97% {
      opacity: 0;
    }
  }
  @keyframes vk-warn-ring {
    0% {
      transform: scale(0.5);
      opacity: 0.8;
    }
    100% {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
