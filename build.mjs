import { readFile } from "node:fs/promises";
import { build } from "esbuild";

const manifest = JSON.parse(await readFile("custom_components/nba_center/manifest.json", "utf8"));
if (!manifest.version) throw new Error("manifest.json must define an integration version");

const result = await build({
  entryPoints: ["frontend/src/nba-center-card.js"],
  outfile: "custom_components/nba_center/www/nba-center-card.js",
  bundle: true,
  packages: "bundle",
  metafile: true,
  format: "esm",
  target: ["es2022"],
  define: { __BUILD_VERSION__: JSON.stringify(manifest.version) },
  minify: true,
  sourcemap: false,
  legalComments: "none",
});
console.log("ESBUILD INPUTS", JSON.stringify(result.metafile.inputs));
console.log("ESBUILD OUTPUT IMPORTS", JSON.stringify(result.metafile.outputs["custom_components/nba_center/www/nba-center-card.js"].imports));
console.log("ESBUILD OUTPUT BYTES", result.metafile.outputs["custom_components/nba_center/www/nba-center-card.js"].bytes);
