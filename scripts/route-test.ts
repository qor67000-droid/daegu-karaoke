/**
 * npm run test:routes [outDir]
 * out/ 을 GitHub Pages와 같은 규칙으로 로컬 서빙해 검사한다.
 *   - basePath(/repo) 아래에서만 서빙, 밖은 404
 *   - /repo/guide → 301 /repo/guide/ , /repo/guide/ → guide/index.html
 *   - 없는 경로 → 404 + 404.html
 * 검사: 응답 코드, 초기 HTML(H1·본문), 색인 정책(meta robots), CSS 적용 여부,
 *       모바일·데스크톱 가로 넘침, CTA 터치 영역, 클릭 이벤트, 실험실 LCP/CLS(로컬 — 실사용자 지표 아님)
 */
import { createServer, type Server } from "node:http";
import { readFileSync, readdirSync, existsSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";
import { routes, isIndexable } from "@/lib/routes";
import { basePath, operator, reservationReady } from "@/lib/site";

const OUT = process.argv[2] || "out";
const SHOTS = process.env.SCREENSHOT_DIR || "reports/screenshots";
const TAG = (process.env.SHOT_PREFIX ?? "default").replace(/-$/, "");
const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json",
};

function pagesServer(): Promise<{ server: Server; origin: string }> {
  return new Promise((res) => {
    const server = createServer((req, rsp) => {
      const url = decodeURIComponent((req.url || "/").split("?")[0]!);
      const notFound = () => {
        rsp.writeHead(404, { "content-type": TYPES[".html"]! });
        rsp.end(existsSync(join(OUT, "404.html")) ? readFileSync(join(OUT, "404.html")) : "404");
      };
      if (basePath && url !== basePath && !url.startsWith(basePath + "/")) return notFound();
      const rel = (basePath ? url.slice(basePath.length) : url) || "/";
      const target = join(OUT, rel);
      if (rel.endsWith("/")) {
        const f = join(target, "index.html");
        if (existsSync(f)) {
          rsp.writeHead(200, { "content-type": TYPES[".html"]! });
          return rsp.end(readFileSync(f));
        }
        return notFound();
      }
      if (existsSync(target) && statSync(target).isFile()) {
        rsp.writeHead(200, { "content-type": TYPES[extname(target)] ?? "application/octet-stream" });
        return rsp.end(readFileSync(target));
      }
      if (existsSync(join(target, "index.html"))) {
        rsp.writeHead(301, { location: url + "/" });
        return rsp.end();
      }
      notFound();
    });
    server.listen(0, "127.0.0.1", () => {
      const a = server.address();
      res({ server, origin: `http://127.0.0.1:${typeof a === "object" && a ? a.port : 0}` });
    });
  });
}

const TITLE = "test:routes";
const results: { name: string; ok: boolean; detail?: string }[] = [];
const check = (name: string, ok: boolean, detail?: string) => {
  results.push({ name, ok, detail });
  console.log(`  ${ok ? "✓" : "✖"} ${name}${detail ? ` — ${detail}` : ""}`);
  // GitHub Actions에서는 실패 항목을 annotation으로 남겨 로그 없이도 API로 확인할 수 있게 한다
  if (!ok && process.env.GITHUB_ACTIONS) console.log(`::error title=${TITLE}::${(name + (detail ? " — " + detail : "")).replace(/\r?\n/g, " ").slice(0, 900)}`);
};

