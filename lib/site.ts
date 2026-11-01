import { site as realSite, operator as operatorConfig, partners as partnerList } from "@/config/site";
import { fixtureSite } from "@/tests/fixtures/site.fixture";
import { getBasePath, getSiteMode, isPagesDeploy, isTestHost, useFixture, type SiteMode } from "@/lib/env";
import type { DayCode, SiteConfig } from "@/lib/types";

if (useFixture() && isPagesDeploy()) {
  throw new Error("[site] 테스트 fixture는 GitHub Pages 배포에서 사용할 수 없습니다.");
}

export const site: SiteConfig = useFixture() ? fixtureSite : realSite;
/** 예약 안내 운영자 연락처 (사이트 운영자 본인) */
export const operator = operatorConfig;
/** 제휴 매장 (운영자 사업장 아님) */
export const partners = partnerList;
/** 예약 문의를 실제로 받을 수 있는 상태인지 */
export const reservationReady = () => Boolean(operator.phone && operator.smsNumber);
export const mode: SiteMode = getSiteMode();
export const isDev = mode === "development";
export const isProduction = mode === "production";
export const basePath = getBasePath();

/** 업체 소개를 공개하려면 반드시 확인돼야 하는 항목 (도메인은 업체 정보가 아니므로 제외) */
export function missingRequired(s: SiteConfig = site): string[] {
  const missing: string[] = [];
  if (!s.name) missing.push("name (상호)");
  if (!s.licenseType || !s.licenseVerified) missing.push("licenseType + licenseVerified (영업신고 업종 확인)");
  if (!s.phone) missing.push("phone (대표 전화)");
  if (!s.address.district) missing.push("address.district (구)");
  if (!s.address.street) missing.push("address.street (도로명 주소)");
  if (s.hours.length === 0) missing.push("hours (영업시간)");
  return missing;
}

/** 실제 업체 정보가 모두 확인됨 → 업체 소개 모드 */
export const businessReady = () => missingRequired().length === 0;

/** 검증 오류(빌드 중단 사유) */
export function configErrors(): string[] {
  const errs: string[] = [];
  if (site.domain && !/^https:\/\/[a-z0-9.-]+$/i.test(site.domain)) errs.push("domain 형식은 https://도메인 (경로·끝 슬래시 없음)");
  if (site.domain && basePath) errs.push(`커스텀 도메인(${site.domain})과 basePath(${basePath})를 동시에 쓸 수 없습니다`);
  if (isProduction) {
    const url = site.domain || process.env.SITE_URL;
    if (!url) errs.push("프로덕션 기준 URL 없음: config/site.ts domain 또는 SITE_URL 환경변수 필요");
    else if (/localhost|127\.0\.0\.1/.test(url)) errs.push(`프로덕션 기준 URL이 로컬 주소: ${url}`);
    else if (isPagesDeploy() && isTestHost(url)) errs.push(`실제 배포에 테스트용 URL 사용: ${url}`);
    else if (!site.domain) {
      const p = new URL(url).pathname.replace(/\/$/, "");
      if (p !== basePath) errs.push(`SITE_URL 경로(${p || "/"})와 NEXT_PUBLIC_BASE_PATH(${basePath || "/"}) 불일치`);
    }
  }
  return errs;
}

/** 기준 URL이 검증용 임시 URL인지 (보고서 표기용) */
export const urlKind = (): "test" | "production" | "local" => {
  const u = (() => {
    try {
      return baseUrl();
    } catch {
      return "";
    }
  })();
  if (/localhost|127\.0\.0\.1/.test(u)) return "local";
  return isTestHost(u) ? "test" : "production";
};

/** 정규 URL 기준 (끝 슬래시 없음). 프로젝트 사이트면 https://user.github.io/repo */
export function baseUrl(): string {
  if (site.domain) return site.domain.replace(/\/$/, "");
  const env = process.env.SITE_URL;
  if (env) return env.replace(/\/$/, "");
  if (isProduction) throw new Error("[site] 프로덕션에는 SITE_URL 또는 config/site.ts domain이 필요합니다.");
  return `http://localhost:3000${basePath}`;
}

/** 라우트 경로("/" 또는 "/guide/") → 절대 URL */
export const absoluteUrl = (path: string) => baseUrl() + (path.startsWith("/") ? path : `/${path}`);

/** public/ 정적 파일 경로에 basePath 적용 (<img>, <source>, 아이콘 등 next/link가 아닌 곳) */
export const asset = (path: string) => `${basePath}${path.startsWith("/") ? path : `/${path}`}`;

export const brand = () => (businessReady() || isDev ? site.name ?? "" : "");

export function fullAddress(s: SiteConfig = site): string | null {
  const a = s.address;
  if (!a.district || !a.street) return null;
  return [a.region, a.district, a.street, a.detail].filter(Boolean).join(" ");
}

export const telHref = (n: string) => `tel:${n.replace(/[^0-9+]/g, "")}`;
export const smsHref = (n: string) => `sms:${n.replace(/[^0-9+]/g, "")}`;

const DAY_KO: Record<DayCode, string> = { Mo: "월", Tu: "화", We: "수", Th: "목", Fr: "금", Sa: "토", Su: "일" };
const ALL: DayCode[] = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function formatDays(days: DayCode[]): string {
  if (days.length === 7) return "매일";
  const idx = days.map((d) => ALL.indexOf(d)).sort((a, b) => a - b);
  const contiguous = idx.every((v, i) => i === 0 || v === idx[i - 1]! + 1);
  if (contiguous && idx.length > 2) return `${DAY_KO[ALL[idx[0]!]!]}~${DAY_KO[ALL[idx[idx.length - 1]!]!]}`;
  return days.map((d) => DAY_KO[d]).join("·");
}

export function formatHours(h: { opens: string; closes: string }): string {
  const overnight = h.closes <= h.opens;
  return `${h.opens} ~ ${overnight ? "익일 " : ""}${h.closes}`;
}

export const SCHEMA_DAY: Record<DayCode, string> = {
  Mo: "Monday",
  Tu: "Tuesday",
  We: "Wednesday",
  Th: "Thursday",
  Fr: "Friday",
  Sa: "Saturday",
  Su: "Sunday",
};
