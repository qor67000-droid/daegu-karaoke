import Link from "next/link";
import { site, operator, intlPhone, brand, businessReady, reservationReady, fullAddress, telHref, isDev, formatDays, formatHours } from "@/lib/site";
import { navRoutes } from "@/lib/routes";
import { legalNotice, DRINK_NOTICE } from "@/lib/content";
import { Pending } from "@/components/ui";
import { LanguageList, LanguageMenu } from "@/components/language-switcher";
import { CONTENT } from "@/lib/i18n";
import { getLocale, localePath, type IntlLocaleKey } from "@/lib/i18n/locales";

function Logo({ href = "/", name }: { href?: string; name?: string }) {
  return (
    <Link href={href} className="group flex shrink-0 items-center gap-2 sm:gap-3">
      <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-full border border-gold/60 text-gold">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 18V6l10-2v12" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="6.5" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="16.5" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="h-display block text-[0.95rem] whitespace-nowrap sm:text-[1.05rem]">{name ?? (brand() || (isDev ? <Pending label="상호" /> : operator.serviceName))}</span>
        <span className="block text-[0.66rem] tracking-[0.28em] text-mute">DAEGU KARAOKE</span>
      </span>
    </Link>
  );
}

export function Header() {
  const nav = navRoutes(isDev).filter((r) => r.path !== "/" && r.path !== "/reservation/");
  const rsv = reservationReady();
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="wrap flex h-20 items-center justify-between gap-3">
        <Logo />
        <div className="flex shrink-0 items-center gap-2 md:gap-7">
          <nav aria-label="주요 메뉴" className="hidden md:block">
            <ul className="flex items-center gap-7 text-sm text-ivory/85">
              {nav.map((r) => (
                <li key={r.path} className={r.headerFrom === "xl" ? "hidden xl:block" : undefined}>
                  <Link href={r.path} className="whitespace-nowrap hover:text-gold-2">
                    {r.nav}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {/* 언어 선택 (PC) — 예약 버튼 위치는 그대로 오른쪽 끝 */}
          <LanguageMenu current="ko" label="언어 선택 (Language)" />
          {/* 핵심 동선: 예약 문의 — PC·모바일 모두 상단에 항상 노출 */}
          {rsv && (
            <Link
              href="/reservation/"
              className="inline-flex min-h-11 items-center rounded-full bg-gold px-3.5 text-sm font-semibold whitespace-nowrap text-ink hover:bg-gold-2 md:px-5"
              data-track="click_reservation_header"
              data-testid="header-reservation"
            >
              예약 문의
            </Link>
          )}
          {/* JS 없이 동작하는 모바일 메뉴 */}
          <details className="relative md:hidden">
            <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-line [&::-webkit-details-marker]:hidden">
              <span className="sr-only">메뉴 열기</span>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </summary>
            <nav aria-label="모바일 메뉴" className="card absolute right-0 mt-2 w-64 p-2 shadow-2xl">
              <ul>
                {navRoutes(isDev).map((r) => (
                  <li key={r.path}>
                    <Link href={r.path} className="block rounded-lg px-4 py-3 text-sm hover:bg-ink-3">
                      {r.nav}
                    </Link>
                  </li>
                ))}
              </ul>
              <LanguageList current="ko" label="언어 · Language" />
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const addr = fullAddress();
  return (
    <footer className="mt-24 border-t border-line bg-ink-2 pb-24 md:pb-10">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          {/* NAP: 전 페이지 동일 표기 */}
          {(businessReady() || isDev) ? (
          <address className="mt-6 space-y-1.5 text-sm not-italic text-mute">
            {(site.name || isDev) && (
              <p>
                <span className="text-ivory/80">상호</span> {site.name ?? <Pending label="상호" />}
                {site.licenseType && <span> · {site.licenseType}</span>}
              </p>
            )}
            {(addr || isDev) && (
              <p>
                <span className="text-ivory/80">주소</span> {addr ?? <Pending label="주소" />}
              </p>
            )}
            {(site.phone || isDev) && (
              <p>
                <span className="text-ivory/80">전화</span>{" "}
                {site.phone ? (
                  <a href={telHref(site.phone)} data-track="click_call" className="hover:text-gold-2">
                    {site.phone}
                  </a>
                ) : (
                  <Pending label="전화번호" />
                )}
              </p>
            )}
            {(site.hours.length > 0 || isDev) && (
              <p>
                <span className="text-ivory/80">영업</span>{" "}
                {site.hours.length ? site.hours.map((h) => `${formatDays(h.days)} ${formatHours(h)}`).join(" / ") : <Pending label="영업시간" />}
              </p>
            )}
            {(site.businessRegistrationNo || site.representative) && (
              <p>
                {site.representative && <>대표 {site.representative} </>}
                {site.businessRegistrationNo && <>· 사업자등록번호 {site.businessRegistrationNo}</>}
              </p>
            )}
          </address>
          ) : (
            <div className="mt-6 max-w-sm space-y-2 text-sm text-mute">
              <p>
                대구 지역 유흥주점·단란주점의 예약 문의를 제휴 매장에 연결하는 <strong className="text-ivory/85">독립 운영 예약 문의 서비스</strong>입니다.
                제휴 매장은 운영자의 직영점이 아니며, 노래연습장·코인노래방 예약은 안내하지 않습니다.
              </p>
              {reservationReady() && operator.phone && (
                <p>
                  <span className="text-ivory/80">예약 문의</span>{" "}
                  <a href={telHref(operator.phone)} data-track="click_call" className="hover:text-gold-2">
                    {operator.phone}
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
        <nav aria-label="사이트 메뉴">
          <p className="eyebrow mb-4">Menu</p>
          <ul className="space-y-2 text-sm text-mute">
            {navRoutes(isDev).map((r) => (
              <li key={r.path}>
                <Link href={r.path} className="hover:text-ivory">
                  {r.nav}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="eyebrow mb-4">Notice</p>
          <p className="flex items-start gap-3 text-sm text-mute">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-red-500 text-xs font-bold text-red-400"
            >
              19
            </span>
            <span>{legalNotice()}</span>
          </p>
          <p className="mt-3 text-xs text-mute">{DRINK_NOTICE}</p>
        </div>
      </div>
      <div className="wrap border-t border-line pt-6 text-xs text-mute">
        © {new Date().getFullYear()} {brand() || operator.serviceName}. 요금·영업시간 등 업소 정보는 업소 사정에 따라 변경될 수 있으니 방문 전 확인하세요.
      </div>
    </footer>
  );
}

/* ───────────────────────── 다국어 페이지용 머리글·바닥글 ───────────────────────── */

/** 외국어 페이지 머리글: 로고(→ 해당 언어 홈) · 언어 선택 · 예약 문의 */
export function LocaleHeader({ locale }: { locale: IntlLocaleKey }) {
  const c = CONTENT[locale];
  const rsv = reservationReady();
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="wrap flex h-20 items-center justify-between gap-3">
        <Logo href={localePath(locale, "home")} name={c.meta.siteName} />
        <div className="flex shrink-0 items-center gap-2 md:gap-4">
          <LanguageMenu current={locale} label={c.ui.language} />
          {rsv && (
            <Link
              href={localePath(locale, "reservation")}
              className="inline-flex min-h-11 items-center rounded-full bg-gold px-3.5 text-sm font-semibold whitespace-nowrap text-ink hover:bg-gold-2 md:px-5"
              data-track="click_reservation_header"
              data-testid="header-reservation"
            >
              {c.ui.reservation}
            </Link>
          )}
          <details className="relative md:hidden">
            <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-line [&::-webkit-details-marker]:hidden">
              <span className="sr-only">{c.ui.menuOpen}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </summary>
            <nav aria-label={c.ui.mobileMenu} className="card absolute right-0 mt-2 w-64 p-2 shadow-2xl">
              <ul>
                <li>
                  <Link href={localePath(locale, "home")} className="block rounded-lg px-4 py-3 text-sm hover:bg-ink-3">
                    {c.ui.home}
                  </Link>
                </li>
                {rsv && (
                  <li>
                    <Link href={localePath(locale, "reservation")} className="block rounded-lg px-4 py-3 text-sm hover:bg-ink-3">
                      {c.ui.reservation}
                    </Link>
                  </li>
                )}
              </ul>
              <LanguageList current={locale} label={c.ui.language} />
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

export function LocaleFooter({ locale }: { locale: IntlLocaleKey }) {
  const c = CONTENT[locale];
  return (
    <footer className="mt-24 border-t border-line bg-ink-2 pb-24 md:pb-10" lang={getLocale(locale).htmlLang}>
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo href={localePath(locale, "home")} name={c.meta.siteName} />
          <div className="mt-6 max-w-sm space-y-2 text-sm text-mute">
            <p>{c.ui.footerAbout}</p>
            {reservationReady() && operator.phone && (
              <p>
                <span className="text-ivory/80">{c.ui.reservation}</span>{" "}
                <a href={telHref(operator.phone)} data-track="click_call" className="hover:text-gold-2">
                  {operator.phone}
                </a>{" "}
                <span className="whitespace-nowrap">({intlPhone(operator.phone)})</span>
              </p>
            )}
          </div>
        </div>
        <nav aria-label={c.ui.mainMenu}>
          <p className="eyebrow mb-4">Menu</p>
          <ul className="space-y-2 text-sm text-mute">
            <li>
              <Link href={localePath(locale, "home")} className="hover:text-ivory">
                {c.ui.home}
              </Link>
            </li>
            {reservationReady() && (
              <li>
                <Link href={localePath(locale, "reservation")} className="hover:text-ivory">
                  {c.ui.reservation}
                </Link>
              </li>
            )}
          </ul>
        </nav>
        <div>
          <p className="eyebrow mb-4">Notice</p>
          <p className="flex items-start gap-3 text-sm text-mute">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-red-500 text-xs font-bold text-red-400"
            >
              19
            </span>
            <span>{c.ui.legalNotice}</span>
          </p>
          <p className="mt-3 text-xs text-mute">{c.ui.drinkNotice}</p>
        </div>
      </div>
      <div className="wrap border-t border-line pt-6 text-xs text-mute">
        © {new Date().getFullYear()} {c.meta.siteName}. {c.ui.copyright}
      </div>
    </footer>
  );
}
