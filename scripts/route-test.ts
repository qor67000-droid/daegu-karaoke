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
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";
import { routes, isIndexable } from "@/lib/routes";
import { basePath } from "@/lib/site";

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
      // 클릭 추적
      const hasTel = await page.goto(root + "/contact/").then(() => page.locator('a[data-track="click_call"]').count());
      if (hasTel && (await page.evaluate(() => Boolean((window as any).__clickTrackerReady)))) {
        await page.evaluate(() => document.addEventListener("click", (e) => e.preventDefault()));
        await page.locator('a[data-track="click_call"]').first().click();
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
