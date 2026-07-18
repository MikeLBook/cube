import * as esbuild from 'esbuild'
import { mkdir, copyFile, rm, watch as fsWatch } from 'node:fs/promises'
import { dirname } from 'node:path'

// Bundle each presentation into a flat build/ directory. Output names are chosen here, so the
// 2D view ships as index.{html,css,js} (the site's entry point) and the 3D view as 3DView.*.
const OUT = 'build'
const isWatch = process.argv.includes('--watch')

const JS = {
  index: 'src/presentations/2DWeb/2DWeb.ts',
  '3DWeb': 'src/presentations/3DWeb/3DWeb.ts'
}
const CSS = {
  index: 'src/presentations/2DWeb/2DWeb.css',
  '3DWeb': 'src/presentations/3DWeb/3DWeb.css'
}
// esbuild has no HTML loader, so HTML is copied verbatim (and the 2D Web renamed to index.html).
// The privacy policy ships as privacy/index.html so it's served at the clean URL /privacy.
const HTML = [
  ['src/presentations/2DWeb/2DWeb.html', `${OUT}/index.html`],
  ['src/presentations/3DWeb/3DWeb.html', `${OUT}/3D.html`],
  ['web/privacy.html', `${OUT}/privacy/index.html`]
]

const opts = (entryPoints) => ({ entryPoints, bundle: true, outdir: OUT })

async function copyHtml() {
  await mkdir(OUT, { recursive: true })
  await Promise.all(
    HTML.map(async ([from, to]) => {
      await mkdir(dirname(to), { recursive: true })
      await copyFile(from, to)
    })
  )
}

if (isWatch) {
  const contexts = await Promise.all([esbuild.context(opts(JS)), esbuild.context(opts(CSS))])
  await Promise.all(contexts.map((c) => c.watch()))
  await copyHtml()
  // esbuild only watches the JS/CSS dependency graphs, so re-copy HTML when it changes too.
  for (const [from] of HTML) {
    ;(async () => {
      for await (const _ of fsWatch(from)) await copyHtml()
    })()
  }
  console.log(`watching → ${OUT}/`)
} else {
  await rm(OUT, { recursive: true, force: true })
  await Promise.all([esbuild.build(opts(JS)), esbuild.build(opts(CSS))])
  await copyHtml()
  console.log(`built → ${OUT}/`)
}
