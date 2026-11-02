import Link from "next/link";
import { site, operator, brand, businessReady, reservationReady, fullAddress, telHref, isDev, formatDays, formatHours } from "@/lib/site";
import { navRoutes } from "@/lib/routes";
import { legalNotice, DRINK_NOTICE } from "@/lib/content";
import { Pending } from "@/components/ui";

function Logo() {
  return (
    <Link href="/" className="group flex shrink-0 items-center gap-2 sm:gap-3">
      <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-full border border-gold/60 text-gold">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 18V6l10-2v12" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="6.5" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="16.5" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="h-display block text-[0.95rem] whitespace-nowrap sm:text-[1.05rem]">{brand() || (isDev ? <Pending label="상호" /> : "대구 가라오케·노래방")}</span>
        <span className="block text-[0.66rem] tracking-[0.28em] text-mute">{brand() ? "DAEGU KARAOKE" : "DAEGU GUIDE"}</span>
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
                <li key={r.path}>
                  <Link href={r.path} className="hover:text-gold-2">
                    {r.nav}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
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
            <nav aria-label="모바일 메뉴" className="card absolute right-0 mt-2 w-52 p-2 shadow-2xl">
              <ul>
                {navRoutes(isDev).map((r) => (
                  <li key={r.path}>
                    <Link href={r.path} className="block rounded-lg px-4 py-3 text-sm hover:bg-ink-3">
                      {r.nav}
                    </Link>
                  </li>
                ))}
              </ul>
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
                대구에서 노래방·가라오케를 찾는 분들을 위한 이용 가이드이자 <strong className="text-ivory/85">독립 예약 안내 서비스</strong>입니다. 예약 가능한
                제휴 매장을 연결해 드리며, 제휴 매장은 운영자의 직영점이 아닙니다.
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
        © {new Date().getFullYear()} {brand() || "대구 가라오케·노래방 가이드"}. 요금·영업시간 등 업소 정보는 업소 사정에 따라 변경될 수 있으니 방문 전 확인하세요.
      </div>
    </footer>
  );
}
