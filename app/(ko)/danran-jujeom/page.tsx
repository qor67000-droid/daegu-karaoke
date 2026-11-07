import Link from "next/link";
import { buildMetadata, faqLd } from "@/lib/seo";
import { SubPage } from "@/components/subpage";
import { FaqList } from "@/components/sections";
import { JsonLd, SectionHeading } from "@/components/ui";
import { CheckList, TypeInquiry } from "@/components/type-inquiry";

export const metadata = buildMetadata("/danran-jujeom/");

/**
 * 대구 단란주점 예약 문의 — 검색 의도: "모임 2차로 술과 노래가 되는 곳을 예약 / 유흥주점과 무엇이 다른지".
 * 근거: 식품위생법 시행령 제21조 제8호 다목·제22조·제23조, 대구 서구청 '단란주점 시설기준' 안내(식품위생법 시행규칙 별표 14).
 */
const MODIFIED = "2026-11-07";

const FAQ = [
  {
    q: "대구 단란주점 예약은 어떻게 문의하나요?",
    a: "이 페이지의 문의 작성기에서 날짜·시간·인원을 고른 뒤 문자·카카오톡·LINE·텔레그램으로 보내거나 전화하시면 됩니다. 운영자가 단란주점으로 허가된 제휴 매장이 있는지, 원하시는 시간에 이용 가능한지 확인해 연락드립니다.",
  },
  {
    q: "단란주점에서 접객원이 동석할 수 있나요?",
    a: "없습니다. 유흥종사자를 둘 수 있는 업종은 유흥주점뿐이며, 단란주점은 손님이 노래하는 것이 허용되는 주점입니다. 이런 형태를 안내하거나 약속하지 않습니다.",
  },
  {
    q: "노래방(노래연습장)과는 뭐가 다른가요?",
    a: "노래연습장은 음악산업진흥에 관한 법률에 따른 업종으로 술을 팔 수 없고 청소년실이 있으면 청소년도 이용할 수 있습니다. 단란주점은 식품위생법상 주류를 판매하는 업종이라 만 19세 미만은 들어갈 수 없습니다.",
  },
  {
    q: "회식 인원이 많아도 되나요?",
    a: "매장 공간에 따라 다릅니다. 인원과 도착 시간을 알려주시면 수용 가능 여부를 확인해 드리며, 15명이 넘으면 요청사항에 대략적인 인원을 적어 주세요.",
  },
];

