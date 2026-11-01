/**
 * npm run verify:live -- <공개 URL>
 * GitHub Pages 배포 직후 실제 공개 URL을 검사한다 (deploy.yml의 verify job).
 *
 *  - 모든 라우트 200, 끝 슬래시 없는 주소 → 301
 *  - canonical / og:url = 기대 URL, meta robots = 색인 정책
 *  - 페이지가 참조하는 CSS·JS·이미지·srcset·아이콘·og:image 전부 200
 *  - 내부 링크 전부 200 (리디렉션 따라감)
 *  - sitemap.xml = 색인 페이지 집합, robots.txt 내용
 *  - 없는 경로 404
 * Pages CDN 반영 지연을 고려해 첫 요청은 최대 5분간 재시도한다.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { routes, isIndexable } from "@/lib/routes";
import { absoluteUrl, baseUrl } from "@/lib/site";
import { isTestHost } from "@/lib/env";

const LIVE = (process.argv[2] || process.env.LIVE_URL || baseUrl()).replace(/\/$/, "");
const TITLE = "verify:live";
const results: { name: string; ok: boolean; detail?: string }[] = [];
const check = (name: string, ok: boolean, detail?: string) => {
  results.push({ name, ok, detail });
  console.log(`  ${ok ? "✓" : "✖"} ${name}${detail ? ` — ${detail}` : ""}`);
  // GitHub Actions에서는 실패 항목을 annotation으로 남겨 로그 없이도 API로 확인할 수 있게 한다
  if (!ok && process.env.GITHUB_ACTIONS) console.log(`::error title=${TITLE}::${(name + (detail ? " — " + detail : "")).replace(/\r?\n/g, " ").slice(0, 900)}`);
};
const attr = (tag: string, n: string) => tag.match(new RegExp(`\\s${n}="([^"]*)"`, "i"))?.[1]?.replace(/&amp;/g, "&") ?? null;
const meta = (html: string, key: string, by = "name") =>
  (html.match(/<meta\s[^>]*>/gi) ?? []).map((t) => (attr(t, by) === key ? attr(t, "content") : null)).find(Boolean) ?? null;

async function get(url: string, redirect: RequestRedirect = "follow") {
  return fetch(url, { redirect, headers: { "user-agent": "daegu-karaoke-verify/1.0" } });
}

async function waitLive() {
  const until = Date.now() + 5 * 60_000;
  while (Date.now() < until) {
    try {
      const r = await get(LIVE + "/");
      if (r.status === 200) return true;
    } catch {}
    await new Promise((s) => setTimeout(s, 10_000));
  }
  return false;
}

async function main() {
  console.log(`[verify:live] ${LIVE}/ ${/127\.0\.0\.1|localhost/.test(LIVE) ? "(로컬 모의 — 실제 공개 URL 아님)" : isTestHost(LIVE) ? "(검증용 임시 URL)" : "(운영 URL)"}`);
  if (baseUrl() !== LIVE) console.log(`  (빌드 기준 URL ${baseUrl()} — canonical 비교는 빌드 기준 URL로 수행)`);
  check("공개 URL 응답", await waitLive());

  const assetRefs = new Set<string>();
  const linkRefs = new Set<string>();
  for (const r of routes) {
    const url = LIVE + r.path;
    const res = await get(url, "manual");
    const html = await res.text();
    check(`${r.path} 200`, res.status === 200, String(res.status));
    check(`${r.path} text/html`, (res.headers.get("content-type") ?? "").includes("text/html"));
    const canon = (html.match(/<link\s[^>]*rel="canonical"[^>]*>/i)?.[0] && attr(html.match(/<link\s[^>]*rel="canonical"[^>]*>/i)![0], "href")) || null;
    check(`${r.path} canonical`, canon === absoluteUrl(r.path), canon ?? "(없음)");
    check(`${r.path} og:url = canonical`, meta(html, "og:url", "property") === canon);
    const robots = meta(html, "robots") ?? "";
    check(`${r.path} robots ${isIndexable(r) ? "index" : "noindex"}`, isIndexable(r) ? !robots.includes("noindex") : robots.includes("noindex"), robots);
    if (r.path !== "/") {
      const ns = await get(url.replace(/\/$/, ""), "manual");
      check(`${r.path} 슬래시 없는 주소 301`, ns.status === 301, `${ns.status} → ${ns.headers.get("location") ?? ""}`);
    }
    for (const t of html.match(/<link\s[^>]*>/gi) ?? []) if (/stylesheet|icon|preload/.test(attr(t, "rel") ?? "")) assetRefs.add(new URL(attr(t, "href")!, url).href);
    for (const t of html.match(/<script\s[^>]*src="[^"]+"[^>]*>/gi) ?? []) assetRefs.add(new URL(attr(t, "src")!, url).href);
    for (const t of html.match(/<img\s[^>]*>/gi) ?? []) if (attr(t, "src")) assetRefs.add(new URL(attr(t, "src")!, url).href);
    for (const t of html.match(/<source\s[^>]*>/gi) ?? [])
      for (const p of (attr(t, "srcset") ?? "").split(",")) if (p.trim()) assetRefs.add(new URL(p.trim().split(/\s+/)[0]!, url).href);
    const og = meta(html, "og:image", "property");
    if (og) assetRefs.add(og);
    for (const t of html.match(/<a\s[^>]*>/gi) ?? []) {
      const h = attr(t, "href");
      if (h && !h.startsWith("#") && !/^(tel|sms|mailto):/.test(h)) {
        const abs = new URL(h, url);
        if (abs.origin === new URL(LIVE).origin) linkRefs.add(abs.href.split("#")[0]!);
      }
    }
  }
  const sameOrigin = [...assetRefs].filter((u) => u.startsWith(new URL(LIVE).origin));
  let assetFail: string[] = [];
  for (const u of sameOrigin) {
    const r = await get(u);
    if (r.status !== 200) assetFail.push(`${r.status} ${u}`);
  }
  check(`CSS·JS·이미지·아이콘 ${sameOrigin.length}개 200`, assetFail.length === 0, assetFail.slice(0, 5).join(", "));
  const linkFail: string[] = [];
  for (const u of linkRefs) {
    const r = await get(u);
    if (r.status !== 200) linkFail.push(`${r.status} ${u}`);
  }
  check(`내부 링크 ${linkRefs.size}개 200`, linkFail.length === 0, linkFail.slice(0, 5).join(", "));

  const sm = await get(LIVE + "/sitemap.xml");
  const xml = await sm.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!).sort();
  const expected = routes.filter(isIndexable).map((r) => absoluteUrl(r.path)).sort();
  check("sitemap.xml 200", sm.status === 200);
  check("sitemap = 색인 페이지", JSON.stringify(locs) === JSON.stringify(expected), `${locs.length}/${expected.length}`);
  for (const l of locs) {
    const r = await get(l.replace(baseUrl(), LIVE), "manual");
    if (r.status !== 200) check(`sitemap URL 200: ${l}`, false, String(r.status));
  }
  const rb = await get(LIVE + "/robots.txt");
  const rbt = await rb.text();
  check("robots.txt 200", rb.status === 200);
  check("robots.txt Sitemap 선언", rbt.includes(`Sitemap: ${absoluteUrl("/sitemap.xml")}`));
  check("robots.txt 전체 차단 아님", !/^Disallow:\s*\/\s*$/im.test(rbt));
  const nf = await get(LIVE + "/__no_such_page__/", "manual");
  check("없는 경로 404", nf.status === 404, String(nf.status));

  mkdirSync("reports", { recursive: true });
  const urlKind = /127\.0\.0\.1|localhost/.test(LIVE) ? "local-emulation" : isTestHost(LIVE) ? "test" : "production";
  writeFileSync(
    "reports/live-verify.json",
    JSON.stringify({ checkedAt: new Date().toISOString(), live: LIVE, urlKind, canonicalBase: baseUrl(), results }, null, 2),
  );
  const failed = results.filter((r) => !r.ok);
  console.log(`[verify:live] ${results.length - failed.length}/${results.length} passed`);
  if (process.env.GITHUB_ACTIONS) {
    // 통과 내역도 API(annotations)로 확인할 수 있도록 요약을 notice로 남긴다 (항목명은 묶어서 1~3줄)
    console.log(`::notice title=verify:live summary::${LIVE}/ — ${results.length - failed.length}/${results.length} passed (assets ${sameOrigin.length}, internal links ${linkRefs.size}, sitemap ${locs.length})`);
    const names = results.map((r) => `${r.ok ? "OK" : "FAIL"} ${r.name}${r.detail && /canonical|sitemap|robots|404|301/.test(r.name) ? ` [${r.detail}]` : ""}`);
    for (let i = 0; i < names.length; i += 25) console.log(`::notice title=verify:live checks ${i + 1}-${Math.min(i + 25, names.length)}::${names.slice(i, i + 25).join(" | ").slice(0, 3900)}`);
  }
  process.exit(failed.length ? 1 : 0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
