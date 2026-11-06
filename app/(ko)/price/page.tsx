import { site, brand, isDev } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";
import { SubPage } from "@/components/subpage";
import { FaqList, PriceTable } from "@/components/sections";
import { GENERAL_FAQ } from "@/lib/content";
import { Pending, SectionHeading } from "@/components/ui";

export const metadata = buildMetadata("/price/");

export default function PricePage() {
  return (
    <SubPage
      path="/price/"
      lead={
        <>
          {brand() || "저희 업소"}의 요금을 텍스트로 공개합니다. 인원·시간·주류 선택에 따라 금액이 달라질 수 있으니, 방문 전 최종 금액을 꼭 확인하세요.
        </>
      }
    >
      <section aria-labelledby="price-table">
        <SectionHeading id="price-table" title="요금표" />
        <PriceTable />
        {site.priceNotes.length > 0 && (
          <ul className="mt-6 space-y-2 text-sm text-mute">
            {site.priceNotes.map((n) => (
              <li key={n}>· {n}</li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="payment">
        <SectionHeading id="payment" title="결제 수단" />
        {site.payment.length ? (
          <ul className="flex flex-wrap gap-3">
            {site.payment.map((p) => (
              <li key={p} className="card px-5 py-3">{p}</li>
            ))}
          </ul>
        ) : (
          isDev && <Pending label="결제 수단" />
        )}
      </section>
      <section aria-labelledby="price-check">
        <SectionHeading id="price-check" title="요금 확인 체크리스트">
          처음 방문하신다면 예약할 때 아래 내용을 확인하시면 계산 시 오해를 줄일 수 있습니다.
        </SectionHeading>
        <ul className="grid gap-4 sm:grid-cols-2">
          {[
            "기본 요금에 포함되는 항목 (룸 이용 시간, 기본 주류·안주)",
            "추가 주문 시 단가와 봉사료·부가세 포함 여부",
            "연장 시 요금 기준",
            "카드 결제와 영수증 발행 가능 여부",
          ].map((t) => (
            <li key={t} className="card p-5 text-sm">{t}</li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="price-faq">
        <SectionHeading id="price-faq" title="요금 관련 자주 묻는 질문" />
        <FaqList items={GENERAL_FAQ.slice(2)} />
      </section>
    </SubPage>
  );
}
