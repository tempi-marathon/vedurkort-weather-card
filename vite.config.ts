import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "VedurkortWeatherCard",
      formats: ["es"],
      fileName: () => "vedurkort-weather-card.js",
    },
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    target: "es2022",
    minify: "esbuild",
  },
  assetsInclude: ["**/*.svg"],
});
