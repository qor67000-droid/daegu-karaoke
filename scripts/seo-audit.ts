/**
 * npm run seo [outDir]   (= npm run seo:audit)
 * GitHub Pages용 정적 export 결과(out/)를 검사한다. 오류가 있으면 exit 1.
 *
 *  - 페이지별 색인/noindex 기대값(lib/routes)과 실제 출력 HTML meta robots 대조
 *  - sitemap.xml = 색인 페이지 집합과 정확히 일치, robots.txt 정책
 *  - title/description 누락·중복, H1 1개, 헤딩 순서, 얇은 콘텐츠
 *  - canonical·og:url = 절대 URL + basePath 포함 + 끝 슬래시 정규형
 *  - 내부 링크·CSS·JS·이미지·srcset·아이콘이 basePath 아래 실제 파일로 해석되는지
 *  - JSON-LD 파싱·필수 속성·리뷰/별점 금지·FAQ 화면 일치·미공개 업체 정보 노출 금지
 *  - .nojekyll / CNAME / CSP meta / Netlify 잔재
 *  - 임시 문구·테스트 값·허위 최상급 표현
 */
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";
import { mode, baseUrl, absoluteUrl, basePath, site, operator, partners, businessReady, isProduction, urlKind } from "@/lib/site";
import { routes, isIndexable, isPublished } from "@/lib/routes";
import { useFixture } from "@/lib/env";

const OUT = process.argv[2] || "out";
type Level = "error" | "warn" | "info";
const issues: { level: Level; page: string; rule: string; msg: string }[] = [];
const add = (level: Level, page: string, rule: string, msg: string) => {
  issues.push({ level, page, rule, msg });
  if (process.env.GITHUB_ACTIONS && level !== "info")
    console.log(`::${level === "error" ? "error" : "warning"} title=seo ${rule}::${(page + ": " + msg).replace(/\r?\n/g, " ").slice(0, 900)}`);
};

if (!existsSync(OUT)) {
  console.error(`[seo] ${OUT}/ 가 없습니다. 먼저 npm run build 하세요.`);
  process.exit(1);
}

const BASE = baseUrl();
const BASE_ORIGIN = new URL(BASE + "/").origin;
const ph: Level = isProduction ? "error" : "warn";

