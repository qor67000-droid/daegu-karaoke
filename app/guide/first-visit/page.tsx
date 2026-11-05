import Link from "next/link";
import { buildMetadata, faqLd } from "@/lib/seo";
import { reservationReady } from "@/lib/site";
import { FIRST_VISIT } from "@/lib/guides";
import { SubPage } from "@/components/subpage";
import { FaqList } from "@/components/sections";
import { JsonLd, SectionHeading } from "@/components/ui";

export const metadata = buildMetadata("/guide/first-visit/");

const FAQ = [
  {
    q: "혼자 가라오케에 가도 되나요?",
    a: "업소마다 다릅니다. 1인 이용 가능 여부와 최소 요금이 있는지 예약할 때 물어보세요.",
  },
  {
    q: "예약 없이 가도 되나요?",
    a: "빈 룸이 있으면 바로 이용할 수 있지만, 주말이나 단체라면 전화로 먼저 확인하는 편이 기다리는 시간을 줄입니다.",
  },
  {
    q: "카드 결제가 안 된다고 하면 어떻게 하나요?",
    a: "카드 결제 가능 여부는 입장 전에 확인하세요. 결제 수단을 미리 정해두면 계산할 때 다툼을 줄일 수 있습니다.",
  },
];

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((t) => (
        <li key={t} className="card flex items-start gap-3 p-5">
          <span aria-hidden="true" className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border border-gold/60 text-[0.7rem] text-gold">
            ✓
          </span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export default function FirstVisitPage() {
  return (
    <SubPage
      path="/guide/first-visit/"
      modified="2026-10-30"
      lead={
        <>
          가라오케(유흥주점·단란주점)를 처음 이용한다면 예약 전에 요금 구조를 확인하는 것이 가장 중요합니다. 예약부터 귀가까지 순서대로
          정리했습니다.
        </>
      }
    >
      <JsonLd data={faqLd(FAQ)} />
      <section aria-labelledby="before">
        <SectionHeading id="before" title="1. 가기 전에" />
        <ol className="grid gap-5 sm:grid-cols-3">
          {FIRST_VISIT.before.map((s, i) => (
            <li key={s.title} className="card p-6">
              <span className="h-display text-3xl text-gold/80">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-mute">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>
      <section aria-labelledby="price-check">
        <SectionHeading id="price-check" title="2. 요금 확인 체크리스트">
          예약 전화에서 아래 다섯 가지를 확인하면 계산할 때 생기는 오해 대부분을 막을 수 있습니다.
        </SectionHeading>
        <Checklist items={FIRST_VISIT.priceChecklist} />
        {reservationReady() && (
          <p className="mt-5 text-sm text-mute">
            체크리스트 내용을 함께 물어보고 싶다면{" "}
            <Link href="/reservation/" className="link-more" data-track="click_reservation_guide">
              예약 문의 페이지
            </Link>
            의 요청사항 칸에 적어 보내세요.
          </p>
        )}
      </section>
      <section aria-labelledby="at-venue">
        <SectionHeading id="at-venue" title="3. 업소에서" />
        <Checklist items={FIRST_VISIT.atVenue} />
      </section>
      <section aria-labelledby="going-home">
        <SectionHeading id="going-home" title="4. 귀가할 때" />
        <Checklist items={FIRST_VISIT.goingHome} />
      </section>
      <section aria-labelledby="trouble">
        <SectionHeading id="trouble" title="문제가 생겼을 때" />
        <Checklist items={FIRST_VISIT.trouble} />
      </section>
      <section aria-labelledby="fv-faq">
        <SectionHeading id="fv-faq" title="자주 묻는 질문" />
        <FaqList items={FAQ} />
      </section>
    </SubPage>
  );
}
