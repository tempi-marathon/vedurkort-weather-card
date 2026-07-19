import { css, html, nothing, type TemplateResult } from "lit";
import type { HaWeatherCondition } from "../types";

export type BackgroundScene =
  | "clear-day"
  | "clear-night"
  | "cloudy"
  | "rain"
  | "snow"
  | "storm"
  | "fog"
  | "wind"
  | "default";

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
      return isDay ? "cloudy" : "clear-night";
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

export function renderBackground(
  enabled: boolean,
  scene: BackgroundScene,
  cloudCoverage: number | null = null,
): TemplateResult | typeof nothing {
  if (!enabled) return nothing;
  // Light enhancement: scale cloud layer opacity from coverage (display-driven, no toggle)
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
      ></div>
      <div class="vk-bg__layer vk-bg__precip"></div>
      <div class="vk-bg__scrim"></div>
      <div class="vk-bg__layer vk-bg__fx"></div>
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

  /* Rain: sparse falling needles on 3 staggered layers */
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
  .vk-bg--rain .vk-bg__precip {
    inset: -40% 0 0 0;
    background-image: repeating-linear-gradient(
      105deg,
      transparent 0,
      transparent 46px,
      rgba(210, 228, 255, 0.55) 46px,
      rgba(210, 228, 255, 0.15) 47px,
      transparent 48px,
      transparent 95px
    );
    background-size: 95px 70px;
    animation: vk-rain-a 0.65s linear infinite;
    opacity: 0.75;
  }
  .vk-bg--rain .vk-bg__precip::before {
    inset: -50% 0 0 0;
    background-image: repeating-linear-gradient(
      100deg,
      transparent 0,
      transparent 62px,
      rgba(190, 215, 255, 0.45) 62px,
      rgba(190, 215, 255, 0.1) 63.5px,
      transparent 65px,
      transparent 130px
    );
    background-size: 130px 90px;
    animation: vk-rain-b 0.95s linear infinite;
    opacity: 0.55;
  }
  .vk-bg--rain .vk-bg__precip::after {
    inset: -45% 0 0 0;
    background-image: repeating-linear-gradient(
      110deg,
      transparent 0,
      transparent 38px,
      rgba(230, 240, 255, 0.4) 38px,
      transparent 39px,
      transparent 88px
    );
    background-size: 88px 55px;
    animation: vk-rain-c 0.48s linear infinite;
    opacity: 0.45;
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
  .vk-bg--storm .vk-bg__precip {
    inset: -40% 0 0 0;
    background-image: repeating-linear-gradient(
      108deg,
      transparent 0,
      transparent 36px,
      rgba(180, 205, 255, 0.65) 36px,
      rgba(180, 205, 255, 0.2) 37.5px,
      transparent 39px,
      transparent 78px
    );
    background-size: 78px 60px;
    animation: vk-rain-a 0.42s linear infinite;
    opacity: 0.7;
  }
  .vk-bg--storm .vk-bg__precip::before {
    inset: -50% 0 0 0;
    background-image: repeating-linear-gradient(
      102deg,
      transparent 0,
      transparent 54px,
      rgba(160, 190, 255, 0.5) 54px,
      transparent 56px,
      transparent 115px
    );
    background-size: 115px 75px;
    animation: vk-rain-b 0.7s linear infinite;
    opacity: 0.55;
  }
  .vk-bg--storm .vk-bg__precip::after {
    inset: -45% 0 0 0;
    background-image: repeating-linear-gradient(
      112deg,
      transparent 0,
      transparent 28px,
      rgba(220, 230, 255, 0.45) 28px,
      transparent 29px,
      transparent 70px
    );
    background-size: 70px 48px;
    animation: vk-rain-c 0.32s linear infinite;
    opacity: 0.5;
  }
  .vk-bg--storm .vk-bg__fx {
    animation: vk-sky-flash 9s ease-in-out infinite;
  }
  .vk-bg--storm .vk-bg__fx::before {
    left: 56%;
    top: 4%;
    width: 34px;
    height: 58%;
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
    filter: drop-shadow(0 0 10px rgba(255, 255, 240, 0.95))
      drop-shadow(0 0 22px rgba(180, 210, 255, 0.7));
    opacity: 0;
    animation: vk-bolt 9s ease-in-out infinite;
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
  .vk-bg--wind .vk-bg__sky {
    background: linear-gradient(180deg, #5d8eb8 0%, #8eb4d4 55%, #c5dced 100%);
  }
  .vk-bg--wind .vk-bg__fx {
    background: repeating-linear-gradient(
      95deg,
      transparent,
      transparent 40px,
      rgba(255, 255, 255, 0.12) 40px,
      rgba(255, 255, 255, 0.12) 42px
    );
    animation: vk-drift 8s linear infinite;
  }

  @keyframes vk-rain-a {
    from {
      background-position: 0 0;
    }
    to {
      background-position: 18px 70px;
    }
  }
  @keyframes vk-rain-b {
    from {
      background-position: 10px 0;
    }
    to {
      background-position: -12px 90px;
    }
  }
  @keyframes vk-rain-c {
    from {
      background-position: -6px 0;
    }
    to {
      background-position: 14px 55px;
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
  @keyframes vk-sky-flash {
    0%,
    7%,
    11%,
    60%,
    64%,
    100% {
      background: transparent;
    }
    7.8%,
    8.4% {
      background: rgba(255, 255, 240, 0.55);
    }
    9%,
    10.2% {
      background: rgba(255, 255, 245, 0.75);
    }
    61.2% {
      background: rgba(210, 225, 255, 0.4);
    }
    62% {
      background: rgba(255, 255, 245, 0.65);
    }
  }
  @keyframes vk-bolt {
    0%,
    7%,
    11%,
    60%,
    64%,
    100% {
      opacity: 0;
    }
    7.8% {
      opacity: 0.85;
    }
    8.2% {
      opacity: 0.2;
    }
    9%,
    10% {
      opacity: 1;
    }
    10.5% {
      opacity: 0;
    }
    61.2% {
      opacity: 0.7;
    }
    62.2% {
      opacity: 0;
    }
  }
`;
