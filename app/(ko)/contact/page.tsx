import { site, brand, telHref, isDev } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";
import { SubPage } from "@/components/subpage";
import { ContactButtons } from "@/components/contact";
import { HoursAndAddress } from "@/components/sections";
import { Pending, SectionHeading } from "@/components/ui";
import { FIRST_VISIT } from "@/lib/guides";

export const metadata = buildMetadata("/contact/");

export default function ContactPage() {
  return (
    <SubPage
      path="/contact/"
      lead={<>{brand() || "저희 업소"} 예약과 문의는 아래 연락처로 해 주세요. 온라인 결제나 개인정보 입력 없이 전화·메시지로만 예약을 받습니다.</>}
    >
      <section aria-labelledby="channels">
        <SectionHeading id="channels" title="연락처" />
        <div className="card p-6 sm:p-8">
          {site.phone ? (
            <p className="h-display text-3xl sm:text-4xl">
              <a href={telHref(site.phone)} data-track="click_call" className="hover:text-gold-2">
                {site.phone}
              </a>
            </p>
          ) : (
            isDev && <Pending label="대표 전화" />
          )}
          <div className="mt-6">
            <ContactButtons compact />
          </div>
        </div>
      </section>
      <section aria-labelledby="what-to-tell">
        <SectionHeading id="what-to-tell" title="예약할 때 알려주세요" />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["방문 날짜와 도착 예정 시간", "인원", "원하는 룸 크기", "요금 문의 사항"].map((t, i) => (
            <li key={t} className="card p-5">
              <span className="text-gold">{i + 1}.</span> {t}
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-mute">만 19세 미만은 예약 및 입장이 불가합니다.</p>
      </section>
      <section aria-labelledby="ask">
        <SectionHeading id="ask" title="예약 전화에서 확인하면 좋은 것">
          처음 방문하신다면 아래 내용을 함께 물어보세요. 계산할 때 생기는 오해를 줄일 수 있습니다.
        </SectionHeading>
        <ul className="grid gap-3 sm:grid-cols-2">
          {FIRST_VISIT.priceChecklist.map((t) => (
            <li key={t} className="card p-5 text-sm">{t}</li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="visit-info">
        <SectionHeading id="visit-info" title="위치와 영업시간" />
        <HoursAndAddress />
      </section>
    </SubPage>
  );
}
