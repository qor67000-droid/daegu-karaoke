/**
 * 배포 모드
 * - development : next dev. 비어 있는 업체 정보 자리에 "[미정]" 표시.
 * - preview     : PR 빌드·로컬 빌드. 미정 항목 숨김 + 전 페이지 noindex + robots 전체 차단.
 * - production  : GitHub Pages 배포 (deploy.yml이 SITE_ENV=production 설정).
 *                 정보 콘텐츠는 색인 허용, 업체 페이지는 실제 정보가 확인된 경우에만 색인.
 */
export type SiteMode = "development" | "preview" | "production";

export function getSiteMode(): SiteMode {
  const explicit = process.env.SITE_ENV;
  if (explicit === "production" || explicit === "preview" || explicit === "development") return explicit;
  if (process.env.NODE_ENV === "development") return "development";
  return "preview";
}

/** GitHub Actions의 Pages 배포 job 안인지 (fixture 사용 차단용) */
export const isPagesDeploy = () => process.env.PAGES_DEPLOY === "1";
export const useFixture = () => process.env.SITE_CONFIG_FIXTURE === "1";

/**
 * basePath: https://<user>.github.io/<repo> 형태의 프로젝트 사이트면 "/<repo>", 커스텀 도메인이면 "".
 * deploy.yml이 actions/configure-pages의 base_path 출력값을 NEXT_PUBLIC_BASE_PATH로 넘긴다.
 */
export function getBasePath(): string {
  const raw = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim();
  if (!raw || raw === "/") return "";
  return ("/" + raw.replace(/^\/+|\/+$/g, "")).replace(/\/{2,}/g, "/");
}

/**
 * 검증·CI에서만 쓰는 임시 URL. 실제 GitHub Pages 배포(PAGES_DEPLOY=1)에서 기준 URL로 쓰이면 빌드를 중단한다.
 * 실제 운영 URL은 deploy.yml에서 actions/configure-pages가 알려주는 값(https://<사용자명>.github.io/<저장소명>)이다.
 */
export const TEST_HOSTS = ["verify-owner.github.io", "ci-check.github.io", "fixture.test", "daegu-karaoke-verify.kr", "localhost", "127.0.0.1"];
export const isTestHost = (url: string) => {
  try {
    return TEST_HOSTS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
};
