import Link from "next/link";
import type { ReactNode } from "react";
import { operator, partners, reservationReady } from "@/lib/site";
import { OperatorButtons } from "@/components/contact";
import { ReservationForm } from "@/components/reservation-form";
import { SectionHeading } from "@/components/ui";
import type { VenueTypeKey } from "@/lib/i18n/form-text";

/** 업종 상세 페이지 공통: 확인 항목 목록 */
export function CheckList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-3">
      {items.map((t, i) => (
        <li key={i} className="card flex items-start gap-3 p-5 text-sm">
          <span aria-hidden="true" className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border border-gold/60 text-[0.7rem] text-gold">
            ✓
          </span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * 업종 상세 페이지의 예약 문의 블록: 희망 업종이 미리 선택된 문의 작성기 + 직접 연락 버튼.
 * 제휴 매장의 허가 업종이 확인되지 않은 동안에는 그 사실을 함께 표시한다 (해당 업종 매장이 있다고 단정하지 않음).
 */
export function TypeInquiry({ type, label }: { type: Exclude<VenueTypeKey, "any">; label: string }) {
  if (!reservationReady() || !operator.smsNumber) return null;
  const p = partners[0];
  const verified = Boolean(p?.licenseVerified && p.licenseType);
  return (
    <section aria-labelledby="inquiry">
      <SectionHeading eyebrow="Reservation" id="inquiry" title={`${label} 예약 문의하기`}>
        희망 업종이 ‘{label}’로 선택되어 있습니다. 날짜·시간·인원을 고르면 문의 문장이 만들어지고, 문자·메신저·전화로 직접 보내시면 됩니다.
      </SectionHeading>
      <p className="mb-5 rounded-xl border border-line bg-ink/60 p-4 text-sm text-mute" data-testid="type-partner-status">
        {verified ? (
          <>
            현재 제휴 매장의 허가 업종: <strong className="text-ivory">{p!.licenseType}</strong>
          </>
        ) : (
          <>
            현재 제휴 매장(대구 수성구)의 허가 업종은 <strong className="text-ivory">확인 중</strong>입니다. 문의를 받으면 {label}으로 허가된 제휴 매장이
            있는지부터 확인해 알려드리며, 확인되지 않은 업종을 대신 약속하지 않습니다.
          </>
        )}
      </p>
      <ReservationForm
        defaultType={type}
        smsNumber={operator.smsNumber}
        phone={operator.phone}
        kakaoUrl={operator.kakaoUrl}
        lineUrl={operator.lineUrl}
        telegramUrl={operator.telegramUrl}
      />
      <div className="mt-6">
        <p className="mb-3 text-sm text-mute">폼 없이 바로 연락하기</p>
        <OperatorButtons set="all" />
      </div>
      <p className="mt-4 text-sm text-mute">
        진행 순서와 제휴 매장 위치는{" "}
        <Link href="/reservation/" className="text-gold-2 underline underline-offset-4 hover:text-ivory">
          예약 문의 페이지
        </Link>
        에서 확인할 수 있습니다.
      </p>
    </section>
  );
}
