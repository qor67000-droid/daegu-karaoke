import Link from "next/link";
import type { ReactNode } from "react";
import { site, operator, telHref, smsHref, isDev } from "@/lib/site";
import { Pending } from "@/components/ui";
import { CONTENT } from "@/lib/i18n";
import { localePath, type LocaleKey } from "@/lib/i18n/locales";

/**
 * 연락 버튼. 실제 값이 있는 채널만 활성화한다.
 * data-track 속성은 components/analytics.tsx가 GA4 이벤트로 전송한다 (클릭 수 ≠ 예약 성사).
 */
export function ContactButtons({ compact = false }: { compact?: boolean }) {
  const items: ReactNode[] = [];
  if (site.phone)
    items.push(
      <a key="tel" href={telHref(site.phone)} className="btn-gold" data-track="click_call">
        <PhoneIcon /> 전화 {compact ? "" : site.phone}
      </a>,
    );
  else if (isDev) items.push(<Pending key="tel" label="전화번호" />);

  if (site.kakaoUrl)
    items.push(
      <a key="kakao" href={site.kakaoUrl} className="btn-ghost" target="_blank" rel="noopener" data-track="click_kakao">
        카카오톡 문의
      </a>,
    );
  if (site.smsNumber)
    items.push(
      <a key="sms" href={smsHref(site.smsNumber)} className="btn-ghost" data-track="click_sms">
        문자 문의
      </a>,
    );
  if (site.reservationUrl)
    items.push(
      <a key="resv" href={site.reservationUrl} className="btn-ghost" data-track="click_reservation">
        온라인 예약
      </a>,
    );
  if (!items.length) return null;
  return <div className="flex flex-wrap gap-3">{items}</div>;
}

/**
 * 예약 안내 운영자 연락 버튼 (전화·문자·카카오톡·LINE·텔레그램). 제공된 링크로만 연결한다.
 * set: "primary" = 전화·문자·카카오톡, "all" = LINE·텔레그램 포함
 */
export function OperatorButtons({ set = "all", labels }: { set?: "primary" | "all"; labels?: { call: string; sms: string; kakao: string; line: string; telegram: string } }) {
  const o = operator;
  const L = labels ?? { call: "전화", sms: "문자 문의", kakao: "카카오톡 문의", line: "LINE 문의", telegram: "텔레그램 문의" };
  const items: { href: string; label: string; track: string; external?: boolean; gold?: boolean }[] = [];
  if (o.phone) items.push({ href: telHref(o.phone), label: `${L.call} ${o.phone}`, track: "click_call", gold: true });
  if (o.smsNumber) items.push({ href: smsHref(o.smsNumber), label: L.sms, track: "click_sms" });
  if (o.kakaoUrl) items.push({ href: o.kakaoUrl, label: L.kakao, track: "click_kakao", external: true });
  if (set === "all" && o.lineUrl) items.push({ href: o.lineUrl, label: L.line, track: "click_line", external: true });
  if (set === "all" && o.telegramUrl) items.push({ href: o.telegramUrl, label: L.telegram, track: "click_telegram", external: true });
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-3">
      {items.map((i) => (
        <li key={i.track}>
          <a
            href={i.href}
            data-track={i.track}
            className={i.gold ? "btn-gold" : "btn-ghost"}
            {...(i.external ? { target: "_blank", rel: "noopener" } : {})}
          >
            {i.gold && <PhoneIcon />} {i.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** 모바일 하단 고정 바: 예약(→/reservation/)·전화·카카오톡. 운영자 연락처가 없으면 렌더링하지 않는다. */
export function MobileCtaBar({ locale = "ko" }: { locale?: LocaleKey }) {
  const o = operator;
  const t = locale === "ko" ? { reserve: "예약 문의", call: "전화", kakao: "카카오톡", label: "빠른 연락" } : CONTENT[locale].ui.bar;
  if (!o.phone && !o.kakaoUrl) return null;
  const cell = "flex h-14 items-center justify-center gap-1.5 text-sm font-semibold";
  return (
    <nav
      aria-label={t.label}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/30 bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-3">
        <li>
          <Link href={localePath(locale, "reservation")} className={`${cell} bg-gold text-ink`} data-track="click_reservation_bar" data-testid="bar-reservation">
            {t.reserve}
          </Link>
        </li>
        {o.phone && (
          <li>
            <a href={telHref(o.phone)} className={`${cell} border-r border-line text-gold-2`} data-track="click_call">
              <PhoneIcon /> {t.call}
            </a>
          </li>
        )}
        {o.kakaoUrl && (
          <li>
            <a href={o.kakaoUrl} target="_blank" rel="noopener" className={`${cell} text-gold-2`} data-track="click_kakao">
              {t.kakao}
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
}

/** 히어로용 빠른 문의: 전화·문자·카카오톡 (첫 화면) */
export function QuickContact({ labels }: { labels?: { call: string; sms: string; kakao: string } } = {}) {
  const o = operator;
  const L = labels ?? { call: "전화", sms: "문자", kakao: "카카오톡" };
  const items: { href: string; label: string; track: string; external?: boolean }[] = [];
  if (o.phone) items.push({ href: telHref(o.phone), label: L.call, track: "click_call" });
  if (o.smsNumber) items.push({ href: smsHref(o.smsNumber), label: L.sms, track: "click_sms" });
  if (o.kakaoUrl) items.push({ href: o.kakaoUrl, label: L.kakao, track: "click_kakao", external: true });
  if (!items.length) return null;
  return (
    <ul className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3" data-testid="hero-quick">
      {items.map((i) => (
        <li key={i.track}>
          <a
            href={i.href}
            data-track={i.track}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-gold/50 px-5 text-sm font-semibold text-gold-2 hover:border-gold hover:bg-gold/10"
            {...(i.external ? { target: "_blank", rel: "noopener" } : {})}
          >
            {i.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
