import { css, html, nothing, type TemplateResult } from "lit";
import type { HaWeatherCondition } from "../types";

export type BackgroundScene =
  | "clear-day"
  | "clear-night"
  | "partlycloudy-day"
  | "partlycloudy-night"
  | "cloudy"
  | "rain"
  | "snow"
  | "storm"
  | "fog"
  | "wind"
  | "default";

type RainDropSpec = { left: number; delay: number; duration: number };

type WindGustSpec = { top: string; left: string; delay: number };

function buildRainDrops(
  count: number,
  minDur: number,
  maxDur: number,
): RainDropSpec[] {
  return Array.from({ length: count }, (_, i) => ({
    left: ((i * 37 + 11) % 97) + 1,
    delay: Number(((i * 0.17) % 2.2).toFixed(2)),
    duration: Number(
      (minDur + ((i * 0.31) % (maxDur - minDur))).toFixed(2),
    ),
  }));
}

const RAIN_DROPS = buildRainDrops(35, 1.4, 2.2);
const STORM_DROPS = buildRainDrops(55, 0.6, 1.1);

const WIND_GUSTS: WindGustSpec[] = [
  { top: "22%", left: "8%", delay: 0 },
  { top: "48%", left: "42%", delay: 1.1 },
  { top: "68%", left: "18%", delay: 2.2 },
];

const WIND_PATH =
  "M-34.8,166.8c51.6,1.9,70.9,16.4,78.4,30.3c10.9,20.1-3.6,37.5,6.9,75c3.9,14,11.8,42.2,33.7,50.9c25.7,10.2,65.3-8.7,76.4-36.5c13.8-34.4-26.4-57.5-19.3-110.1c3.3-24.1,17.1-58.7,44.7-67.4c34.9-10.9,84.3,21.7,90.8,65.4c5.3,36-20.6,66.1-42.6,79.8c-39.5,24.5-95.7,14.9-108-7.6c-0.5-0.9-7.9-14.7-2.1-22.7c3.7-5,10.9-5.4,13.1-5.5c15.4-0.8,28.1,12.1,33,17.2c46.5,48.5,53.9,63.9,72.2,75.7c24.1,15.6,66.1,24.2,90.8,6.9c36.4-25.5,7.6-88,49.5-130.7c17.6-17.9,40-24.6,56.4-27.5";

export function conditionToScene(
  condition: HaWeatherCondition | undefined,
  isDay: boolean,
): BackgroundScene {
  switch (condition) {
    case "sunny":
      return "clear-day";
    case "clear-night":
      return "clear-night";
    case "partlycloudy":
      return isDay ? "partlycloudy-day" : "partlycloudy-night";
    case "cloudy":
    case "windy-variant":
      return "cloudy";
    case "rainy":
    case "pouring":
    case "hail":
    case "snowy-rainy":
      return "rain";
    case "snowy":
      return "snow";
    case "lightning":
    case "lightning-rainy":
    case "exceptional":
      return "storm";
    case "fog":
      return "fog";
    case "windy":
      return "wind";
    default:
      return isDay ? "clear-day" : "clear-night";
  }
}

function renderRainDrops(drops: RainDropSpec[]): TemplateResult {
  return html`${drops.map(
    (drop) => html`
      <span
        class="vk-rain-drop"
        style="left:${drop.left}%;animation-delay:${drop.delay}s;animation-duration:${drop.duration}s"
      ></span>
    `,
  )}`;
}

