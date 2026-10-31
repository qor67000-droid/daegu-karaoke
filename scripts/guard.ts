/**
 * 빌드 전 점검
 * - 설정 오류(도메인 형식, basePath/SITE_URL 불일치, 프로덕션 기준 URL 없음, 배포에 fixture 사용) → 빌드 중단
 * - 업체 필수 정보 누락 → 경고만. 홈은 정보 가이드 모드, 업체 페이지는 noindex로 빌드된다.
 */
import { site, mode, basePath, baseUrl, missingRequired, configErrors } from "@/lib/site";
import { isPagesDeploy, useFixture } from "@/lib/env";
import { routes, isIndexable } from "@/lib/routes";

console.log(`[guard] mode=${mode}${useFixture() ? " (TEST FIXTURE)" : ""} basePath="${basePath}" domain=${site.domain ?? "(GitHub Pages 기본 주소)"}`);

const errs = configErrors();
if (useFixture() && isPagesDeploy()) errs.push("테스트 fixture로 GitHub Pages 배포를 할 수 없습니다");
if (errs.length) {
  console.error("[guard] ✖ 빌드 중단:");
  for (const e of errs) console.error(`         - ${e}`);
  process.exit(1);
}
console.log(`[guard] base URL = ${baseUrl()}`);

const missing = missingRequired();
if (missing.length) {
  console.warn(`[guard] ⚠ 업체 정보 미정 ${missing.length}개 → 홈은 정보 가이드 모드, 업체 페이지는 noindex·사이트맵 제외:`);
  for (const m of missing) console.warn(`         - ${m}`);
} else console.log("[guard] ✓ 업체 필수 정보 확인 → 업체 모드");

console.log(`[guard] 색인 대상: ${routes.filter(isIndexable).map((r) => r.path).join(" ") || "(없음 — 미리보기)"}`);
console.log(`[guard] noindex: ${routes.filter((r) => !isIndexable(r)).map((r) => r.path).join(" ") || "(없음)"}`);
