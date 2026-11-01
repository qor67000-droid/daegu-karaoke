/**
 * ─────────────────────────────────────────────────────────────
 *  오프라인 검증 렌더러 (Next.js 설치가 불가능한 작업 환경용)
 *
 *  실제 app/ 의 페이지·레이아웃·metadata·sitemap·robots 모듈을 그대로 import 해서
 *  React 19 renderToString 으로 정적 HTML을 만들고 out/ 과 같은 구조로 출력한다.
 *  → scripts/seo-audit.ts, scripts/route-test.ts 를 실제 코드 기준으로 실행하기 위함.
 *
 *  basePath(NEXT_PUBLIC_BASE_PATH)·trailingSlash 출력 구조(out/guide/index.html)를 Next와 같게 만든다.
 *  한계: Next.js 자체의 head 병합 규칙, RSC 페이로드, 번들링, 타입검사는 재현하지 않는다.
 *        이것들은 GitHub Actions의 실제 `next build`에서 검증된다.
 * ─────────────────────────────────────────────────────────────
 */
import { renderToString } from "react-dom/server";
import { mkdirSync, writeFileSync, cpSync, readFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import type { Metadata, Viewport, MetadataRoute } from "next";

import RootLayout, { metadata as layoutMeta, viewport } from "@/app/layout";
import * as Home from "@/app/page";
import * as Guide from "@/app/guide/page";
import * as FirstVisit from "@/app/guide/first-visit/page";
import * as Areas from "@/app/guide/daegu-areas/page";
import * as About from "@/app/about/page";
import * as Rooms from "@/app/rooms/page";
import * as Price from "@/app/price/page";
import * as Location from "@/app/location/page";
import * as Contact from "@/app/contact/page";
import * as Reservation from "@/app/reservation/page";
import NotFound, { metadata as nfMeta } from "@/app/not-found";
import { routes } from "@/lib/routes";
import { basePath } from "@/lib/site";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

const OUT = process.argv[2] || "out";
const CSS_HREF = `${basePath}/_next/static/css/app.css`;
const CLIENT_JS = `${basePath}/_next/static/chunks/client.js`;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const meta = (k: string, v: string, by = "name") => `<meta ${by}="${esc(k)}" content="${esc(v)}"/>`;

function headTags(m: Metadata, v: Viewport): string {
  const base = m.metadataBase ?? layoutMeta.metadataBase;
  const abs = (u: string) => (base ? new URL(u, base).toString() : u);
  const t: string[] = ['<meta charset="utf-8"/>'];
  t.push(meta("viewport", `width=${v.width}, initial-scale=${v.initialScale}`));
  const title = typeof m.title === "string" ? m.title : (m.title as { absolute?: string })?.absolute;
  if (title) t.push(`<title>${esc(title)}</title>`);
  if (m.description) t.push(meta("description", m.description));
  if (m.applicationName) t.push(meta("application-name", m.applicationName));
  const canon = m.alternates?.canonical;
  if (canon) t.push(`<link rel="canonical" href="${esc(abs(String(canon)))}"/>`);
  if (m.robots && typeof m.robots === "object") {
    const r = m.robots as { index?: boolean; follow?: boolean };
    t.push(meta("robots", `${r.index === false ? "noindex" : "index"}, ${r.follow === false ? "nofollow" : "follow"}`));
  }
  if (m.formatDetection?.telephone === false) t.push(meta("format-detection", "telephone=no"));
  if (m.referrer) t.push(meta("referrer", String(m.referrer)));
  const ver = m.verification;
  if (ver?.google) t.push(meta("google-site-verification", String(ver.google)));
  for (const [k, val] of Object.entries(ver?.other ?? {})) t.push(meta(k, String(val)));
  const og = m.openGraph as Record<string, any> | undefined;
  if (og) {
    if (og.title) t.push(meta("og:title", og.title, "property"));
    if (og.description) t.push(meta("og:description", og.description, "property"));
    if (og.url) t.push(meta("og:url", abs(og.url), "property"));
    if (og.siteName) t.push(meta("og:site_name", og.siteName, "property"));
    if (og.locale) t.push(meta("og:locale", og.locale, "property"));
    for (const img of og.images ?? []) {
      t.push(meta("og:image", abs(img.url), "property"));
      if (img.width) t.push(meta("og:image:width", String(img.width), "property"));
      if (img.height) t.push(meta("og:image:height", String(img.height), "property"));
      if (img.alt) t.push(meta("og:image:alt", img.alt, "property"));
    }
    if (og.type) t.push(meta("og:type", og.type, "property"));
  }
  const tw = m.twitter as Record<string, any> | undefined;
  if (tw) {
    if (tw.card) t.push(meta("twitter:card", tw.card));
    if (tw.title) t.push(meta("twitter:title", tw.title));
    if (tw.description) t.push(meta("twitter:description", tw.description));
  }
  // Next 파일 규칙 app/icon.svg 모의: basePath 포함 아이콘 링크 (실제 Next는 ?해시 쿼리를 붙임)
  t.push(`<link rel="icon" href="${basePath}/icon.svg" type="image/svg+xml" sizes="any"/>`);
  if (v.themeColor) t.push(meta("theme-color", String(v.themeColor)));
  if (v.colorScheme) t.push(meta("color-scheme", String(v.colorScheme)));
  t.push(`<link rel="stylesheet" href="${CSS_HREF}"/>`);
  return t.join("");
}

function renderPage(file: string, Page: () => React.ReactNode, pageMeta: Metadata) {
  const body = renderToString(<RootLayout>{<Page />}</RootLayout>);
  const merged: Metadata = { ...layoutMeta, ...pageMeta };
  // 레이아웃이 <head>(CSP meta)를 렌더링하므로 그 안에 metadata 태그를 합친다
  const html =
    "<!DOCTYPE html>" +
    body.replace(/<head>([\s\S]*?)<\/head>/, (_m, inner) => `<head>${inner}${headTags(merged, viewport)}</head>`).replace(
      "</body>",
      `<script src="${CLIENT_JS}" defer></script></body>`,
    );
  const p = join(OUT, file);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, html);
}

