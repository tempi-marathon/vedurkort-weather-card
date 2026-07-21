import { defineConfig, type Plugin } from "vite";
import { resolve } from "node:path";

/** Lit's HTML comment-end regex misses the `--!>` variant flagged by CodeQL. */
function patchLitCommentEndRegex(): Plugin {
  return {
    name: "patch-lit-comment-end-regex",
    transform(code, id) {
      if (!id.includes("lit-html") || !id.endsWith(".js")) return;
      if (!code.includes("/-->")) return;
      const patched = code.replaceAll("/-->/g", "/--!?>/g");
      if (patched === code) return;
      return { code: patched, map: null };
    },
  };
}

export default defineConfig({
  plugins: [patchLitCommentEndRegex()],
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
