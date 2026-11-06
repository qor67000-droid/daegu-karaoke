/**
 * 다국어 레지스트리 (중앙 관리)
 *
 * - 한국어(ko)는 기존 URL(/, /reservation/)을 그대로 쓴다. 접두사 없음.
 * - 나머지 언어는 /{segment}/ 하위에 같은 구조의 페이지를 둔다.
 * - status: "published" 인 언어만 빌드·사이트맵·hreflang 에 포함된다.
 *   새 언어는 "draft" 로 추가하고, 번역 검수와 `npm run seo`(번역 누락 검사)를 통과한 뒤에만 "published" 로 바꾼다.
 * - IP·브라우저 언어 기반 자동 리디렉션은 하지 않는다 (사용자가 언어 선택기로 직접 이동).
 */

export type LocaleKey = "ko" | "ja" | "en" | "zh-cn" | "zh-tw" | "zh-hk";
export type IntlLocaleKey = Exclude<LocaleKey, "ko">;

export interface LocaleDef {
  key: LocaleKey;
  /** URL 접두사 (ko 는 null → 루트) */
  segment: string | null;
  /** <link rel="alternate" hreflang> 값 */
  hreflang: string;
  /** <html lang> 값 */
  htmlLang: string;
  /** og:locale */
  ogLocale: string;
  /** 언어 선택기에 표시할 자국어 이름 */
  label: string;
  status: "published" | "draft";
  /** 번역 검수 기록 (published 로 바꿀 때 채운다) */
  reviewed?: string;
}

export const LOCALES: readonly LocaleDef[] = [
  { key: "ko", segment: null, hreflang: "ko-KR", htmlLang: "ko", ogLocale: "ko_KR", label: "한국어", status: "published", reviewed: "원문" },
  { key: "ja", segment: "ja", hreflang: "ja-JP", htmlLang: "ja", ogLocale: "ja_JP", label: "日本語", status: "published", reviewed: "2026-11-06 초기 작성·용어 검토" },
  { key: "en", segment: "en", hreflang: "en", htmlLang: "en", ogLocale: "en_US", label: "English", status: "published", reviewed: "2026-11-06 초기 작성·용어 검토" },
  { key: "zh-cn", segment: "zh-cn", hreflang: "zh-CN", htmlLang: "zh-CN", ogLocale: "zh_CN", label: "简体中文", status: "published", reviewed: "2026-11-06 초기 작성·용어 검토" },
  { key: "zh-tw", segment: "zh-tw", hreflang: "zh-TW", htmlLang: "zh-TW", ogLocale: "zh_TW", label: "繁體中文（台灣）", status: "published", reviewed: "2026-11-06 초기 작성·용어 검토" },
  { key: "zh-hk", segment: "zh-hk", hreflang: "zh-HK", htmlLang: "zh-HK", ogLocale: "zh_HK", label: "繁體中文（香港）", status: "published", reviewed: "2026-11-06 초기 작성·용어 검토" },
] as const;

/** 번역이 제공되는 페이지 묶음. 각 언어에서 같은 sub 경로를 쓴다. */
export type PageGroup = "home" | "reservation";
export const PAGE_GROUPS: Record<PageGroup, string> = { home: "", reservation: "reservation/" };

export const getLocale = (key: LocaleKey): LocaleDef => {
  const l = LOCALES.find((x) => x.key === key);
  if (!l) throw new Error(`unknown locale ${key}`);
  return l;
};

/** 공개(빌드) 대상 언어 */
export const publishedLocales = () => LOCALES.filter((l) => l.status === "published");
/** 공개 대상 중 한국어 제외 (/[locale]/ 동적 경로 파라미터) */
export const publishedIntlLocales = () => publishedLocales().filter((l) => l.key !== "ko") as (LocaleDef & { key: IntlLocaleKey; segment: string })[];

/** 언어 + 페이지 묶음 → 사이트 내부 경로 (basePath 제외, 끝 슬래시 포함) */
export const localePath = (key: LocaleKey, group: PageGroup = "home") => {
  const l = getLocale(key);
  return `/${l.segment ? `${l.segment}/` : ""}${PAGE_GROUPS[group]}`;
};

/** URL 세그먼트 → 공개 언어 (없거나 draft 면 null) */
export const localeFromSegment = (seg: string | undefined | null): IntlLocaleKey | null => {
  const l = publishedIntlLocales().find((x) => x.segment === seg);
  return l ? l.key : null;
};

/**
 * 현재 경로(basePath 제외) → 다른 언어의 대응 경로.
 * 번역된 페이지 묶음(home, reservation)이면 같은 페이지로, 아니면 그 언어의 홈으로 보낸다.
 */
export function switchPath(pathname: string, target: LocaleKey): string {
  const p = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const seg = p.split("/")[1];
  const from = localeFromSegment(seg);
  const rest = from ? p.slice(seg!.length + 1) : p; // "/" 또는 "/reservation/" …
  const group = (Object.entries(PAGE_GROUPS) as [PageGroup, string][]).find(([, sub]) => `/${sub}` === rest)?.[0];
  if (group) return localePath(target, group);
  return target === (from ?? "ko") ? p : localePath(target, "home");
}
