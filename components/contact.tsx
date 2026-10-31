import type { ReactNode } from "react";
import { site, telHref, smsHref, isDev } from "@/lib/site";
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

/** 모바일 하단 고정 CTA. 실제 연락처가 하나도 없으면 렌더링하지 않는다. */
export function MobileCtaBar() {
  const links: { href: string; label: string; track: string; external?: boolean }[] = [];
  if (site.phone) links.push({ href: telHref(site.phone), label: "전화", track: "click_call" });
  if (site.kakaoUrl) links.push({ href: site.kakaoUrl, label: "카카오톡", track: "click_kakao", external: true });
  else if (site.smsNumber) links.push({ href: smsHref(site.smsNumber), label: "문자", track: "click_sms" });
  if (site.mapUrl) links.push({ href: site.mapUrl, label: "길찾기", track: "click_directions", external: true });
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
              className={`flex h-14 items-center justify-center text-sm font-semibold ${
                i === 0 ? "bg-gold text-ink" : "text-gold-2"
              }`}
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
