import type { ReactNode } from "react";
import { site, operator, telHref, smsHref, isDev } from "@/lib/site";
import { Pending } from "@/components/ui";

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
export function OperatorButtons({ set = "all" }: { set?: "primary" | "all" }) {
  const o = operator;
  const items: { href: string; label: string; track: string; external?: boolean; gold?: boolean }[] = [];
  if (o.phone) items.push({ href: telHref(o.phone), label: `전화 ${o.phone}`, track: "click_call", gold: true });
  if (o.smsNumber) items.push({ href: smsHref(o.smsNumber), label: "문자 문의", track: "click_sms" });
  if (o.kakaoUrl) items.push({ href: o.kakaoUrl, label: "카카오톡 문의", track: "click_kakao", external: true });
  if (set === "all" && o.lineUrl) items.push({ href: o.lineUrl, label: "LINE 문의", track: "click_line", external: true });
  if (set === "all" && o.telegramUrl) items.push({ href: o.telegramUrl, label: "텔레그램 문의", track: "click_telegram", external: true });
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

/** 모바일 하단 고정 예약 버튼: 운영자 전화·문자·카카오톡. 연락처가 없으면 렌더링하지 않는다. */
export function MobileCtaBar() {
  const o = operator;
  const links: { href: string; label: string; track: string; external?: boolean }[] = [];
  if (o.phone) links.push({ href: telHref(o.phone), label: "전화 예약", track: "click_call" });
  if (o.smsNumber) links.push({ href: smsHref(o.smsNumber), label: "문자 예약", track: "click_sms" });
  if (o.kakaoUrl) links.push({ href: o.kakaoUrl, label: "카카오톡", track: "click_kakao", external: true });
  if (!links.length) return null;
  return (
    <nav
      aria-label="빠른 연락"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${links.length}, minmax(0, 1fr))` }}>
        {links.map((l, i) => (
          <li key={l.track}>
            <a
              href={l.href}
              data-track={l.track}
              {...(l.external ? { target: "_blank", rel: "noopener" } : {})}
              className={`flex h-14 items-center justify-center text-sm font-semibold ${i === 0 ? "bg-gold text-ink" : "text-gold-2"}`}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
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
