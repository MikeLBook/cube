// Bundles verify/solverVerification.ts with esbuild (the same bundler the site uses,
// so extensionless TS imports resolve) and runs it, forwarding CLI args through.
//
//   node verify/run.mjs count            # tally outcomes over 5000 scrambles
//   node verify/run.mjs count 20000      # ...over N scrambles
//   node verify/run.mjs repro <outcome>  # shortest scramble producing <outcome>
//   node verify/run.mjs trace '<json>'   # step through one scramble
//
// Outcomes: ok, edges-stuck, corners-stuck, middle-stuck, edge-check-early,
//           corner-check-early, middle-check-early, checks-disagree, budget
//           (see solverVerification.ts for what each means).
import * as esbuild from "esbuild";
import { mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

await mkdir("verify/dist", { recursive: true });
const out = resolve("verify/dist/harness.cjs");
await esbuild.build({
  entryPoints: ["verify/solverVerification.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: out,
});
await import(pathToFileURL(out).href);
