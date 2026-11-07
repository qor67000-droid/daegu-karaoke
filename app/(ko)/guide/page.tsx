import { brand, businessReady, reservationReady, site } from "@/lib/site";
import Link from "next/link";
import { buildMetadata, faqLd } from "@/lib/seo";
import { legalNotice, NAME_NOTE } from "@/lib/content";
import { SubPage } from "@/components/subpage";
import { VenueCompare, VisitSteps, FaqList } from "@/components/sections";
import { JsonLd, SectionHeading } from "@/components/ui";

export const metadata = buildMetadata("/guide/");

const GUIDE_MODIFIED = "2026-11-05";

const GUIDE_FAQ = [
  {
    q: "코인노래방이나 일반 노래방을 찾고 있는데요?",
    a: "코인노래방과 일반 노래방은 노래연습장 업종으로, 주류를 팔지 않고 청소년실이 있으면 청소년도 이용할 수 있습니다. 이 사이트는 노래연습장 예약을 안내하지 않으니, 가족·친구와 노래만 부르실 계획이라면 지도 앱에서 가까운 노래연습장을 찾으세요.",
  },
  {
    q: "가라오케와 룸살롱은 같은 곳인가요?",
    a: "법적으로는 둘 다 유흥주점에 해당할 수 있지만, 업소마다 운영 방식이 다릅니다. 방문 전 업소에 직접 이용 방식과 요금을 확인하세요.",
  },
  {
    q: "업소가 정식으로 신고된 곳인지 어떻게 확인하나요?",
    a: "식품접객업소는 관할 구청에 영업신고를 하고 영업신고증을 업소에 보관합니다. 업소에 업종과 상호가 적힌 영업신고증 확인을 요청하실 수 있습니다.",
  },
];

