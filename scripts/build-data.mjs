import { build } from "esbuild";
await build({
  entryPoints: ["server/data-server.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  outfile: "dist-data/server.mjs",
});
console.log(
  "Private PostgreSQL API compiled. This does not verify database connectivity.",
);
