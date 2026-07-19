import "./card";

console.info(
  "%c VEÐURKORT-WEATHER-CARD %c loaded ",
  "background:#0b6bcb;color:#fff;border-radius:4px 0 0 4px;padding:2px 6px",
  "background:#222;color:#fff;border-radius:0 4px 4px 0;padding:2px 6px",
);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "vedurkort-weather-card",
  name: "Veðurkort Weather Card",
  description:
    "Weather card with animated Meteocons icons, optional CSS backgrounds, and Chart.js forecasts",
  preview: true,
  documentationURL: "https://github.com/tempi-marathon/vedurkort-weather-card",
});

declare global {
  interface Window {
    customCards: Array<{
      type: string;
      name: string;
      description: string;
      preview?: boolean;
      documentationURL?: string;
    }>;
  }
}
