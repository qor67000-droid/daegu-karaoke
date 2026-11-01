import Link from "next/link";
import { operator, partners, reservationReady } from "@/lib/site";
import { buildMetadata, faqLd } from "@/lib/seo";
import { legalNotice } from "@/lib/content";
import { SubPage } from "@/components/subpage";
import { FaqList } from "@/components/sections";
import { JsonLd, SectionHeading } from "@/components/ui";
import { OperatorButtons } from "@/components/contact";
import { ReservationForm } from "@/components/reservation-form";

export const metadata = buildMetadata("/reservation/");

const STEPS = [
  { title: "문의 남기기", body: "아래에서 날짜·시간·인원·요청사항을 선택하고 문자 또는 메신저로 보내 주세요. 보내기 버튼을 누른 뒤 전송은 직접 하셔야 합니다." },
  { title: "예약 가능 여부 확인", body: "운영자가 제휴 매장에 해당 날짜·시간·인원의 예약 가능 여부와 이용 요금을 확인합니다." },
  { title: "연락·안내", body: "확인 결과를 보내주신 연락처로 안내해 드립니다. 요금과 이용 조건을 이때 함께 확인하세요." },
  { title: "고객 확인 후 확정", body: "안내 내용에 고객님이 동의하신 경우에만 예약이 확정됩니다. 사이트에서 자동으로 확정되지 않습니다." },
];

const FAQ = [
  {
    q: "이 사이트에서 바로 예약이 확정되나요?",
    a: "아니요. 이 사이트는 예약 문의를 보내는 방법을 안내합니다. 운영자가 제휴 매장의 예약 가능 여부를 확인한 뒤 연락드리고, 고객님이 안내 내용을 확인하신 후에 예약이 확정됩니다.",
  },
  {
    q: "입력한 내용이 사이트에 저장되나요?",
    a: "저장되지 않습니다. 입력한 내용은 고객님의 기기에서 문자·메신저 내용으로만 만들어지며, 고객님이 직접 전송해야 운영자에게 전달됩니다.",
  },
  {
    q: "예약 안내 서비스가 매장을 직접 운영하나요?",
    a: "아니요. 이 서비스는 매장과 독립적으로 운영되며, 예약 가능한 제휴 매장을 고객에게 연결해 드립니다. 매장의 영업과 요금은 각 매장이 정합니다.",
  },
  {
    q: "제휴 매장은 어디에 있나요?",
    a: "현재 예약을 연결하는 제휴 매장은 대구광역시 수성구 동대구로 117에 있습니다. 매장명, 영업신고 업종, 영업시간, 요금은 확인되는 대로 이 페이지에 게시합니다.",
  },
  {
    q: "미성년자도 예약할 수 있나요?",
    a: "아니요. 주류를 판매하는 가라오케·주점은 만 19세 미만이 출입할 수 없으므로 만 19세 이상만 예약 문의를 받습니다.",
  },
];

export default function ReservationPage() {
  const p = partners[0];
  const mapUrl = p ? `https://map.kakao.com/?q=${encodeURIComponent(p.mapQuery)}` : null;
  return (
    <SubPage
      path="/reservation/"
      modified="2026-11-01"
      lead={
        <>
          이 페이지는 <strong className="text-ivory">독립적으로 운영되는 예약 안내 서비스</strong>입니다. 날짜·시간·인원을 남겨 주시면 운영자가 대구
          수성구 제휴 매장의 예약 가능 여부를 확인해 연락드립니다. 제휴 매장은 운영자의 직영점이 아닙니다.
        </>
      }
    >
      <JsonLd data={faqLd(FAQ)} />

      {reservationReady() && operator.smsNumber && (
        <section aria-labelledby="form">
          <SectionHeading id="form" title="예약 문의 작성">
            필수 항목을 선택하면 보낼 내용이 자동으로 만들어집니다. 문자 버튼은 휴대폰에서 문자 앱을 엽니다.
          </SectionHeading>
          <ReservationForm smsNumber={operator.smsNumber} kakaoUrl={operator.kakaoUrl} lineUrl={operator.lineUrl} telegramUrl={operator.telegramUrl} />
        </section>
      )}

      <section aria-labelledby="channels">
        <SectionHeading id="channels" title="전화·메신저로 바로 문의">
          작성 없이 바로 연락하셔도 됩니다. 날짜, 시간, 인원을 함께 알려 주시면 확인이 빠릅니다.
        </SectionHeading>
        <OperatorButtons set="all" />
      </section>

      <section aria-labelledby="flow">
        <SectionHeading id="flow" title="예약은 이렇게 진행됩니다" />
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card p-6">
              <span className="h-display text-3xl text-gold/80">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-mute">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {p && (
        <section aria-labelledby="partner">
          <SectionHeading id="partner" title="제휴 매장 위치">
            예약을 연결하는 제휴 매장의 소재지입니다. 예약 안내 서비스 운영자의 사업장 주소가 아닙니다.
          </SectionHeading>
          <div className="card grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <dl className="space-y-3">
              <div>
                <dt className="eyebrow mb-1">제휴 매장 소재지</dt>
                <dd className="text-lg">{p.address}</dd>
              </div>
              <div>
                <dt className="eyebrow mb-1">매장 정보</dt>
                <dd className="text-sm text-mute">
                  {p.name && p.licenseVerified
                    ? `${p.name} · ${p.licenseType}`
                    : "매장명·영업신고 업종·영업시간·요금·사진은 확인되는 대로 게시합니다. 예약 안내 시 문의해 주시면 확인된 내용을 알려드립니다."}
                </dd>
              </div>
            </dl>
            {mapUrl && (
              <a href={mapUrl} target="_blank" rel="noopener" className="btn-ghost" data-track="click_directions">
                지도에서 위치 보기
              </a>
            )}
          </div>
          <p className="mt-4 text-sm text-mute">
            수성구 일대의 교통과 귀가 방법은{" "}
            <Link href="/guide/daegu-areas/" className="link-more">
              대구 지역별 안내
            </Link>
            에서 확인할 수 있습니다.
          </p>
        </section>
      )}

      <section aria-labelledby="before">
        <SectionHeading id="before" title="문의 전에 알아두세요" />
        <ul className="grid gap-4 sm:grid-cols-2">
          <li className="card p-5 text-sm">{legalNotice()}</li>
          <li className="card p-5 text-sm">
            요금은 매장마다 다르며, 예약 가능 여부를 안내할 때 확인된 금액과 포함 항목을 함께 알려드립니다.{" "}
            <Link href="/guide/first-visit/" className="link-more">
              요금 확인 체크리스트
            </Link>
          </li>
          <li className="card p-5 text-sm">
            가라오케와 일반 노래방(노래연습장)은 업종이 다릅니다. 가족·친구와 노래만 부르실 계획이면{" "}
            <Link href="/guide/" className="link-more">
              업종 차이
            </Link>
            를 먼저 확인하세요.
          </li>
          <li className="card p-5 text-sm">예약을 변경하거나 취소하실 때는 문의하신 같은 연락처로 미리 알려 주세요.</li>
        </ul>
      </section>

      <section aria-labelledby="rsv-faq">
        <SectionHeading id="rsv-faq" title="예약 문의 자주 묻는 질문" />
        <FaqList items={FAQ} />
      </section>
    </SubPage>
  );
}
