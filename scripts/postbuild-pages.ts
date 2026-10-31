/**
 * next build 이후 GitHub Pages용 산출물 보정
 * - out/.nojekyll : Jekyll이 _next 폴더(밑줄 시작)를 무시하지 않도록
 * - out/CNAME     : config/site.ts domain이 있을 때만 (커스텀 도메인)
 * - 이전 Netlify 산출물(_headers/_redirects)이 남아 있으면 제거
 */
import { writeFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { site } from "@/lib/site";

const out = process.argv[2] || "out";
if (!existsSync(out)) {
  console.error(`[postbuild] ${out}/ 없음 — next build 실패?`);
  process.exit(1);
}
writeFileSync(join(out, ".nojekyll"), "");
const cname = join(out, "CNAME");
if (site.domain) writeFileSync(cname, new URL(site.domain).host + "\n");
else if (existsSync(cname)) rmSync(cname);
for (const f of ["_headers", "_redirects"]) if (existsSync(join(out, f))) rmSync(join(out, f));
console.log(`[postbuild] .nojekyll${site.domain ? ` + CNAME(${new URL(site.domain).host})` : ""} → ${out}/`);
