import Link from "next/link";
import { buildMetadata, faqLd } from "@/lib/seo";
import { SubPage } from "@/components/subpage";
import { FaqList } from "@/components/sections";
import { JsonLd, SectionHeading } from "@/components/ui";
import { CheckList, TypeInquiry } from "@/components/type-inquiry";

export const metadata = buildMetadata("/yuheung-jujeom/");

/**
 * 대구 유흥주점 예약 문의 — 검색 의도: "대구에서 유흥주점을 예약하고 싶다 / 정식 허가 업소인지 알고 싶다".
 * 근거: 식품위생법 시행령 제21조 제8호 라목·제22조·제23조, 개별소비세법 제1조 제4항, 청소년보호법.
 * 제휴 매장의 허가 업종·가격·영업시간은 확인 전이므로 쓰지 않는다.
 */
const MODIFIED = "2026-11-07";

const FAQ = [
  {
    q: "대구 유흥주점 예약은 어떻게 문의하나요?",
    a: "이 페이지의 문의 작성기에서 날짜·시간·인원을 고른 뒤 문자·카카오톡·LINE·텔레그램으로 보내거나 전화하시면 됩니다. 운영자가 제휴 매장의 허가 업종과 예약 가능 여부를 확인해 연락드리고, 안내 내용에 동의하셔야 예약이 확정됩니다.",
  },
  {
    q: "견적(요금)을 미리 알 수 있나요?",
    a: "이 사이트에는 확인되지 않은 요금을 싣지 않습니다. 문의하시면 매장에 확인한 요금 기준을 알려드리며, 개별소비세·봉사료 포함 여부와 연장 기준까지 함께 확인하시길 권합니다.",
  },
  {
    q: "간판에 ‘룸’, ‘가라오케’, ‘노래클럽’이라고 쓰여 있으면 유흥주점인가요?",
    a: "간판 이름만으로는 알 수 없습니다. 법적 업종은 구청이 내준 영업허가로 정해지며, 같은 이름이라도 유흥주점·단란주점·일반음식점 등 업종이 다를 수 있습니다.",
  },
  {
    q: "인터넷 광고에서 본 ‘1등 업소’, ‘후기 많은 곳’을 예약해 줄 수 있나요?",
    a: "다른 업소를 대신 예약하지 않으며, 순위나 후기를 근거로 추천하지도 않습니다. 이 서비스는 제휴 매장의 예약 문의만 연결합니다.",
  },
  {
    q: "만 19세가 안 된 일행이 있으면요?",
    a: "유흥주점은 청소년보호법상 청소년유해업소라 만 19세 미만은 보호자와 함께여도 들어갈 수 없습니다. 예약 문의도 만 19세 이상 일행에 한해 받습니다.",
  },
];