export default function Page() {
  return (
    <SubPage
      path="/danran-jujeom/"
      modified={MODIFIED}
      lead={
        <>
          회식이나 모임 2차로 대구에서 술과 노래를 함께할 수 있는 단란주점을 찾는 분을 위한 예약 문의 안내입니다. 이 사이트는 독립적으로 운영하는{" "}
          <strong className="text-ivory">예약 문의 연결 서비스</strong>이며, 제휴 매장은 운영자의 직영점이 아닙니다. 확인되지 않은 요금·영업시간·매장 정보는
          싣지 않습니다.
        </>
      }
    >
      <JsonLd data={faqLd(FAQ)} />

      <section aria-labelledby="what">
        <SectionHeading eyebrow="Legal scope" id="what" title="단란주점은 법적으로 어떤 업종인가요" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card p-6 text-sm text-mute">
            <h3 className="font-semibold text-ivory">영업 범위 (식품위생법 시행령 제21조 제8호 다목)</h3>
            <p className="mt-2">
              주로 주류를 조리·판매하는 영업으로, <strong className="text-ivory">손님이 노래를 부르는 행위가 허용</strong>됩니다.
            </p>
            <p className="mt-2">
              유흥종사자(유흥접객원)를 두거나 무도장 같은 유흥시설을 설치할 수 있는 것은 유흥주점뿐입니다. 그래서 단란주점은 일행끼리 술을 마시며 노래하는
              곳이고, 춤은 허용 범위에 들어 있지 않습니다.
            </p>
          </div>
          <div className="card p-6 text-sm text-mute">
            <h3 className="font-semibold text-ivory">허가 업종 · 청소년 출입 금지</h3>
            <p className="mt-2">
              단란주점도 유흥주점처럼 <strong className="text-ivory">구청장의 영업허가</strong>가 필요한 업종입니다(시행령 제23조). 대구 서구청 안내에 따르면
              건물 용도와 학교 주변 정화구역 여부 등을 확인한 뒤 현장 확인을 거쳐 허가증이 나옵니다.
            </p>
            <p className="mt-2">청소년보호법상 청소년유해업소로, 만 19세 미만은 출입과 고용이 금지됩니다.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="facility">
        <SectionHeading eyebrow="Facility rules" id="facility" title="단란주점 시설기준 — 이용자가 알아두면 좋은 것">
          대구 서구청이 안내하는 단란주점 시설기준(식품위생법 시행규칙 별표 14) 가운데 이용자에게 직접 관계있는 항목입니다. 기준을 지키지 않은 영업장은
          행정처분 대상이 됩니다.
        </SectionHeading>
        <CheckList
          items={[
            <>
              <strong className="text-ivory">객실에는 잠금장치를 설치할 수 없습니다.</strong>
            </>,
            <>
              주된 객장에는 높이 <strong className="text-ivory">1.5미터 미만의 칸막이</strong>만 둘 수 있고, 두 면 이상을 완전히 막으면 안 되며 다른 객석에서
              내부가 서로 보여야 합니다.
            </>,
            <>공연을 하는 단란주점은 무대를 객석과 구분해 설치하되, 객실 안에는 설치할 수 없습니다.</>,
            <>조리장은 손님이 내부를 볼 수 있는 구조여야 합니다.</>,
            <>도박·사행행위나 성범죄를 조장할 우려가 있는 기구·가구는 설치할 수 없습니다.</>,
          ]}
        />
      </section>

      <section aria-labelledby="service">
        <SectionHeading eyebrow="What we do" id="service" title="예약 문의로 실제 확인해 드리는 것" />
        <div className="grid gap-4 lg:grid-cols-2">
          <CheckList
            items={[
              "제휴 매장이 단란주점으로 허가된 곳인지 (확인되지 않으면 그렇다고 알려드립니다)",
              "원하시는 날짜·도착 시간·인원을 수용할 수 있는지",
              "요금 기준 — 기본 요금에 포함되는 것, 시간 연장 기준",
              "결제 수단과 단체 이용 시 유의사항",
            ]}
          />
          <div className="card p-6 text-sm text-mute">
            <h3 className="font-semibold text-ivory">이런 모임에 맞습니다</h3>
            <ul className="mt-3 space-y-2">
              <li>· 회식·동창회 2차로 일행끼리 술과 노래를 함께할 때</li>
              <li>· 접객원 없이 우리 일행끼리만 이용하고 싶을 때</li>
              <li>· 술 없이 노래만 할 계획이라면 노래연습장이 더 맞습니다 (이 서비스는 노래연습장 예약을 안내하지 않습니다)</li>
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="verify">
        <SectionHeading eyebrow="Verify" id="verify" title="단란주점인지 확인하는 방법">
          간판에 ‘노래주점’, ‘가요주점’, ‘가라오케’라고 쓰여 있어도 법적 업종은 다를 수 있습니다.
        </SectionHeading>
        <CheckList
          items={[
            "행정안전부 지방행정 인허가 데이터(LOCALDATA)의 ‘단란주점영업’에서 업소명·주소로 찾으면 허가일과 영업 상태를 볼 수 있습니다.",
            "같은 이름이 ‘유흥주점영업’이나 ‘일반음식점’으로 나오면 단란주점이 아닙니다.",
            "저희에게 문의하실 때 제휴 매장의 허가 업종을 물어보시면 확인된 내용만 답해 드립니다.",
          ]}
        />
      </section>

      <TypeInquiry type="danran" label="단란주점" />

      <section aria-labelledby="compare-link" className="card grid gap-4 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <h2 id="compare-link" className="font-semibold">
            유흥주점과 무엇이 다른지 더 알아보기
          </h2>
          <p className="mt-1 text-sm text-mute">유흥주점은 영업 범위와 요금 구조(개별소비세 등)가 다릅니다. 예약 전 확인할 점을 따로 정리했습니다.</p>
        </div>
        <Link href="/yuheung-jujeom/" className="btn-ghost">
          대구 유흥주점 안내
        </Link>
      </section>

      <section aria-labelledby="faq">
        <SectionHeading eyebrow="FAQ" id="faq" title="대구 단란주점 예약 문의 FAQ" />
        <FaqList items={FAQ} />
      </section>
    </SubPage>
  );
}
