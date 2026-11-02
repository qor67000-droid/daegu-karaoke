// Lighthouse JSON 결과를 GitHub annotation(notice)으로 요약한다. (실험실 측정 — 실사용자 CrUX 지표 아님)
// 사용: node scripts/lighthouse-summary.mjs <label> <lh.json>
import { readFileSync, existsSync } from "node:fs";
const [label, file] = process.argv.slice(2);
if (!file || !existsSync(file)) {
  console.log(`::warning title=lighthouse ${label}::결과 파일 없음 (측정 실패)`);
  process.exit(0);
}
const r = JSON.parse(readFileSync(file, "utf8"));
const c = r.categories ?? {};
const score = (k) => (c[k]?.score == null ? "-" : Math.round(c[k].score * 100));
const a = r.audits ?? {};
const v = (k) => a[k]?.displayValue ?? "-";
console.log(
  `::notice title=lighthouse ${label} (mobile, lab)::perf ${score("performance")} / a11y ${score("accessibility")} / best ${score("best-practices")} / seo ${score("seo")} — LCP ${v("largest-contentful-paint")}, CLS ${v("cumulative-layout-shift")}, TBT ${v("total-blocking-time")}, FCP ${v("first-contentful-paint")} (${r.finalDisplayedUrl ?? r.finalUrl})`,
);
const failed = Object.values(a)
  .filter((x) => x && x.scoreDisplayMode !== "notApplicable" && x.scoreDisplayMode !== "informative" && x.scoreDisplayMode !== "manual" && typeof x.score === "number" && x.score < 0.9)
  .filter((x) => (c.seo?.auditRefs ?? []).concat(c.accessibility?.auditRefs ?? [], c["best-practices"]?.auditRefs ?? []).some((ref) => ref.id === x.id) || ["largest-contentful-paint", "cumulative-layout-shift", "total-blocking-time"].includes(x.id))
  .map((x) => `${x.id}(${Math.round(x.score * 100)})`);
if (failed.length) console.log(`::notice title=lighthouse ${label} 개선 후보::${failed.slice(0, 25).join(", ")}`);

// 접근성·SEO 실패 감사의 실제 요소(셀렉터·HTML 일부)를 남긴다
for (const id of ["color-contrast", "label-content-name-mismatch", "link-name", "button-name", "tap-targets", "target-size", "image-alt", "document-title", "meta-description", "link-text", "crawlable-anchors", "is-crawlable", "canonical", "hreflang"]) {
  const au = a[id];
  if (!au || typeof au.score !== "number" || au.score >= 0.9) continue;
  const items = (au.details?.items ?? []).slice(0, 6).map((it) => `${it.node?.selector ?? ""} ${(it.node?.snippet ?? "").slice(0, 140)} ${it.node?.explanation ? "— " + it.node.explanation.split("\n")[1]?.trim() : ""}`.trim());
  console.log(`::notice title=lighthouse ${label} ${id}::${items.join(" ‖ ").slice(0, 3500)}`);
}