export default function Page() {
  return (
    <SubPage
      path="/yuheung-jujeom/"
      modified={MODIFIED}
      lead={
        <>
          대구에서 유흥주점 이용을 위해 예약 문의를 하려는 분을 위한 안내입니다. 이 사이트는 독립적으로 운영하는 <strong className="text-ivory">예약 문의 연결 서비스</strong>
          로, 운영자가 제휴 매장에 예약 가능 여부를 확인해 연락드립니다. 제휴 매장은 운영자의 직영점이 아니며, 확인되지 않은 요금·영업시간·매장 정보는 싣지
          않습니다.
        </>
      }
    >
      <JsonLd data={faqLd(FAQ)} />

      <section aria-labelledby="what">
        <SectionHeading eyebrow="Legal scope" id="what" title="유흥주점은 법적으로 어떤 업종인가요" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card p-6 text-sm text-mute">
            <h3 className="font-semibold text-ivory">영업 범위 (식품위생법 시행령 제21조 제8호 라목)</h3>
            <p className="mt-2">
              주로 주류를 조리·판매하는 영업으로, <strong className="text-ivory">유흥종사자를 두거나 유흥시설을 설치할 수 있고</strong> 손님이 노래를 부르거나
              춤을 추는 행위가 허용됩니다.
            </p>
            <p className="mt-2">
              시행령 제22조에서 유흥종사자는 손님과 함께 술을 마시거나 노래·춤으로 흥을 돋우는 유흥접객원을, 유흥시설은 춤을 출 수 있게 설치한 무도장을
              말합니다. 단란주점에는 이 두 가지가 허용되지 않습니다.
            </p>
          </div>
          <div className="card p-6 text-sm text-mute">
            <h3 className="font-semibold text-ivory">허가 업종 · 청소년 출입 금지</h3>
            <p className="mt-2">
              유흥주점은 신고만으로 열 수 있는 일반음식점과 달리 <strong className="text-ivory">구청장의 영업허가</strong>를 받아야 하는 업종입니다(시행령
              제23조). 허가 업소인지는 공공 인허가 데이터로 확인할 수 있습니다(아래 ‘업종 확인 방법’).
            </p>
            <p className="mt-2">청소년보호법상 청소년유해업소로, 만 19세 미만은 출입과 고용이 모두 금지됩니다.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="service">
        <SectionHeading eyebrow="What we do" id="service" title="예약 문의로 실제 확인해 드리는 것" />
        <div className="grid gap-4 lg:grid-cols-2">
          <CheckList
            items={[
              "제휴 매장이 유흥주점으로 허가된 곳인지 (확인되지 않으면 그렇다고 알려드립니다)",
              "원하시는 날짜·도착 시간·인원으로 이용 가능한지",
              "요금 기준 — 기본 요금에 포함되는 것, 연장 기준, 세금·봉사료 포함 여부",
              "결제 수단 (카드 결제·현금영수증 가능 여부)",
            ]}
          />
          <div className="card p-6 text-sm text-mute">
            <h3 className="font-semibold text-ivory">하지 않는 것</h3>
            <ul className="mt-3 space-y-2">
              <li>· 제휴 매장 외 다른 업소 예약·소개</li>
              <li>· 확인되지 않은 가격·순위·후기 게시</li>
              <li>· 사이트에서 결제·예약금 수령, 예약 자동 확정</li>
              <li>· 법이 허용하지 않는 서비스 안내</li>
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="before">
        <SectionHeading eyebrow="Checklist" id="before" title="유흥주점 예약 전에 꼭 확인할 점">
          유흥주점은 다른 술집과 요금 구조가 달라 안내받은 금액에 무엇이 들어 있는지 확인하는 것이 가장 중요합니다.
        </SectionHeading>
        <CheckList
          items={[
            <>
              <strong className="text-ivory">개별소비세 포함 여부</strong> — 유흥주점은 개별소비세법상 과세유흥장소로, 유흥음식요금의 10%가 개별소비세로
              부과됩니다. 안내받은 금액이 세금 포함인지 물어보세요.
            </>,
            <>
              <strong className="text-ivory">봉사료가 따로 붙는지</strong>, 붙는다면 영수증에 구분해 적히는지.
            </>,
            <>
              <strong className="text-ivory">기본 이용 시간과 연장 요금</strong> — 몇 시간 기준인지, 연장은 어떤 단위로 계산되는지.
            </>,
            <>
              <strong className="text-ivory">인원 변동</strong> — 도착 인원이 달라질 때 요금이나 룸이 바뀌는지.
            </>,
            <>
              <strong className="text-ivory">결제와 영수증</strong> — 카드 결제 가능 여부, 영수증 발급. 계산 전 내역을 확인하고 영수증은 보관하세요.
            </>,
          ]}
        />
      </section>

      <section aria-labelledby="verify">
        <SectionHeading eyebrow="Verify" id="verify" title="업종 확인 방법 — 간판 이름은 업종이 아닙니다">
          ‘룸’, ‘가라오케’, ‘노래주점’, ‘노래클럽’ 같은 이름은 법정 업종명이 아닙니다. 검색 광고에서 ‘정식 허가’라고 해도 직접 확인할 수 있습니다.
        </SectionHeading>
        <ol className="grid gap-4 sm:grid-cols-3">
          {[
            ["공공 인허가 데이터 조회", "행정안전부 지방행정 인허가 데이터(LOCALDATA)의 ‘유흥주점영업’에서 업소명·주소로 찾으면 허가일과 영업 상태(영업·폐업)를 볼 수 있습니다."],
            ["업종 이름 대조", "조회된 업종이 ‘유흥주점영업’인지 ‘단란주점영업’인지 확인하세요. 같은 간판이라도 결과가 다를 수 있습니다."],
            ["예약 문의 때 질문", "저희에게 문의하실 때도 제휴 매장의 허가 업종을 물어보시면 확인된 내용만 답해 드립니다."],
          ].map(([t, d], i) => (
            <li key={t} className="card p-5">
              <span className="h-display text-2xl text-gold/80">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-mute">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-mute">
          대구 구별로 어떤 상권에 주점이 모여 있는지는{" "}
          <Link href="/guide/daegu-areas/" className="text-gold-2 underline-offset-4 hover:underline">
            대구 지역별 안내
          </Link>
          에 정리했습니다.
        </p>
      </section>

      <TypeInquiry type="yuheung" label="유흥주점" />

      <section aria-labelledby="compare-link" className="card grid gap-4 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <h2 id="compare-link" className="font-semibold">
            접객원 없이 일행끼리 노래와 술을 즐길 계획이라면
          </h2>
          <p className="mt-1 text-sm text-mute">유흥종사자를 둘 수 없는 단란주점이 맞을 수 있습니다. 두 업종의 차이와 단란주점 시설기준을 확인해 보세요.</p>
        </div>
        <Link href="/danran-jujeom/" className="btn-ghost">
          대구 단란주점 안내
        </Link>
      </section>

      <section aria-labelledby="faq">
        <SectionHeading eyebrow="FAQ" id="faq" title="대구 유흥주점 예약 문의 FAQ" />
        <FaqList items={FAQ} />
      </section>
    </SubPage>
  );
}