function sitemapXml(items: MetadataRoute.Sitemap) {
  const rows = items
    .map(
      (i) =>
        `<url><loc>${esc(i.url)}</loc>${i.lastModified ? `<lastmod>${new Date(i.lastModified).toISOString()}</lastmod>` : ""}${
          i.changeFrequency ? `<changefreq>${i.changeFrequency}</changefreq>` : ""
        }${i.priority !== undefined ? `<priority>${i.priority}</priority>` : ""}</url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
}

function robotsTxt(r: MetadataRoute.Robots) {
  const lines: string[] = [];
  for (const rule of ([] as any[]).concat(r.rules)) {
    for (const ua of ([] as string[]).concat(rule.userAgent ?? "*")) lines.push(`User-Agent: ${ua}`);
    for (const a of ([] as string[]).concat(rule.allow ?? [])) lines.push(`Allow: ${a}`);
    for (const d of ([] as string[]).concat(rule.disallow ?? [])) lines.push(`Disallow: ${d}`);
    lines.push("");
  }
  if (r.host) lines.push(`Host: ${r.host}`);
  for (const s of ([] as string[]).concat(r.sitemap ?? [])) lines.push(`Sitemap: ${s}`);
  return lines.join("\n") + "\n";
}

if (existsSync(OUT)) rmSync(OUT, { recursive: true });
mkdirSync(OUT, { recursive: true });
cpSync("public", OUT, { recursive: true });
cpSync("app/icon.svg", join(OUT, "icon.svg"));

const MODULES: Record<string, { default: () => React.ReactNode; metadata: Metadata }> = {
  "/": Home,
  "/guide/": Guide,
  "/guide/first-visit/": FirstVisit,
  "/guide/daegu-areas/": Areas,
  "/about/": About,
  "/rooms/": Rooms,
  "/price/": Price,
  "/location/": Location,
  "/contact/": Contact,
  "/reservation/": Reservation,
};
for (const r of routes) {
  const mod = MODULES[r.path];
  if (!mod) throw new Error(`offline render: ${r.path} 모듈 매핑 없음`);
  renderPage(join(r.path.slice(1), "index.html"), mod.default, mod.metadata);
}
renderPage("404.html", NotFound, nfMeta);
writeFileSync(join(OUT, "sitemap.xml"), sitemapXml(sitemap()));
writeFileSync(join(OUT, "robots.txt"), robotsTxt(robots()));

// CSS · client JS 는 run.sh 가 out/_next/static 에 생성
console.log(`[offline-render] ${OUT}/ basePath="${basePath}" : ${routes.length + 1} html + sitemap.xml + robots.txt (${readFileSync(join(OUT, "robots.txt"), "utf8").split("\n")[1]})`);