export default function GuidePage() {
  return (
    <SubPage
      path="/guide/"
      modified={GUIDE_MODIFIED}
      lead={
        <>
          유흥주점과 단란주점은 둘 다 주류를 파는 식품접객업이지만 법에서 허용하는 영업 범위가 다릅니다. “대구 노래방”으로 검색하면 함께
          나오는 노래연습장은 아예 다른 법을 따르는 업종입니다.
          {businessReady() && ` ${brand()}는 ${site.licenseType} 업종입니다.`}
        </>
      }
    >
      <JsonLd data={faqLd(GUIDE_FAQ)} />
      <section aria-labelledby="compare">
        <SectionHeading id="compare" title="업종별 차이 한눈에 보기">
          주요 차이만 요약했습니다. 세부 규정은 지자체와 법령 개정에 따라 달라질 수 있습니다.
        </SectionHeading>
        <VenueCompare />
      </section>
      <section aria-labelledby="legal-scope">
        <SectionHeading id="legal-scope" title="유흥주점과 단란주점, 법이 정한 영업 범위" />
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="card border-gold/40 p-6">
            <h3 className="h-display text-xl">유흥주점영업</h3>
            <p className="mt-3 text-sm text-mute">
              식품위생법 시행령 제21조 제8호 라목: 주로 주류를 조리·판매하는 영업으로, 유흥종사자를 두거나 유흥시설을 설치할 수 있고 손님이
              노래를 부르거나 춤을 추는 행위가 허용됩니다.
            </p>
            <p className="mt-3 text-sm text-mute">
              시행령 제22조에서 유흥종사자는 손님과 함께 술을 마시거나 노래·춤으로 흥을 돋우는 부녀자인 유흥접객원을, 유흥시설은 춤을 출 수
              있도록 설치한 무도장을 말합니다.
            </p>
            <Link href="/yuheung-jujeom/" className="mt-4 inline-block text-sm text-gold-2 underline-offset-4 hover:underline">
              대구 유흥주점 예약 문의·확인 사항 →
            </Link>
          </article>
          <article className="card p-6">
            <h3 className="h-display text-xl">단란주점영업</h3>
            <p className="mt-3 text-sm text-mute">
              식품위생법 시행령 제21조 제8호 다목: 주로 주류를 조리·판매하는 영업으로, 손님이 노래를 부르는 행위가 허용됩니다.
            </p>
            <p className="mt-3 text-sm text-mute">
              유흥종사자를 두거나 유흥시설을 설치할 수 있는 것은 유흥주점뿐이므로, 단란주점에서는 유흥접객원이 동석할 수 없습니다. 객실 구조 등
              시설기준은 관할 구청 안내를 따릅니다.
            </p>
            <Link href="/danran-jujeom/" className="mt-4 inline-block text-sm text-gold-2 underline-offset-4 hover:underline">
              대구 단란주점 시설기준·예약 문의 →
            </Link>
          </article>
        </div>
        <p className="mt-5 text-sm text-mute">
          두 업종 모두 청소년보호법상 청소년유해업소로 만 19세 미만의 출입·고용이 금지됩니다. {NAME_NOTE}
        </p>
      </section>
      <section aria-labelledby="first-visit">
        <SectionHeading id="first-visit" title="처음 방문할 때 이용 절차" />
        <VisitSteps />
      </section>
      <section aria-labelledby="how-to-tell">
        <SectionHeading id="how-to-tell" title="간판만 보고 업종을 구분하는 방법">
          이름에 “노래”, “가라오케”가 들어가도 업종은 다를 수 있습니다. 아래 순서로 확인하고, 유흥주점인지 단란주점인지는 마지막에 영업신고(허가)증으로 확인하세요.
        </SectionHeading>
        <ol className="grid gap-4 sm:grid-cols-3">
          <li className="card p-5">
            <span className="text-gold">1.</span> 간판·입구의 업종 표기와 “19세 미만 출입 금지” 표시를 봅니다. 청소년실이 없는 노래연습장도 청소년 출입을 제한할 수 있으니, 이 표시만으로 판단하지 말고 다음 항목도 확인하세요.
          </li>
          <li className="card p-5">
            <span className="text-gold">2.</span> 주류를 파는지 물어봅니다. 노래연습장은 주류를 판매·제공할 수 없고 손님의 주류 반입을 묵인해서도 안 됩니다. 주류를 판다면 유흥주점이나 단란주점 같은 주점 업종입니다.
          </li>
          <li className="card p-5">
            <span className="text-gold">3.</span> 요금 체계를 물어봅니다. 노래연습장은 보통 시간·곡 단위, 주점은 주류·안주와 룸 이용을 묶은 요금인 경우가 많습니다.
          </li>
        </ol>
      </section>
      <section aria-labelledby="next">
        <SectionHeading id="next" title="함께 보면 좋은 정보" />
        <ul className="flex flex-wrap gap-3">
          <li><Link href="/guide/first-visit/" className="btn-ghost">처음 이용 체크리스트</Link></li>
          <li><Link href="/guide/daegu-areas/" className="btn-ghost">대구 지역별 안내</Link></li>
          {reservationReady() && (
            <li><Link href="/reservation/" className="btn-gold" data-track="click_reservation_guide">유흥주점·단란주점 예약 문의</Link></li>
          )}
        </ul>
      </section>
      <section aria-labelledby="rules">
        <SectionHeading id="rules" title="이용 유의사항" />
        <ul className="grid gap-4 sm:grid-cols-2">
          <li className="card p-5">{legalNotice()}</li>
          <li className="card p-5">과음은 건강을 해칩니다. 음주 후에는 운전하지 마세요.</li>
          <li className="card p-5">요금은 방문 전 확인하시고, 계산 시 영수증을 받아두세요.</li>
          <li className="card p-5">다른 손님과 직원에 대한 폭언·폭행은 법적 처벌 대상입니다.</li>
        </ul>
      </section>
      <section aria-labelledby="guide-faq">
        <SectionHeading id="guide-faq" title="업종 관련 자주 묻는 질문" />
        <FaqList items={GUIDE_FAQ} />
      </section>
    </SubPage>
  );
}
