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
): TemplateResult | typeof nothing {
  if (!enabled) return nothing;
  return html`
    <div class="vk-bg vk-bg--${scene}" aria-hidden="true">
      <div class="vk-bg__layer vk-bg__sky"></div>
      <div class="vk-bg__layer vk-bg__clouds"></div>
      <div class="vk-bg__layer vk-bg__precip"></div>
      <div class="vk-bg__layer vk-bg__fx"></div>
      <div class="vk-bg__scrim"></div>
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
  .vk-bg--rain .vk-bg__sky {
    background: linear-gradient(180deg, #3d4f66 0%, #5a6e86 60%, #74879c 100%);
  }
  .vk-bg--rain .vk-bg__precip {
    background-image: repeating-linear-gradient(
      -20deg,
      transparent,
      transparent 8px,
      rgba(200, 220, 255, 0.35) 8px,
      rgba(200, 220, 255, 0.35) 10px
    );
    background-size: 24px 40px;
    animation: vk-rain 0.55s linear infinite;
    opacity: 0.55;
  }
  .vk-bg--snow .vk-bg__sky {
    background: linear-gradient(180deg, #7a8fa8 0%, #b0c0d2 55%, #dce6f0 100%);
  }
  .vk-bg--snow .vk-bg__precip {
    background-image:
      radial-gradient(circle, #fff 1.2px, transparent 1.4px),
      radial-gradient(circle, #fff 1px, transparent 1.2px);
    background-size: 36px 36px, 52px 52px;
    background-position: 0 0, 18px 12px;
    animation: vk-snow 4.5s linear infinite;
    opacity: 0.7;
  }
  .vk-bg--storm .vk-bg__sky {
    background: linear-gradient(180deg, #1c2230 0%, #2e3a4e 50%, #3d4d63 100%);
  }
  .vk-bg--storm .vk-bg__fx {
    animation: vk-flash 7s ease-in-out infinite;
  }
  .vk-bg--storm .vk-bg__precip {
    background-image: repeating-linear-gradient(
      -25deg,
      transparent,
      transparent 7px,
      rgba(180, 200, 255, 0.4) 7px,
      rgba(180, 200, 255, 0.4) 9px
    );
    background-size: 20px 36px;
    animation: vk-rain 0.4s linear infinite;
    opacity: 0.45;
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
  @keyframes vk-rain {
    from {
      background-position: 0 0;
    }
    to {
      background-position: 24px 40px;
    }
  }
  @keyframes vk-snow {
    from {
      background-position: 0 0, 18px 12px;
    }
    to {
      background-position: 0 36px, 18px 64px;
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
  @keyframes vk-flash {
    0%,
    88%,
    100% {
      background: transparent;
    }
    90%,
    92% {
      background: rgba(255, 255, 220, 0.35);
    }
  }
`;