function renderWindFx(): TemplateResult {
  return html`${WIND_GUSTS.map(
    (gust) => html`
      <div
        class="vk-wind-gust"
        style="top:${gust.top};left:${gust.left}"
      >
        <svg
          class="vk-wind-svg"
          viewBox="0 0 400 400"
          aria-hidden="true"
        >
          <path
            class="vk-wind-line"
            d=${WIND_PATH}
            style="animation-delay:${gust.delay}s"
          ></path>
        </svg>
        <span
          class="vk-wind-ripple"
          style="animation-delay:${(gust.delay + 0.1).toFixed(1)}s"
        ></span>
      </div>
    `,
  )}`;
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
  const rainDrops =
    scene === "rain" ? RAIN_DROPS : scene === "storm" ? STORM_DROPS : null;
  return html`
    <div class="vk-bg vk-bg--${scene}" aria-hidden="true">
      <div class="vk-bg__layer vk-bg__sky"></div>
      <div
        class="vk-bg__layer vk-bg__clouds"
        style=${cloudOpacity != null ? `opacity:${cloudOpacity}` : ""}
      ></div>
      <div class="vk-bg__layer vk-bg__precip">
        ${rainDrops ? renderRainDrops(rainDrops) : nothing}
      </div>
      <div class="vk-bg__scrim"></div>
      <div class="vk-bg__layer vk-bg__fx">
        ${scene === "wind" ? renderWindFx() : nothing}
      </div>
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
  }
  .vk-bg__layer {
    position: absolute;
    inset: 0;
  }
  .vk-bg__precip::before,
  .vk-bg__precip::after,
  .vk-bg__fx::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
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
  .vk-bg--clear-day .vk-bg__sky {
    background: linear-gradient(180deg, #4aa8ff 0%, #a8d4ff 55%, #e8f4ff 100%);
  }
  .vk-bg--clear-day .vk-bg__fx {
    background: radial-gradient(
      circle at 78% 18%,
      rgba(255, 230, 120, 0.95) 0%,
      rgba(255, 230, 120, 0.4) 12%,
      transparent 28%
    );
  }
  .vk-bg--clear-night .vk-bg__sky {
    background: linear-gradient(180deg, #0b1224 0%, #1a2744 60%, #2a3a5c 100%);
  }
  .vk-bg--clear-night .vk-bg__fx {
    background-image:
      radial-gradient(1px 1px at 20% 30%, #fff 50%, transparent 51%),
      radial-gradient(1px 1px at 40% 70%, #fff 50%, transparent 51%),
      radial-gradient(1px 1px at 65% 25%, #fff 50%, transparent 51%),
      radial-gradient(1.5px 1.5px at 80% 55%, #fff 50%, transparent 51%),
      radial-gradient(1px 1px at 55% 15%, #fff 50%, transparent 51%);
    opacity: 0.85;
  }

  /* Partly cloudy: sun or stars visible through sparse drifting clouds */
  .vk-bg--partlycloudy-day .vk-bg__sky {
    background: linear-gradient(180deg, #4aa8ff 0%, #8ec8f5 55%, #b8d9f5 100%);
  }
  .vk-bg--partlycloudy-day .vk-bg__fx {
    background: radial-gradient(
      circle at 78% 18%,
      rgba(255, 230, 120, 0.9) 0%,
      rgba(255, 230, 120, 0.35) 14%,
      transparent 30%
    );
  }
  .vk-bg--partlycloudy-day .vk-bg__clouds {
    background:
      radial-gradient(
        ellipse 32% 18% at 22% 38%,
        rgba(255, 255, 255, 0.42),
        transparent 72%
      ),
      radial-gradient(
        ellipse 30% 16% at 68% 32%,
        rgba(255, 255, 255, 0.35),
        transparent 70%
      );
    animation: vk-drift 32s linear infinite;
  }
  .vk-bg--partlycloudy-day .vk-bg__scrim {
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.08) 0%,
      rgba(0, 0, 0, 0.22) 100%
    );
  }
  .vk-bg--partlycloudy-night .vk-bg__sky {
    background: linear-gradient(180deg, #0b1224 0%, #1a2744 55%, #2a3a5c 100%);
  }
  .vk-bg--partlycloudy-night .vk-bg__fx {
    background-image:
      radial-gradient(1px 1px at 20% 30%, #fff 50%, transparent 51%),
      radial-gradient(1px 1px at 40% 70%, #fff 50%, transparent 51%),
      radial-gradient(1px 1px at 65% 25%, #fff 50%, transparent 51%),
      radial-gradient(1.5px 1.5px at 80% 55%, #fff 50%, transparent 51%),
      radial-gradient(1px 1px at 55% 15%, #fff 50%, transparent 51%);
    opacity: 0.7;
  }
  .vk-bg--partlycloudy-night .vk-bg__clouds {
    background:
      radial-gradient(
        ellipse 34% 18% at 28% 34%,
        rgba(80, 90, 110, 0.55),
        transparent 72%
      ),
      radial-gradient(
        ellipse 32% 16% at 72% 28%,
        rgba(70, 80, 100, 0.48),
        transparent 70%
      ),
      radial-gradient(
        ellipse 28% 14% at 50% 48%,
        rgba(60, 70, 90, 0.4),
        transparent 68%
      );
    animation: vk-drift 36s linear infinite;
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
  .vk-bg--cloudy .vk-bg__clouds {
    background:
      radial-gradient(
        ellipse 40% 22% at 25% 35%,
        rgba(255, 255, 255, 0.55),
        transparent 70%
      ),
      radial-gradient(
        ellipse 45% 24% at 70% 40%,
        rgba(255, 255, 255, 0.45),
        transparent 70%
      );
    animation: vk-drift 28s linear infinite;
  }

  /* Rain: individual falling drops, slower pace */
  .vk-bg--rain .vk-bg__sky {
    background: linear-gradient(180deg, #3d4f66 0%, #5a6e86 60%, #74879c 100%);
  }
  .vk-bg--rain .vk-bg__clouds {
    background:
      radial-gradient(
        ellipse 50% 28% at 30% 22%,
        rgba(160, 175, 195, 0.55),
        transparent 70%
      ),
      radial-gradient(
        ellipse 45% 24% at 75% 18%,
        rgba(140, 155, 175, 0.45),
        transparent 70%
      );
  }
  .vk-bg--rain .vk-rain-drop {
    opacity: 0.55;
  }

  /* Snow: multi-size flakes with drift */
  .vk-bg--snow .vk-bg__sky {
    background: linear-gradient(180deg, #7a8fa8 0%, #b0c0d2 55%, #dce6f0 100%);
  }
  .vk-bg--snow .vk-bg__precip {
    inset: -30% 0 0 0;
    background-image:
      radial-gradient(circle, rgba(255, 255, 255, 0.95) 1.1px, transparent 1.35px),
      radial-gradient(circle, rgba(255, 255, 255, 0.7) 0.85px, transparent 1.1px);
    background-size: 51px 58px, 79px 86px;
    background-position: 0 0, 27px 33px;
    animation: vk-snow-a 8s linear infinite;
    opacity: 0.85;
  }
  .vk-bg--snow .vk-bg__precip::before {
    inset: -40% 0 0 0;
    background-image:
      radial-gradient(circle, #fff 1.7px, transparent 2px),
      radial-gradient(circle, rgba(255, 255, 255, 0.8) 1.15px, transparent 1.4px);
    background-size: 103px 118px, 67px 74px;
    background-position: 14px 9px, 41px 52px;
    animation: vk-snow-b 12.5s linear infinite;
    opacity: 0.8;
  }
  .vk-bg--snow .vk-bg__precip::after {
    inset: -35% 0 0 0;
    background-image:
      radial-gradient(circle, rgba(255, 255, 255, 0.95) 2.1px, transparent 2.4px),
      radial-gradient(circle, rgba(255, 255, 255, 0.55) 0.65px, transparent 0.85px),
      radial-gradient(circle, #fff 1.25px, transparent 1.5px);
    background-size: 141px 155px, 43px 49px, 91px 99px;
    background-position: 7px 22px, 19px 4px, 63px 44px;
    animation: vk-snow-c 17s linear infinite;
    opacity: 0.9;
  }

  /* Storm: dark sky, heavy rain, lightning above scrim */
  .vk-bg--storm .vk-bg__sky {
    background: linear-gradient(180deg, #0d111a 0%, #1a2333 45%, #2a3548 100%);
  }
  .vk-bg--storm .vk-bg__clouds {
    background:
      radial-gradient(
        ellipse 55% 32% at 25% 18%,
        rgba(40, 48, 62, 0.85),
        transparent 70%
      ),
      radial-gradient(
        ellipse 50% 28% at 70% 12%,
        rgba(55, 65, 82, 0.75),
        transparent 70%
      ),
      radial-gradient(
        ellipse 60% 30% at 50% 28%,
        rgba(30, 36, 48, 0.7),
        transparent 75%
      );
    animation: vk-drift 40s linear infinite;
  }
  .vk-bg--storm .vk-bg__scrim {
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.28) 0%,
      rgba(0, 0, 0, 0.55) 100%
    );
  }
  .vk-bg--storm .vk-rain-drop {
    height: 20px;
    opacity: 0.65;
  }
  .vk-bg--storm .vk-bg__fx {
    animation: vk-sky-flash 8s ease-in-out infinite;
  }
  .vk-bg--storm .vk-bg__fx::before {
    left: 62%;
    top: 2%;
    width: 20px;
    height: 45%;
    inset: auto;
    background: linear-gradient(
      180deg,
      #fffef8 0%,
      #e8f0ff 40%,
      rgba(160, 190, 255, 0.85) 100%
    );
    clip-path: polygon(
      42% 0%,
      62% 0%,
      48% 32%,
      78% 32%,
      28% 100%,
      40% 46%,
      18% 46%
    );
    filter: drop-shadow(0 0 8px rgba(255, 255, 240, 0.85))
      drop-shadow(0 0 16px rgba(180, 210, 255, 0.55));
    opacity: 0;
    animation: vk-bolt 8s ease-in-out infinite;
  }

  .vk-bg--fog .vk-bg__sky {
    background: linear-gradient(180deg, #8a939e 0%, #b4bcc6 50%, #d0d6dc 100%);
  }
  .vk-bg--fog .vk-bg__clouds {
    background: linear-gradient(
      180deg,
      transparent 20%,
      rgba(255, 255, 255, 0.45) 45%,
      rgba(255, 255, 255, 0.55) 70%,
      transparent 95%
    );
    animation: vk-fog 12s ease-in-out infinite alternate;
  }

  /* Wind: animated gust lines + ripples */
  .vk-bg--wind .vk-bg__sky {
    background: linear-gradient(180deg, #5d8eb8 0%, #8eb4d4 55%, #c5dced 100%);
  }
  .vk-bg--wind .vk-bg__clouds {
    background:
      radial-gradient(
        ellipse 28% 14% at 20% 30%,
        rgba(255, 255, 255, 0.28),
        transparent 70%
      ),
      radial-gradient(
        ellipse 24% 12% at 75% 45%,
        rgba(255, 255, 255, 0.22),
        transparent 68%
      );
    animation: vk-drift 14s linear infinite;
  }
  .vk-wind-gust {
    position: absolute;
    width: 58%;
    height: 38%;
    overflow: visible;
  }
  .vk-wind-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .vk-wind-line {
    fill: none;
    stroke: rgba(255, 255, 255, 0.5);
    stroke-width: 3;
    stroke-linecap: round;
    animation: vk-wind-line 3s linear infinite;
  }
  .vk-wind-ripple {
    position: absolute;
    top: 52%;
    left: 22%;
    width: 22px;
    height: 22px;
    border: 2px solid rgba(255, 255, 255, 0.45);
    border-radius: 50%;
    animation: vk-wind-ripple 3.1s ease-out infinite both;
  }

  .vk-rain-drop {
    position: absolute;
    top: -20px;
    width: 1px;
    height: 18px;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(210, 228, 255, 0.15) 20%,
      rgba(210, 228, 255, 0.75)
    );
    transform: rotate(10deg);
    animation: vk-rain-fall linear infinite;
  }

  @keyframes vk-rain-fall {
    from {
      transform: translateY(-20px) rotate(10deg);
    }
    to {
      transform: translateY(520px) rotate(10deg);
    }
  }
  @keyframes vk-snow-a {
    from {
      background-position: 0 0, 27px 33px;
    }
    to {
      background-position: 22px 140px, 55px 175px;
    }
  }
  @keyframes vk-snow-b {
    from {
      background-position: 14px 9px, 41px 52px;
    }
    to {
      background-position: -28px 160px, 12px 200px;
    }
  }
  @keyframes vk-snow-c {
    from {
      background-position: 7px 22px, 19px 4px, 63px 44px;
    }
    to {
      background-position: 38px 180px, -18px 120px, 95px 220px;
    }
  }
  @keyframes vk-drift {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(8%);
    }
  }
  @keyframes vk-fog {
    from {
      opacity: 0.55;
      transform: translateY(0);
    }
    to {
      opacity: 0.85;
      transform: translateY(-4%);
    }
  }
  @keyframes vk-wind-line {
    from {
      stroke-dasharray: 100 1200;
      stroke-dashoffset: 1300;
    }
    to {
      stroke-dasharray: 100 1200;
      stroke-dashoffset: 10;
    }
  }
  @keyframes vk-wind-ripple {
    0%,
    50% {
      opacity: 1;
      transform: scale(0);
    }
    70%,
    100% {
      opacity: 0;
      transform: scale(1);
    }
  }
  @keyframes vk-sky-flash {
    0%,
    3.5%,
    5.5%,
    47%,
    49%,
    100% {
      background: transparent;
    }
    3.8% {
      background: rgba(255, 255, 255, 0.88);
    }
    4.1% {
      background: transparent;
    }
    4.5% {
      background: rgba(255, 255, 240, 0.55);
    }
    5% {
      background: transparent;
    }
    47.5% {
      background: rgba(220, 230, 255, 0.72);
    }
    48.2% {
      background: transparent;
    }
  }
  @keyframes vk-bolt {
    0%,
    3.5%,
    5.5%,
    47%,
    49%,
    100% {
      opacity: 0;
    }
    3.8% {
      opacity: 0.75;
    }
    4.1% {
      opacity: 0.15;
    }
    4.5%,
    4.9% {
      opacity: 0.9;
    }
    5% {
      opacity: 0;
    }
    47.5% {
      opacity: 0.65;
    }
    48.2% {
      opacity: 0;
    }
  }
`;
