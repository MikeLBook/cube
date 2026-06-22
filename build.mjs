import * as esbuild from "esbuild";
import { mkdir, copyFile, rm, watch as fsWatch } from "node:fs/promises";

// Bundle each presentation into a flat build/ directory. Output names are chosen here, so the
// 2D view ships as index.{html,css,js} (the site's entry point) and the 3D view as 3DView.*.
const OUT = "build";
const isWatch = process.argv.includes("--watch");

const JS = {
  index: "src/presentations/2DView/2DView.ts",
  "3DView": "src/presentations/3DView/3DView.ts",
};
const CSS = {
  index: "src/presentations/2DView/2DView.css",
  "3DView": "src/presentations/3DView/3DView.css",
};
// esbuild has no HTML loader, so HTML is copied verbatim (and the 2D view renamed to index.html).
const HTML = [
  ["src/presentations/2DView/2DView.html", `${OUT}/index.html`],
  ["src/presentations/3DView/3DView.html", `${OUT}/3DView.html`],
];

const opts = (entryPoints) => ({ entryPoints, bundle: true, outdir: OUT });

async function copyHtml() {
  await mkdir(OUT, { recursive: true });
  await Promise.all(HTML.map(([from, to]) => copyFile(from, to)));
}

if (isWatch) {
  const contexts = await Promise.all([
    esbuild.context(opts(JS)),
    esbuild.context(opts(CSS)),
  ]);
  await Promise.all(contexts.map((c) => c.watch()));
  await copyHtml();
  // esbuild only watches the JS/CSS dependency graphs, so re-copy HTML when it changes too.
  for (const [from] of HTML) {
    (async () => {
      for await (const _ of fsWatch(from)) await copyHtml();
    })();
  }
  console.log(`watching → ${OUT}/`);
} else {
  await rm(OUT, { recursive: true, force: true });
  await Promise.all([esbuild.build(opts(JS)), esbuild.build(opts(CSS))]);
  await copyHtml();
  console.log(`built → ${OUT}/`);
}
