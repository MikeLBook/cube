// Bundles Harness.ts with esbuild (the same bundler the site uses, so extensionless
// TS imports resolve) and runs it, forwarding CLI args through.
//
//   node src/solver/verification/run.mjs count            # tally outcomes over 5000 scrambles
//   node src/solver/verification/run.mjs count 20000      # ...over N scrambles
//   node src/solver/verification/run.mjs realcount <N>    # solve rate driving the real solver.run()
//   node src/solver/verification/run.mjs statecount <N>   # solve rate loading each scramble via setState
//   node src/solver/verification/run.mjs repro <outcome>  # shortest scramble producing <outcome>
//   node src/solver/verification/run.mjs trace '<json>'   # step through one scramble
//
// Outcomes: ok, edges-stuck, corners-stuck, middle-stuck, white-edges-stuck,
//           white-corners-stuck, edge-check-early, corner-check-early,
//           middle-check-early, white-edge-check-early, white-corner-check-early,
//           checks-disagree, budget
//           (see Harness.ts for what each means).
//
// Paths are resolved relative to this file (not the cwd) so `npm run verify` and a
// direct `node .../run.mjs` behave the same from anywhere. The bundle lands in a
// git-ignored dist/ beside this script.
import * as esbuild from "esbuild";
import { mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const here = import.meta.dirname;
const dist = resolve(here, "dist");
await mkdir(dist, { recursive: true });
const out = resolve(dist, "harness.cjs");
await esbuild.build({
  entryPoints: [resolve(here, "Harness.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: out,
});
await import(pathToFileURL(out).href);
