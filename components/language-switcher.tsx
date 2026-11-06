"use client";

import { usePathname } from "next/navigation";
import { publishedLocales, switchPath, type LocaleKey } from "@/lib/i18n/locales";

/**
 * 언어 선택기.
 * - 일반 <a> 링크(전체 페이지 이동) → 언어마다 <html lang> 이 다른 루트 레이아웃이므로 하드 내비게이션이 맞다.
 * - 현재 페이지에 번역본이 있으면 같은 페이지로, 없으면 그 언어의 홈으로 이동한다.
 * - IP·브라우저 언어로 자동 이동시키지 않는다. JS 없이도 동작한다(정적 HTML에 링크가 들어 있음).
 */
const BASE = (() => {
  const raw = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/^\/+|\/+$/g, "");
  return raw ? `/${raw}` : "";
})();

function useLinks(current: LocaleKey) {
  const pathname = usePathname() || "/";
  return publishedLocales().map((l) => ({ ...l, href: `${BASE}${switchPath(pathname, l.key)}`, active: l.key === current }));
}

function Globe() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/** PC 상단 메뉴용 드롭다운 */
export function LanguageMenu({ current, label }: { current: LocaleKey; label: string }) {
  const links = useLinks(current);
  const active = links.find((l) => l.active)!;
  return (
    <details className="relative hidden md:block" data-testid="lang-menu">
      <summary
        className="flex h-11 cursor-pointer list-none items-center gap-1.5 rounded-full border border-line px-3.5 text-sm text-ivory/85 hover:border-gold/60 [&::-webkit-details-marker]:hidden"
        aria-label={label}
      >
        <Globe />
        <span>{active.label}</span>
      </summary>
      <ul className="card absolute right-0 z-40 mt-2 w-52 p-2 shadow-2xl" aria-label={label}>
        {links.map((l) => (
          <li key={l.key}>
            <a
              href={l.href}
              hrefLang={l.hreflang}
              lang={l.htmlLang}
              aria-current={l.active ? "true" : undefined}
              className={`block rounded-lg px-4 py-2.5 text-sm hover:bg-ink-3 ${l.active ? "text-gold-2" : ""}`}
              data-track="click_language"
              data-testid={`lang-${l.key}`}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

/** 모바일 메뉴(햄버거) 안의 언어 목록 */
export function LanguageList({ current, label }: { current: LocaleKey; label: string }) {
  const links = useLinks(current);
  return (
    <div className="mt-1 border-t border-line pt-2" data-testid="lang-list">
      <p className="flex items-center gap-1.5 px-4 py-2 text-xs tracking-widest text-mute">
        <Globe /> {label}
      </p>
      <ul className="grid grid-cols-2 gap-1">
        {links.map((l) => (
          <li key={l.key}>
            <a
              href={l.href}
              hrefLang={l.hreflang}
              lang={l.htmlLang}
              aria-current={l.active ? "true" : undefined}
              className={`block min-h-11 rounded-lg px-4 py-3 text-sm hover:bg-ink-3 ${l.active ? "text-gold-2" : ""}`}
              data-track="click_language"
              data-testid={`mlang-${l.key}`}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
