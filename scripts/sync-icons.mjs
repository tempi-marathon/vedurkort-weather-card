import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const ICONS = [
  "clear-day",
  "clear-night",
  "cloudy",
  "fog",
  "fog-day",
  "fog-night",
  "hail",
  "overcast",
  "overcast-day",
  "overcast-night",
  "overcast-day-rain",
  "overcast-night-rain",
  "overcast-day-snow",
  "overcast-night-snow",
  "overcast-day-sleet",
  "overcast-night-sleet",
  "overcast-day-hail",
  "overcast-night-hail",
  "extreme-rain",
  "extreme-day-rain",
  "extreme-night-rain",
  "rain",
  "snow",
  "sleet",
  "partly-cloudy-day",
  "partly-cloudy-night",
  "thunderstorms",
  "thunderstorms-day",
  "thunderstorms-night",
  "thunderstorms-rain",
  "thunderstorms-day-rain",
  "thunderstorms-night-rain",
  "wind",
  "weather-alert",
  "not-available",
  "sunrise",
  "sunset",
  "humidity",
  "barometer",
  "thermometer",
  "thermometer-raindrop",
  "uv-index",
  "uv-index-1",
  "uv-index-2",
  "uv-index-3",
  "uv-index-4",
  "uv-index-5",
  "uv-index-6",
  "uv-index-7",
  "uv-index-8",
  "uv-index-9",
  "uv-index-10",
  "uv-index-11",
  "uv-index-11-plus",
  "wind-beaufort-0",
  "wind-beaufort-1",
  "wind-beaufort-2",
  "wind-beaufort-3",
  "wind-beaufort-4",
  "wind-beaufort-5",
  "wind-beaufort-6",
  "wind-beaufort-7",
  "wind-beaufort-8",
  "wind-beaufort-9",
  "wind-beaufort-10",
  "wind-beaufort-11",
  "wind-beaufort-12",
  "wind-direction-n",
  "wind-direction-ne",
  "wind-direction-e",
  "wind-direction-se",
  "wind-direction-s",
  "wind-direction-sw",
  "wind-direction-w",
  "wind-direction-nw",
];

const STYLES = ["fill", "flat", "line", "monochrome"];
const PACKAGES = [
  { name: "@meteocons/svg", dest: "animated" },
  { name: "@meteocons/svg-static", dest: "static" },
];

function resolvePkg(name) {
  return dirname(require.resolve(`${name}/package.json`));
}

function sync() {
  const outRoot = join(root, "src/assets/meteocons");
  let copied = 0;
  let missing = 0;

  for (const pkg of PACKAGES) {
    const pkgRoot = resolvePkg(pkg.name);
    for (const style of STYLES) {
      const styleDir = join(pkgRoot, style);
      if (!existsSync(styleDir)) {
        console.warn(`Missing style dir: ${styleDir}`);
        continue;
      }
      const destDir = join(outRoot, pkg.dest, style);
      mkdirSync(destDir, { recursive: true });
      for (const icon of ICONS) {
        const src = join(styleDir, `${icon}.svg`);
        const dest = join(destDir, `${icon}.svg`);
        if (!existsSync(src)) {
          console.warn(`Missing icon: ${pkg.name}/${style}/${icon}.svg`);
          missing += 1;
          continue;
        }
        copyFileSync(src, dest);
        copied += 1;
      }
    }
  }

  console.log(`Synced ${copied} icons (${missing} missing)`);
  console.log(
    `Sample: ${readdirSync(join(outRoot, "animated", "fill")).slice(0, 8).join(", ")}`,
  );
}

sync();
