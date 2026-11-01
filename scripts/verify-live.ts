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
import { writeFileSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { routes, isIndexable } from "@/lib/routes";
import { absoluteUrl, baseUrl, operator, reservationReady } from "@/lib/site";
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
  for (const f of readdirSync("public").filter((x) => /^(google[0-9a-f]+|naver[0-9a-f]+)\.html$/.test(x))) {
    const r = await get(`${LIVE}/${f}`, "manual");
    const body = Buffer.from(await r.arrayBuffer());
    const same = body.equals(readFileSync(join("public", f)));
    check(`소유권 인증 파일 /${f} 200·내용 일치`, r.status === 200 && same, `${r.status} ${r.headers.get("content-type") ?? ""} "${body.toString("utf8").trim().slice(0, 80)}"`);
  }
  if (reservationReady()) {
    const rs = await get(LIVE + "/reservation/");
    const rh = await rs.text();
    const hrefs = (track: string) => [...rh.matchAll(new RegExp(`<a[^>]*href="([^"]+)"[^>]*data-track="${track}"`, "g"))].map((m) => m[1]!.replace(/&amp;/g, "&"));
    for (const [track, want] of [
      ["click_kakao", operator.kakaoUrl],
      ["click_line", operator.lineUrl],
      ["click_telegram", operator.telegramUrl],
      ["click_call", operator.phone ? `tel:${operator.phone.replace(/[^0-9+]/g, "")}` : null],
      ["click_sms", operator.smsNumber ? `sms:${operator.smsNumber}` : null],
    ] as const) {
      if (!want) continue;
      const got = hrefs(track);
      check(`예약 버튼 ${track} 링크 정확`, got.length > 0 && got.every((h) => h === want), got.slice(0, 3).join(", "));
    }
    check("예약 문의 폼 실행 버튼(문자) 존재", /data-testid="rsv-submit"/.test(rh) && rh.includes(`sms:${operator.smsNumber}`));
    check("예약 폼 연락 방식 선택(문자·카카오톡·LINE·텔레그램·전화)", ["문자", "카카오톡", "LINE", "텔레그램", "전화"].every((m) => rh.includes(`value="${{ 문자: "sms", 카카오톡: "kakao", LINE: "line", 텔레그램: "telegram", 전화: "call" }[m]}"`)));
    check("예약 완료/저장 허위 표시 없음", !/예약(이)?\s?(완료|접수되었습니다|확정되었습니다)|저장되었습니다/.test(rh.replace(/<script[\s\S]*?<\/script>/g, "")));
    const home = await (await get(LIVE + "/")).text();
    const rsvPath = new URL(absoluteUrl("/reservation/")).pathname;
    check("상단 메뉴 '예약 문의' → /reservation/", new RegExp(`href="${rsvPath}"[^>]*data-testid="header-reservation"`).test(home));
    check("히어로 '예약 문의하기' → /reservation/", new RegExp(`href="${rsvPath}"[^>]*data-testid="hero-reservation"`).test(home) && home.includes("예약 문의하기"));
    const quick = home.match(/data-testid="hero-quick"[\s\S]*?<\/ul>/)?.[0] ?? "";
    check("첫 화면 전화·문자·카카오톡 빠른 문의", quick.includes(`tel:${operator.phone?.replace(/[^0-9+]/g, "")}`) && quick.includes(`sms:${operator.smsNumber}`) && quick.includes(operator.kakaoUrl ?? "__"));
    const bar = home.match(/aria-label="빠른 연락"[\s\S]*?<\/nav>/)?.[0] ?? "";
    check("모바일 하단 예약·전화·카카오톡 버튼", bar.includes(`href="${rsvPath}"`) && bar.includes("tel:") && bar.includes(operator.kakaoUrl ?? "__"));
    const ids = ["reservation", "compare", "areas", "steps", "faq"].map((id) => home.indexOf(`id="${id}"`));
    check("홈 섹션 순서: 예약 안내 → 업종 비교 → 지역 → 이용 가이드 → FAQ", ids.every((v, i) => v > 0 && (i === 0 || v > ids[i - 1]!)));
  }
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
    const names = results.map((r) => `${r.ok ? "OK" : "FAIL"} ${r.name}${r.detail && /canonical|sitemap|robots|404|301|소유권|예약/.test(r.name) ? ` [${r.detail}]` : ""}`);
    for (let i = 0; i < names.length; i += 25) console.log(`::notice title=verify:live checks ${i + 1}-${Math.min(i + 25, names.length)}::${names.slice(i, i + 25).join(" | ").slice(0, 3900)}`);
  }
  process.exit(failed.length ? 1 : 0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