async function main() {
  const { server, origin } = await pagesServer();
  const root = origin + basePath;
  console.log(`[test:routes] serving ${OUT}/ at ${root}/ (GitHub Pages 규칙)`);

  for (const r of routes) {
    const res = await fetch(root + r.path, { redirect: "manual" });
    const html = await res.text();
    check(`GET ${r.path} → 200`, res.status === 200, String(res.status));
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g, "").trim();
    check(`${r.path} 초기 HTML에 H1`, Boolean(h1), h1?.slice(0, 30));
    const robots = html.match(/<meta[^>]*name="robots"[^>]*content="([^"]+)"/)?.[1] ?? "";
    const expect = isIndexable(r) ? "index" : "noindex";
    check(`${r.path} robots=${expect}`, isIndexable(r) ? !robots.includes("noindex") : robots.includes("noindex"), robots || "(없음)");
    if (r.path !== "/") {
      const noSlash = await fetch(root + r.path.replace(/\/$/, ""), { redirect: "manual" });
      check(`${r.path.replace(/\/$/, "")} → 301 ${r.path}`, noSlash.status === 301 && noSlash.headers.get("location") === basePath + r.path, `${noSlash.status} ${noSlash.headers.get("location") ?? ""}`);
    }
  }
  for (const p of ["/no-such-page/", "/rooms/x/", "/대구가라오케/"]) {
    const res = await fetch(root + encodeURI(p), { redirect: "manual" });
    check(`GET ${p} → 404`, res.status === 404, String(res.status));
  }
  for (const p of ["/robots.txt", "/sitemap.xml", "/icon.svg", "/og-default.png", "/.nojekyll"]) {
    const res = await fetch(root + p);
    check(`GET ${p} → 200`, res.status === 200, String(res.status));
  }
  for (const f of readdirSync("public").filter((x) => /^(google[0-9a-f]+|naver[0-9a-f]+)\.html$/.test(x))) {
    const res = await fetch(`${root}/${f}`, { redirect: "manual" });
    const body = Buffer.from(await res.arrayBuffer());
    check(`GET /${f} → 200, 원본과 동일`, res.status === 200 && body.equals(readFileSync(join("public", f))), `${res.status}, ${body.length}B`);
  }
  if (basePath) {
    const res = await fetch(origin + "/guide/", { redirect: "manual" });
    check(`basePath 밖 /guide/ → 404`, res.status === 404, String(res.status));
  }

  // ── 브라우저 ──
  let browser: import("playwright").Browser | null = null;
  try {
    browser = await (await import("playwright")).chromium.launch();
  } catch (e) {
    console.log(`  - 브라우저 실행 불가(${(e as Error).message.split("\n")[0]}): 브라우저 테스트 건너뜀`);
  }
  const perf: Record<string, { lcp: number; cls: number }> = {};
  if (browser) {
    mkdirSync(SHOTS, { recursive: true });
    for (const vp of [
      { name: "mobile", width: 390, height: 844, isMobile: true, hasTouch: true },
      { name: "desktop", width: 1366, height: 900, isMobile: false, hasTouch: false },
    ]) {
      console.log(`[test:routes] browser ${vp.name}`);
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
      for (const r of routes) {
        const page = await ctx.newPage();
        const failed: string[] = [];
        page.on("response", (resp) => {
          if (resp.status() >= 400 && resp.url().startsWith(origin)) failed.push(`${resp.status()} ${resp.url().slice(origin.length)}`);
        });
        await page.addInitScript(() => {
          (window as any).__lcp = 0;
          (window as any).__cls = 0;
          new PerformanceObserver((l) => {
            for (const e of l.getEntries()) (window as any).__lcp = e.startTime;
          }).observe({ type: "largest-contentful-paint", buffered: true });
          new PerformanceObserver((l) => {
            for (const e of l.getEntries() as any[]) if (!e.hadRecentInput) (window as any).__cls += e.value;
          }).observe({ type: "layout-shift", buffered: true });
        });
        await page.goto(root + r.path, { waitUntil: "networkidle" });
        await page.waitForTimeout(250);
        const m = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth - window.innerWidth,
          lcp: (window as any).__lcp as number,
          cls: (window as any).__cls as number,
          bg: getComputedStyle(document.documentElement).backgroundColor,
          sheets: document.styleSheets.length,
          brokenImgs: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
          smallTargets: [...document.querySelectorAll<HTMLElement>("a.btn-gold, a.btn-ghost, nav[aria-label='빠른 연락'] a")]
            .filter((a) => a.offsetParent !== null)
            .map((a) => a.getBoundingClientRect())
            .filter((b) => b.height < 44 || b.width < 44).length,
        }));
        check(`${vp.name} ${r.path} CSS 적용(basePath 경로)`, m.sheets > 0 && m.bg === "rgb(11, 10, 13)", `${m.sheets} sheets, bg ${m.bg}`);
        check(`${vp.name} ${r.path} 하위 리소스 4xx 없음`, failed.length === 0, failed.join(", "));
        check(`${vp.name} ${r.path} 깨진 이미지 없음`, m.brokenImgs.length === 0, m.brokenImgs.join(", "));
        check(`${vp.name} ${r.path} 가로 넘침 없음`, m.overflow <= 0, `${m.overflow}px`);
        check(`${vp.name} ${r.path} CTA 터치 영역 ≥ 44px`, m.smallTargets === 0, `${m.smallTargets}개 미달`);
        perf[`${vp.name} ${r.path}`] = { lcp: Math.round(m.lcp), cls: Number(m.cls.toFixed(3)) };
        const safe = r.path === "/" ? "home" : r.path.replace(/^\/|\/$/g, "").replace(/\//g, "_");
        await page.screenshot({ path: join(SHOTS, `${TAG}-${vp.name}-${safe}.png`), fullPage: true });
        await page.close();
      }
      // 내비게이션 클릭 이동 (basePath 포함 링크가 실제로 이동하는지)
      const page = await ctx.newPage();
      await page.goto(root + "/");
      const navHref = await page.locator("footer nav a").nth(1).getAttribute("href");
      await page.locator("footer nav a").nth(1).click();
      // Next <Link>는 클라이언트 측 이동이라 load 이벤트가 다시 오지 않는다 → URL 변경을 기다린다
      const moved = await page
        .waitForURL(origin + (navHref ?? ""), { timeout: 10_000 })
        .then(() => true)
        .catch(() => false);
      const h1After = moved ? await page.locator("h1").first().textContent() : null;
      check(`${vp.name} 푸터 링크 클릭 이동`, moved && Boolean(h1After), `${navHref} → ${page.url().slice(origin.length)} (h1: ${h1After?.trim().slice(0, 20) ?? "-"})`);
      // ── 예약 안내 기능 ──
      if (reservationReady()) {
        const rp = await ctx.newPage();
        await rp.goto(root + "/reservation/", { waitUntil: "networkidle" });
        const exact = async (track: string, expected: string | null) => {
          if (!expected) return;
          const hrefs = await rp.locator(`main a[data-track="${track}"]`).evaluateAll((els) => els.map((e) => e.getAttribute("href")));
          check(`${vp.name} 예약페이지 ${track} 링크 = 제공 링크`, hrefs.length > 0 && hrefs.every((h) => h === expected), hrefs.join(", "));
        };
        await exact("click_kakao", operator.kakaoUrl);
        await exact("click_line", operator.lineUrl);
        await exact("click_telegram", operator.telegramUrl);
        await exact("click_call", operator.phone ? `tel:${operator.phone.replace(/[^0-9+]/g, "")}` : null);
        // 필수값 없이 문자 보내기 → 이동하지 않고 오류 표시
        await rp.evaluate(() => document.addEventListener("click", (e) => { const a = (e.target as HTMLElement).closest("a"); if (a && /^(sms|tel):|^https?:\/\/(open\.kakao|line\.me|t\.me)/.test(a.getAttribute("href") ?? "")) e.preventDefault(); }));
        await rp.locator('[data-testid="rsv-submit"]').click();
        const alerts = await rp.locator('form [role="alert"]').count();
        check(`${vp.name} 예약 폼 필수값 검증`, alerts >= 3, `오류 ${alerts}개`);
        // 입력 → 문자 본문 생성
        const d = new Date(Date.now() + 3 * 86400_000 + 9 * 3600_000).toISOString().slice(0, 10);
        await rp.fill('input[name="date"]', d);
        await rp.selectOption('select[name="time"]', "21:00");
        await rp.selectOption('select[name="people"]', "4명");
        await rp.fill('textarea[name="note"]', "중형룸 희망 & 테스트");
        await rp.check('input[name="adult"]');
        const href = (await rp.locator('[data-testid="rsv-submit"]').getAttribute("href")) ?? "";
        const body = decodeURIComponent(href.split(/[?&]body=/)[1] ?? "");
        check(
          `${vp.name} 문자 문의 링크 생성`,
          href.startsWith(`sms:${operator.smsNumber}`) && body.includes(`날짜: ${d}`) && body.includes("시간: 21:00") && body.includes("인원: 4명") && body.includes("중형룸 희망 & 테스트") && body.includes("희망 연락 방식: 문자"),
          href.slice(0, 40) + "…",
        );
        const okAlerts = await rp.locator('form [role="alert"]').count();
        check(`${vp.name} 입력 완료 후 오류 없음`, okAlerts === 0, String(okAlerts));
        // 연락 방식 선택 → 실행 버튼 전환
        for (const [label, want] of [
          ["카카오톡", operator.kakaoUrl],
          ["LINE", operator.lineUrl],
          ["텔레그램", operator.telegramUrl],
          ["전화", operator.phone ? `tel:${operator.phone.replace(/[^0-9+]/g, "")}` : null],
        ] as const) {
          if (!want) continue;
          await rp.locator("form fieldset label", { hasText: new RegExp(`^${label}$`) }).click();
          const h = await rp.locator('[data-testid="rsv-submit"]').getAttribute("href");
          const preview = await rp.locator('[data-testid="rsv-preview"]').textContent();
          check(`${vp.name} 연락 방식 '${label}' 선택 → 버튼 링크`, h === want && (preview ?? "").includes(`희망 연락 방식: ${label}`), h ?? "");
        }
        const fakeDone = await rp.getByText(/예약(이)? ?(완료|접수되었습니다|확정되었습니다)|저장되었습니다/).count();
        check(`${vp.name} 예약 완료/저장 허위 표시 없음`, fakeDone === 0, String(fakeDone));
        await rp.close();
        // 홈: 상단 메뉴·히어로 예약 버튼·빠른 문의 (첫 화면 노출)
        const hp = await ctx.newPage();
        await hp.goto(root + "/", { waitUntil: "networkidle" });
        const vh = vp.height;
        const inFold = async (sel: string) => {
          const box = await hp.locator(sel).first().boundingBox();
          return box !== null && box.y + box.height <= vh;
        };
        const hdr = hp.locator('[data-testid="header-reservation"]');
        check(`${vp.name} 상단 '예약 문의' 메뉴 → /reservation/`, (await hdr.getAttribute("href")) === `${basePath}/reservation/` && (await hdr.isVisible()));
        const hero = hp.locator('[data-testid="hero-reservation"]');
        check(`${vp.name} 히어로 '예약 문의하기' → /reservation/`, (await hero.getAttribute("href")) === `${basePath}/reservation/` && (await hero.textContent())?.includes("예약 문의하기") === true);
        check(`${vp.name} 히어로 예약 버튼 첫 화면 노출`, await inFold('[data-testid="hero-reservation"]'));
        const quick = await hp.locator('[data-testid="hero-quick"] a').evaluateAll((els) => els.map((e) => e.getAttribute("href")));
        const wantQuick = [`tel:${operator.phone?.replace(/[^0-9+]/g, "")}`, `sms:${operator.smsNumber}`, operator.kakaoUrl];
        check(`${vp.name} 첫 화면 전화·문자·카카오톡 빠른 문의`, JSON.stringify(quick) === JSON.stringify(wantQuick) && (await inFold('[data-testid="hero-quick"]')), quick.join(", "));
        // 기존 콘텐츠 유지 + 예약 안내 아래 배치
        const order = await hp.evaluate(() => ["reservation", "compare", "areas", "steps", "faq"].map((id) => document.getElementById(id)?.getBoundingClientRect().top ?? -1));
        check(`${vp.name} 예약 안내 → 업종 비교 → 지역 → 이용 가이드 → FAQ 순서`, order.every((v, i) => v > 0 && (i === 0 || v > order[i - 1]!)), order.map(Math.round).join(" < "));
        // 실제 클릭 이동
        await hero.click();
        const movedRsv = await hp.waitForURL(`${origin}${basePath}/reservation/`, { timeout: 10_000 }).then(() => true).catch(() => false);
        check(`${vp.name} 예약 문의하기 클릭 → 예약 페이지 이동`, movedRsv, hp.url().slice(origin.length));
        if (vp.isMobile) {
          await hp.goto(root + "/guide/", { waitUntil: "networkidle" });
          const bar = await hp.locator("nav[aria-label='빠른 연락'] a").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
          const want = [`${basePath}/reservation/`, `tel:${operator.phone?.replace(/[^0-9+]/g, "")}`, operator.kakaoUrl];
          check(`mobile 하단 예약·전화·카카오톡 버튼`, JSON.stringify(bar) === JSON.stringify(want), bar.join(", "));
          const barBox = await hp.locator("nav[aria-label='빠른 연락']").boundingBox();
          check(`mobile 하단 바 화면 하단 고정`, barBox !== null && Math.abs(barBox.y + barBox.height - vh) <= 2, JSON.stringify(barBox));
          await hp.locator('[data-testid="bar-reservation"]').click();
          const movedBar = await hp.waitForURL(`${origin}${basePath}/reservation/`, { timeout: 10_000 }).then(() => true).catch(() => false);
          check(`mobile 하단 예약 버튼 클릭 → 예약 페이지 이동`, movedBar, hp.url().slice(origin.length));
        } else {
          const barVisible = await hp.locator("nav[aria-label='빠른 연락']").isVisible();
          check(`desktop 하단 바 숨김`, !barVisible);
        }
        await hp.close();
      }
      // 클릭 추적
      const hasTel = await page.goto(root + "/contact/").then(() => page.locator('a[data-track="click_call"]:visible').count());
      if (hasTel && (await page.evaluate(() => Boolean((window as any).__clickTrackerReady)))) {
        await page.evaluate(() => document.addEventListener("click", (e) => e.preventDefault()));
        await page.locator('a[data-track="click_call"]:visible').first().click();
        const ev = await page.evaluate(() => ((window as any).dataLayer ?? []).map((x: any) => x.event ?? x[1]));
        check(`${vp.name} 전화 클릭 → dataLayer click_call`, ev.includes("click_call"), JSON.stringify(ev));
      } else console.log(`  - ${vp.name} 클릭 추적: ${hasTel ? "트래커 미로딩" : "공개된 전화번호 없음"} — 건너뜀`);
      await page.close();
      await ctx.close();
    }
    await browser.close();
  }
  server.close();

  mkdirSync("reports", { recursive: true });
  writeFileSync(`reports/route-test-${TAG}.json`, JSON.stringify({ generatedAt: new Date().toISOString(), basePath, note: "로컬 실험실 측정. 실사용자(CrUX) 지표 아님", results, perf }, null, 2));
  if (Object.keys(perf).length) {
    const lcps = Object.values(perf);
    console.log(`[test:routes] lab: max LCP ${Math.max(...lcps.map((x) => x.lcp))}ms, max CLS ${Math.max(...lcps.map((x) => x.cls))} (로컬, 네트워크 지연 없음)`);
  }
  const failed = results.filter((r) => !r.ok);
  console.log(`[test:routes] ${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