/* ───── helpers ───── */
const walk = (d: string): string[] =>
  readdirSync(d).flatMap((f) => {
    const p = join(d, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");
const attr = (tag: string, name: string) => {
  const m = tag.match(new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)')`, "i"));
  return m ? decode(m[1] ?? m[2] ?? "") : null;
};
const metaContent = (html: string, key: string, by: "name" | "property" | "http-equiv" = "name") => {
  for (const t of html.match(/<meta\s[^>]*>/gi) ?? []) if ((attr(t, by) ?? "").toLowerCase() === key.toLowerCase()) return attr(t, "content");
  return null;
};
const visibleText = (html: string) =>
  decode(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

/**
 * 사이트 내부 URL 경로(basePath 포함) → out 파일. GitHub Pages 규칙:
 *  /repo/guide/  → out/guide/index.html (200)
 *  /repo/guide   → 디렉터리면 301 → /repo/guide/   (redirect: true)
 *  /repo/a.css   → out/a.css
 */
function resolvePath(urlPath: string): { file: string | null; redirect: boolean; basePathMissing: boolean } {
  let p = decodeURIComponent(urlPath.split(/[?#]/)[0] || "/");
  if (basePath) {
    if (p === basePath) return { file: resolvePath(basePath + "/").file, redirect: true, basePathMissing: false };
    if (!p.startsWith(basePath + "/")) return { file: null, redirect: false, basePathMissing: true };
    p = p.slice(basePath.length);
  }
  const rel = p.replace(/^\/+/, "");
  if (p.endsWith("/")) {
    const f = join(OUT, rel, "index.html");
    return { file: existsSync(f) ? f : null, redirect: false, basePathMissing: false };
  }
  const exact = join(OUT, rel);
  if (existsSync(exact) && statSync(exact).isFile()) return { file: exact, redirect: false, basePathMissing: false };
  const dir = join(OUT, rel, "index.html");
  if (existsSync(dir)) return { file: dir, redirect: true, basePathMissing: false };
  return { file: null, redirect: false, basePathMissing: false };
}
/** 절대 URL이면 같은 사이트인지 확인 후 경로만, 상대 경로면 그대로 */
const sitePath = (u: string): string | null => {
  if (/^https?:\/\//.test(u)) {
    const url = new URL(u);
    if (url.origin !== BASE_ORIGIN) return null;
    return url.pathname;
  }
  return u.startsWith("/") && !u.startsWith("//") ? u : null;
};
const routeOf = (file: string) => {
  const rel = "/" + relative(OUT, file).replace(/\\/g, "/");
  return rel.replace(/index\.html$/, "");
};

/* ───── pages ───── */
// 검색엔진 소유권 인증 파일(google*.html, naver*.html)은 웹페이지가 아니므로 페이지 검사에서 제외한다
const VERIFICATION_FILE = /^(google[0-9a-f]+|naver[0-9a-f]+)\.html$/;
const verificationFiles = walk(OUT).filter((f) => VERIFICATION_FILE.test(relative(OUT, f)));
const htmlFiles = walk(OUT).filter((f) => f.endsWith(".html") && !f.includes(`${OUT}/_next/`) && !VERIFICATION_FILE.test(relative(OUT, f)));
const notFoundFiles = htmlFiles.filter((f) => /(^|\/)(404|_not-found)(\/index)?\.html$/.test(relative(OUT, f)));
const pages = htmlFiles.filter((f) => !notFoundFiles.includes(f));
const titles = new Map<string, string[]>();
const descs = new Map<string, string[]>();
const indexableOut = new Set<string>();
const canonicals = new Map<string, string>();

const PLACEHOLDER = [/data-pending=/i, /\[미정/, /\bTODO\b/, /lorem ipsum/i, /example\.(com|kr|org)/i, /localhost(:\d+)?/i, /127\.0\.0\.1/, /\[object Object\]/, /010-0000-0000|000-0000/];
const FIXTURE = [/fixture[.-]test/i, /053-000-0001|010-0000-0001/, /테스트용 가라오케|테스트구|테스트동/];
const SUPERLATIVE = [/(^|[^0-9])1위/, /최저가/, /No\.?\s?1\b/i, /넘버원/, /업계 최고/, /최고급/];

// 라우트 정의와 출력 파일이 1:1인지
const outRoutes = new Set(pages.map(routeOf));
for (const r of routes) if (!outRoutes.has(r.path)) add("error", r.path, "route-missing", "라우트 정의에 있는데 HTML이 출력되지 않음");
for (const p of outRoutes) if (!routes.some((r) => r.path === p)) add("warn", p, "route-unknown", "lib/routes에 없는 페이지가 출력됨");

for (const file of pages) {
  const route = routeOf(file);
  const def = routes.find((r) => r.path === route);
  const html = readFileSync(file, "utf8");
  const text = visibleText(html);
  const scan = html.replace(/<script(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/gi, "");

  if (!/<html[^>]*\slang="ko"/i.test(html)) add("error", route, "lang", 'html lang="ko" 없음');
  if (!metaContent(html, "viewport")) add("error", route, "viewport", "meta viewport 없음");
  if (isProduction && !metaContent(html, "Content-Security-Policy", "http-equiv")) add("error", route, "security", "CSP meta 없음 (GitHub Pages는 헤더 설정 불가)");
  if (!metaContent(html, "referrer")) add("warn", route, "security", "referrer meta 없음");

  // title / description
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "");
  if (!title) add("error", route, "title", "title 누락");
  else {
    titles.set(title, [...(titles.get(title) ?? []), route]);
    if (title.length > 60) add("warn", route, "title", `title ${title.length}자 (60자 초과 시 잘릴 수 있음)`);
  }
  const desc = metaContent(html, "description");
  if (!desc) add("error", route, "description", "meta description 누락");
  else {
    descs.set(desc, [...(descs.get(desc) ?? []), route]);
    if (desc.length < 50 || desc.length > 160) add("warn", route, "description", `description ${desc.length}자 (권장 50~160)`);
  }

  // headings
  const h1s = html.match(/<h1[\s>]/gi) ?? [];
  if (h1s.length !== 1) add("error", route, "h1", `H1 ${h1s.length}개 (정확히 1개여야 함)`);
  const hs = [...html.matchAll(/<h([1-6])[\s>]/gi)].map((m) => Number(m[1]));
  for (let i = 1; i < hs.length; i++)
    if (hs[i]! - hs[i - 1]! > 1) {
      add("warn", route, "heading-order", `헤딩 단계 건너뜀 h${hs[i - 1]}→h${hs[i]}`);
      break;
    }

  // canonical / og:url
  const canonTags = (html.match(/<link\s[^>]*>/gi) ?? []).filter((t) => attr(t, "rel") === "canonical");
  const canon = canonTags[0] ? attr(canonTags[0], "href") : null;
  if (canonTags.length !== 1) add("error", route, "canonical", `canonical ${canonTags.length}개`);
  if (canon) {
    canonicals.set(route, canon);
    const expected = absoluteUrl(route);
    if (!/^https?:\/\//.test(canon)) add("error", route, "canonical", `상대경로 canonical: ${canon}`);
    else if (canon !== expected) add("error", route, "canonical", `자기참조 불일치: ${canon} ≠ ${expected}`);
    if (isProduction && !canon.startsWith("https://")) add("error", route, "canonical", "프로덕션 canonical은 https여야 함");
    if (!canon.endsWith("/")) add("error", route, "canonical", "끝 슬래시 없음 (GitHub Pages가 301 처리하는 비정규 URL)");
  }
  const ogUrl = metaContent(html, "og:url", "property");
  if (!ogUrl) add("warn", route, "og", "og:url 없음");
  else if (canon && ogUrl !== canon) add("error", route, "og", `og:url ≠ canonical (${ogUrl})`);
  if (!metaContent(html, "og:title", "property")) add("warn", route, "og", "og:title 없음");
  const ogImg = metaContent(html, "og:image", "property");
  if (!ogImg) add("warn", route, "og", "og:image 없음");
  else {
    if (!/^https?:\/\//.test(ogImg)) add("error", route, "og", `og:image 상대경로: ${ogImg}`);
    const sp = sitePath(ogImg);
    if (sp && !resolvePath(sp).file) add("error", route, "og", `og:image 파일 없음/basePath 누락: ${ogImg}`);
  }

  // robots meta ↔ 기대값
  const robots = (metaContent(html, "robots") ?? "index, follow").toLowerCase();
  const noindex = robots.includes("noindex");
  if (!noindex) indexableOut.add(route);
  if (def) {
    const expect = isIndexable(def);
    if (expect && noindex) add("error", route, "index-policy", `색인 대상인데 noindex (${def.kind})`);
    if (!expect && !noindex) add("error", route, "index-policy", `noindex 대상인데 색인 허용 (${def.kind}${def.kind === "business" ? ", 업체 정보 미확인/콘텐츠 없음" : ""})`);
    // 얇은 콘텐츠: 색인 페이지는 본문이 충분해야 함
    if (expect) {
      const main = visibleText(html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? "");
      const min = def.kind === "business" ? 300 : 600; // 정보·예약 안내는 충분한 설명, 업체 페이지는 사실 정보 위주
      const len = main.replace(/\s/g, "").length;
      if (len < min) add("error", route, "thin-content", `색인 페이지 본문 ${len}자 (<${min}, ${def.kind})`);
    }
    // 미공개 업체 페이지: 업체 정보·연락처가 새어 나오지 않아야 함
    if (def.kind === "business" && !isPublished(def) && mode !== "development") {
      // 예약 안내 운영자 연락처(하단 바·푸터)는 허용, 그 외 업체 연락처는 미공개 페이지에 나오면 안 됨
      const allowed = [operator.phone, operator.smsNumber].filter(Boolean).map((n) => n!.replace(/[^0-9+]/g, ""));
      for (const m of html.matchAll(/href="(?:tel|sms):([^"?&]+)/g))
        if (!allowed.includes(m[1]!.replace(/[^0-9+]/g, ""))) add("error", route, "unpublished-leak", `미공개 업체 페이지에 업체 연락처 노출: ${m[1]}`);
    }
  }

  // links & assets
  const checkRef = (u: string | null, kind: string) => {
    if (!u || u.startsWith("#") || /^(mailto|tel|sms|data|javascript):/.test(u)) return;
    const sp = sitePath(u);
    if (sp === null) return;
    const r = resolvePath(sp);
    if (r.basePathMissing) add("error", route, "basepath", `${kind} basePath 누락: ${u}`);
    else if (!r.file) add("error", route, `broken-${kind}`, `${kind} 깨짐: ${u}`);
    else if (r.redirect && kind === "link") add("warn", route, "link-slash", `끝 슬래시 없는 내부 링크(301 발생): ${u}`);
  };
  for (const t of html.match(/<a\s[^>]*>/gi) ?? []) {
    const href = attr(t, "href");
    checkRef(href, "link");
    if (href && /^https?:/.test(href) && attr(t, "target") === "_blank" && !/noopener/.test(attr(t, "rel") ?? ""))
      add("warn", route, "link", `target=_blank에 rel=noopener 없음: ${href}`);
    if (href && /^(tel|sms):$/.test(href)) add("error", route, "cta", `빈 연락처 링크: ${href}`);
  }
  for (const t of html.match(/<link\s[^>]*>/gi) ?? []) {
    const rel = attr(t, "rel") ?? "";
    if (/stylesheet|icon|preload|manifest|apple-touch-icon/.test(rel)) checkRef(attr(t, "href"), "asset");
  }
  for (const t of html.match(/<script\s[^>]*src=[^>]*>/gi) ?? []) checkRef(attr(t, "src"), "asset");
  for (const t of html.match(/<img\s[^>]*>/gi) ?? []) {
    const src = attr(t, "src");
    if (attr(t, "alt") === null) add("error", route, "img-alt", `alt 없음: ${src}`);
    if (!attr(t, "width") || !attr(t, "height")) add("warn", route, "img-size", `width/height 없음(CLS 위험): ${src}`);
    checkRef(src, "image");
  }
  for (const t of html.match(/<source\s[^>]*>/gi) ?? [])
    for (const part of (attr(t, "srcset") ?? attr(t, "srcSet") ?? "").split(",")) checkRef(part.trim().split(/\s+/)[0] ?? null, "image");

  // JSON-LD
  for (const m of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    let data: any;
    try {
      data = JSON.parse(m[1]!);
    } catch (e) {
      add("error", route, "jsonld", `JSON-LD 파싱 실패: ${(e as Error).message}`);
      continue;
    }
    if (/"aggregateRating"|"review"\s*:/.test(m[1]!)) add("error", route, "jsonld", "리뷰/별점 구조화 데이터 금지");
    if (data["@context"] !== "https://schema.org") add("error", route, "jsonld", "@context가 https://schema.org 아님");
    const types: string[] = [].concat(data["@type"] ?? []);
    if (!types.length) add("error", route, "jsonld", "@type 없음");
    const isBiz = types.some((t) => /LocalBusiness|BarOrPub|EntertainmentBusiness|NightClub|Restaurant/.test(t));
    if (isBiz) {
      if (!businessReady()) add("error", route, "jsonld", "업체 정보 미확인 상태에서 업체 JSON-LD 출력");
      for (const k of ["name", "address", "telephone", "url"]) if (!data[k]) add("error", route, "jsonld", `업체 JSON-LD ${k} 누락`);
      if (data.url && data.url !== absoluteUrl("/")) add("error", route, "jsonld", `업체 url이 정규 홈과 다름: ${data.url}`);
    }
    if (types.includes("FAQPage"))
      for (const q of data.mainEntity ?? []) {
        if (!text.includes(q.name)) add("error", route, "jsonld", `FAQ 질문이 화면에 없음: ${q.name}`);
        if (!text.includes(q.acceptedAnswer?.text)) add("error", route, "jsonld", `FAQ 답변이 화면에 없음: ${q.name}`);
      }
    for (const u of JSON.stringify(data).match(/https?:\/\/[^"\\]+/g) ?? []) {
      if (u.startsWith(BASE_ORIGIN) && !u.startsWith(BASE)) add("error", route, "jsonld", `JSON-LD URL에 basePath 누락: ${u}`);
    }
  }

  for (const re of PLACEHOLDER) if (re.test(scan)) add(ph, route, "placeholder", `임시 문구/테스트 값 감지: ${re}`);
  if (!useFixture()) for (const re of FIXTURE) if (re.test(scan)) add("error", route, "placeholder", `테스트 fixture 값 노출: ${re}`);
  if (/\{\{|\}\}/.test(text)) add(ph, route, "placeholder", "템플릿 문법 {{ }} 노출");
  for (const re of SUPERLATIVE) if (re.test(text)) add("error", route, "claim", `근거 없는 최상급 표현: ${re}`);
  // 서버가 없으므로 예약 접수·저장·확정을 완료한 것처럼 표시하면 안 됨
  if (/예약(이)?\s?(완료|접수\s?완료|접수되었습니다|확정되었습니다)|저장되었습니다|접수되었습니다/.test(text))
    add("error", route, "claim", "서버 없이 예약 접수/저장/확정 완료로 표시");
  // 제휴 매장 주소를 표시하면 운영자 사업장이 아니라는 고지가 함께 있어야 함
  for (const pv of partners)
    if (text.includes(pv.address) && !/사업장 주소가 아닙니다|직영점이 아닙니다/.test(text))
      add("error", route, "partner-address", `제휴 매장 주소(${pv.address})가 운영자 사업장이 아니라는 고지 없이 표시됨`);
}

for (const [t, rs] of titles) if (rs.length > 1) add("error", rs.join(", "), "title-dup", `중복 title: ${t}`);
for (const [d, rs] of descs) if (rs.length > 1) add("error", rs.join(", "), "desc-dup", `중복 description: ${d.slice(0, 40)}…`);

/* ───── 404 ───── */
const nf = notFoundFiles.find((f) => /(^|\/)404\.html$/.test(relative(OUT, f)));
if (!nf) add("error", "/404.html", "404", "404.html 없음 (GitHub Pages 사용자 404 페이지)");
else {
  const h = readFileSync(nf, "utf8");
  if (!/noindex/.test(metaContent(h, "robots") ?? "")) add("error", "/404.html", "404", "404 페이지가 noindex 아님");
  for (const t of h.match(/<link\s[^>]*rel="stylesheet"[^>]*>/gi) ?? []) {
    const sp = sitePath(attr(t, "href") ?? "");
    if (sp && !resolvePath(sp).file) add("error", "/404.html", "404", `404 CSS 경로 깨짐: ${attr(t, "href")}`);
  }
}

/* ───── sitemap / robots ───── */
const expectedIndex = routes.filter(isIndexable).map((r) => absoluteUrl(r.path)).sort();
const sitemapUrls: string[] = [];
const smPath = join(OUT, "sitemap.xml");
if (!existsSync(smPath)) add("error", "/sitemap.xml", "sitemap", "sitemap.xml 없음");
else {
  const xml = readFileSync(smPath, "utf8");
  if (!/<urlset[^>]+sitemaps\.org\/schemas\/sitemap\/0\.9/.test(xml)) add("error", "/sitemap.xml", "sitemap", "urlset 네임스페이스 오류");
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) sitemapUrls.push(decode(m[1]!.trim()));
  const got = [...sitemapUrls].sort();
  if (JSON.stringify(got) !== JSON.stringify(expectedIndex))
    add("error", "/sitemap.xml", "sitemap", `사이트맵 ≠ 색인 대상\n        기대: ${expectedIndex.join(" ")}\n        실제: ${got.join(" ")}`);
  for (const u of sitemapUrls) {
    const sp = sitePath(u);
    if (!sp) add("error", "/sitemap.xml", "sitemap", `다른 호스트 URL: ${u}`);
    else if (!resolvePath(sp).file) add("error", "/sitemap.xml", "sitemap", `존재하지 않는 URL: ${u}`);
    const route = sp && basePath ? sp.slice(basePath.length) : sp;
    if (route && !indexableOut.has(route)) add("error", "/sitemap.xml", "sitemap-noindex", `noindex 페이지가 사이트맵에 있음: ${u}`);
    if (route && canonicals.get(route) !== u) add("error", "/sitemap.xml", "sitemap", `canonical과 다른 URL: ${u}`);
  }
}
for (const r of indexableOut) if (!sitemapUrls.includes(absoluteUrl(r))) add("error", r, "sitemap-missing", "색인 허용 페이지가 사이트맵에 없음");

const rbPath = join(OUT, "robots.txt");
if (!existsSync(rbPath)) add("error", "/robots.txt", "robots", "robots.txt 없음");
else {
  const rb = readFileSync(rbPath, "utf8");
  const blocksAll = /^Disallow:\s*\/\s*$/im.test(rb);
  if (isProduction) {
    if (blocksAll) add("error", "/robots.txt", "robots", "프로덕션인데 전체 Disallow");
    if (!rb.includes(`Sitemap: ${absoluteUrl("/sitemap.xml")}`)) add("error", "/robots.txt", "robots", "Sitemap 선언 없음/URL 불일치");
    for (const r of routes)
      if (!isIndexable(r) && new RegExp(`^Disallow:\\s*${r.path}`, "im").test(rb))
        add("error", "/robots.txt", "robots", `${r.path}를 Disallow하면 noindex를 읽지 못함 — meta noindex만 사용`);
    if (basePath) add("info", "/robots.txt", "robots-scope", `프로젝트 사이트의 ${basePath}/robots.txt는 크롤러가 읽지 않음 → 색인 제어는 meta robots로 수행 (정상)`);
  } else if (!blocksAll) add("error", "/robots.txt", "robots", "미리보기 빌드인데 크롤링 허용");
}

/* ───── 소유권 인증 파일 (public/ 원본과 바이트 동일해야 함) ───── */
for (const f of readdirSync("public").filter((x) => VERIFICATION_FILE.test(x))) {
  const outFile = join(OUT, f);
  if (!existsSync(outFile)) add("error", `/${f}`, "verification", "public/의 소유권 인증 파일이 빌드 결과에 없음");
  else if (!readFileSync(outFile).equals(readFileSync(join("public", f)))) add("error", `/${f}`, "verification", "소유권 인증 파일 내용이 원본과 다름");
}
void verificationFiles;

/* ───── GitHub Pages 산출물 ───── */
if (!existsSync(join(OUT, ".nojekyll"))) add("error", "/.nojekyll", "pages", ".nojekyll 없음 (_next 폴더가 무시될 수 있음)");
const cname = join(OUT, "CNAME");
if (site.domain) {
  if (!existsSync(cname)) add("error", "/CNAME", "pages", "커스텀 도메인 설정인데 CNAME 없음");
  else if (readFileSync(cname, "utf8").trim() !== new URL(site.domain).host) add("error", "/CNAME", "pages", "CNAME 내용이 config domain과 다름");
} else if (existsSync(cname)) add("error", "/CNAME", "pages", "커스텀 도메인이 없는데 CNAME 존재");
for (const f of ["_headers", "_redirects", "netlify.toml"]) if (existsSync(join(OUT, f))) add("error", `/${f}`, "pages", `GitHub Pages에서 동작하지 않는 Netlify 파일: ${f}`);
if (!existsSync(join(OUT, "_next"))) add("warn", "/_next", "pages", "_next 폴더 없음 (오프라인 렌더라면 정상)");

/* ───── report ───── */
const errors = issues.filter((i) => i.level === "error");
const warns = issues.filter((i) => i.level === "warn");
const infos = issues.filter((i) => i.level === "info");
const summary = {
  generatedAt: new Date().toISOString(),
  mode,
  fixture: useFixture(),
  base: BASE,
  urlKind: urlKind(), // test = 검증용 임시 URL, production = 실제 운영 URL
  basePath,
  businessReady: businessReady(),
  pages: [...outRoutes],
  indexable: [...indexableOut],
  noindex: [...outRoutes].filter((r) => !indexableOut.has(r)),
  sitemap: sitemapUrls,
  errors: errors.length,
  warnings: warns.length,
  infos: infos.length,
  issues,
};
mkdirSync("reports", { recursive: true });
const tag = `${mode}${useFixture() ? "-fixture" : ""}${basePath ? "-basepath" : ""}`;
writeFileSync(`reports/seo-audit-${tag}.json`, JSON.stringify(summary, null, 2));

console.log(`\n[seo] mode=${mode}${useFixture() ? " +fixture" : ""} base=${BASE} (${urlKind() === "test" ? "검증용 임시 URL" : urlKind() === "local" ? "로컬" : "운영 URL"}) basePath="${basePath}" business=${businessReady() ? "ready" : "pending"}`);
console.log(`[seo] pages=${outRoutes.size} 색인=${indexableOut.size} [${[...indexableOut].join(" ")}]`);
console.log(`[seo] noindex=${summary.noindex.length} [${summary.noindex.join(" ")}] sitemap=${sitemapUrls.length}`);
const grouped = new Map<string, typeof issues>();
for (const i of issues) grouped.set(i.rule, [...(grouped.get(i.rule) ?? []), i]);
for (const [rule, list] of grouped) {
  console.log(`  ${list[0]!.level === "error" ? "✖" : list[0]!.level === "warn" ? "⚠" : "ℹ"} ${rule} (${list.length})`);
  for (const i of list.slice(0, 6)) console.log(`      ${i.page}: ${i.msg}`);
  if (list.length > 6) console.log(`      … +${list.length - 6}`);
}
console.log(`[seo] errors=${errors.length} warnings=${warns.length} info=${infos.length}\n`);
process.exit(errors.length ? 1 : 0);
