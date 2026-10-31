// 오프라인 검증용: Tailwind v4 compile API로 app/globals.css 를 빌드한다.
// (실제 배포는 @tailwindcss/postcss 가 같은 globals.css 를 처리)
import { compile } from "tailwindcss";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const out = process.argv[2] || "out";
const twDir = dirname(require.resolve("tailwindcss/package.json"));

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const sources = ["app", "components", "lib"].flatMap(walk).filter((f) => /\.(tsx?|css)$/.test(f));
const candidates = new Set();
for (const f of sources) for (const tok of readFileSync(f, "utf8").split(/[\s"'`{}()<>;,]+/)) if (tok) candidates.add(tok);

const input = readFileSync("app/globals.css", "utf8");
const compiler = await compile(input, {
  base: process.cwd(),
  loadStylesheet: async (id, base) => {
    const p = id === "tailwindcss" ? join(twDir, "index.css") : id.startsWith("tailwindcss/") ? join(twDir, id.slice(12)) : join(base, id);
    return { path: p, base: dirname(p), content: readFileSync(p.endsWith(".css") ? p : p + ".css", "utf8") };
  },
});
const css = compiler.build([...candidates]);
mkdirSync(join(out, "_next/static/css"), { recursive: true });
writeFileSync(join(out, "_next/static/css/app.css"), css);
console.log(`[offline-css] ${(css.length / 1024).toFixed(1)} KB from ${candidates.size} tokens`);
