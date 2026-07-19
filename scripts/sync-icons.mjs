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
  "hail",
  "thunderstorms",
  "thunderstorms-rain",
  "partly-cloudy-day",
  "partly-cloudy-night",
  "extreme-rain",
  "rain",
  "snow",
  "sleet",
  "wind",
  "weather-alert",
  "not-available",
  "sunrise",
  "sunset",
  "humidity",
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
  // Touch a manifest for debugging
  const stylesPresent = STYLES.filter((s) =>
    existsSync(join(outRoot, "animated", s)),
  );
  console.log(`Styles: ${stylesPresent.join(", ")}`);
  console.log(
    `Sample dir entries: ${readdirSync(join(outRoot, "animated", "fill")).slice(0, 5).join(", ")}`,
  );
}

sync();
