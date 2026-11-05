import { site, brand, businessReady, formatDays, formatHours, fullAddress } from "@/lib/site";
import type { FaqItem } from "@/lib/types";

/**
 * 업체 정보와 무관하게 항상 사실인 안내 문구.
 * 법령 관련 문구는 reports/compliance.md 의 전문가 검토 대상이다.
 */

export const LEGAL_NOTICE_GENERAL =
  "유흥주점·단란주점은 청소년보호법에 따른 청소년유해업소로, 만 19세 미만 청소년의 출입과 고용이 금지됩니다. 입장 시 신분증을 확인할 수 있습니다.";
export const LEGAL_NOTICE_BUSINESS =
  "본 업소는 청소년보호법에 따른 청소년유해업소로, 만 19세 미만 청소년의 출입과 고용을 금지합니다. 입장 시 신분증을 확인할 수 있습니다.";
/** 업체 정보가 확인된 경우에만 "본 업소" 문구를 쓴다 */
export const legalNotice = () => (businessReady() ? LEGAL_NOTICE_BUSINESS : LEGAL_NOTICE_GENERAL);

export const DRINK_NOTICE = "음주 후 운전은 법으로 금지되어 있습니다. 대리운전이나 대중교통을 이용해 주세요.";

/** 업종 비교 — '대구 노래방' 검색자의 혼동을 줄이기 위한 핵심 정보 */
export const VENUE_TYPES = [
  {
    type: "노래연습장 (일반 노래방·코인노래방)",
    law: "음악산업진흥에 관한 법률",
    alcohol: "주류 판매·제공 불가",
    staff: "접객원 고용 불가",
    youth: "청소년실이 있으면 청소년 이용 가능 (시간 제한 있음)",
    fit: "친구·가족과 가볍게 노래만 부를 때",
  },
  {
    type: "단란주점",
    law: "식품위생법",
    alcohol: "주류 판매 가능",
    staff: "유흥종사자 고용 불가",
    youth: "청소년 출입·고용 금지",
    fit: "일행끼리 술과 노래를 함께 즐길 때",
  },
  {
    type: "유흥주점 (가라오케·룸 가라오케)",
    law: "식품위생법",
    alcohol: "주류 판매 가능",
    staff: "법령 범위 안에서 유흥종사자 둘 수 있음",
    youth: "청소년 출입·고용 금지",
    fit: "룸에서 주류·노래와 함께 모임·접대를 할 때",
  },
] as const;

export const VISIT_STEPS = [
  { title: "문의·예약", body: "방문 날짜, 시간, 인원을 업소에 전화나 메시지로 알리고 이용 가능한 룸을 확인합니다." },
  { title: "요금 확인", body: "인원과 이용 방식에 맞는 요금을 미리 안내받으세요. 안내받은 요금과 다른 추가 비용이 있는지도 확인하세요." },
  { title: "방문·신분 확인", body: "유흥주점·단란주점은 청소년유해업소라 입장 시 신분증을 확인할 수 있습니다." },
  { title: "이용·결제", body: "이용 후 결제 수단과 영수증 발행 여부를 확인하세요." },
];

/** 업체와 무관하게 항상 참인 일반 FAQ (정보 모드 홈·가이드에서 사용) */
export const GENERAL_FAQ: FaqItem[] = [
  {
    q: "일반 노래방(노래연습장)과 가라오케는 무엇이 다른가요?",
    a: "노래연습장은 음악산업진흥에 관한 법률에 따른 업종으로 주류를 팔 수 없고, 청소년실이 있으면 청소년도 이용할 수 있습니다. 가라오케는 보통 식품위생법상 유흥주점이나 단란주점으로 영업하며 주류를 판매하고, 만 19세 미만은 출입할 수 없습니다.",
  },
  {
    q: "미성년자도 가라오케에 들어갈 수 있나요?",
    a: "아니요. 유흥주점과 단란주점은 청소년보호법상 청소년 출입·고용 금지업소이므로 만 19세 미만은 보호자와 함께여도 입장할 수 없습니다.",
  },
  {
    q: "가라오케 요금은 어떻게 정해지나요?",
    a: "업소마다 다르지만 대체로 기본 요금, 추가 주문, 연장 요금으로 나뉩니다. 예약할 때 기본 요금에 포함되는 항목과 연장 기준, 카드 결제 가능 여부를 미리 확인하세요.",
  },
  {
    q: "요금 문제로 다툼이 생기면 어떻게 하나요?",
    a: "영수증과 주문 내역을 근거로 업소와 먼저 확인하세요. 해결되지 않으면 1372 소비자상담센터에 상담할 수 있고, 폭행·협박 같은 위급 상황은 112에 신고하세요.",
  },
];

/** 업체 FAQ: 실제 업체 정보가 확인된 경우에만 생성 */
export function businessFaq(): FaqItem[] {
  if (!businessReady()) return [];
  const items: FaqItem[] = [
    {
      q: `${brand()}는 일반 노래방과 무엇이 다른가요?`,
      a: `${brand()}는 ${site.licenseType}으로 영업하며, 룸에서 주류와 함께 노래를 즐기는 곳입니다. 만 19세 이상만 입장할 수 있습니다.`,
    },
  ];
  if (site.hours.length)
    items.push({
      q: "영업시간은 어떻게 되나요?",
      a: site.hours.map((h) => `${formatDays(h.days)} ${formatHours(h)}`).join(", ") + (site.closedNote ? `. ${site.closedNote}` : "") + ".",
    });
  const addr = fullAddress();
  if (addr) items.push({ q: "위치가 어디인가요?", a: `${addr}에 있습니다.${site.nearby.length ? ` ${site.nearby.join(", ")}.` : ""}` });
  if (site.parking) items.push({ q: "주차가 가능한가요?", a: site.parking });
  if (site.payment.length) items.push({ q: "어떤 결제 수단을 쓸 수 있나요?", a: `${site.payment.join(", ")} 결제가 가능합니다.` });
  if (site.phone)
    items.push({
      q: "예약은 어떻게 하나요?",
      a: `전화(${site.phone})${site.kakaoUrl ? ", 카카오톡" : ""}${site.smsNumber ? ", 문자" : ""}로 날짜·시간·인원을 알려주시면 안내해 드립니다.`,
    });
  return [...items, ...site.faq];
}

/** 예약 안내 서비스 FAQ (운영자 연락처가 있을 때 홈에 함께 노출) — 운영 방식에 관한 사실만 */
export const SERVICE_FAQ: FaqItem[] = [
  {
    q: "이 사이트는 어떤 서비스인가요?",
    a: "대구 가라오케 예약 문의를 받아 제휴 매장과 연결해 드리는 독립 예약 안내 서비스입니다. 매장을 직접 운영하지 않으며, 제휴 매장은 운영자의 직영점이 아닙니다.",
  },
  {
    q: "예약은 어떻게 확정되나요?",
    a: "날짜·시간·인원을 보내 주시면 운영자가 제휴 매장에 예약 가능 여부와 요금을 확인해 연락드립니다. 안내 내용을 고객님이 확인하고 동의하신 뒤에 예약이 확정되며, 사이트에서 자동으로 확정되지 않습니다.",
  },
  {
    q: "예약 문의는 어떤 방법으로 하나요?",
    a: "전화, 문자, 카카오톡, LINE, 텔레그램으로 문의할 수 있습니다. 예약 문의 페이지에서 날짜·시간·인원을 고르면 보낼 내용이 자동으로 만들어집니다.",
  },
  {
    q: "사이트에서 결제하거나 개인정보를 입력하나요?",
    a: "아니요. 이 사이트에서는 결제나 예약금을 받지 않고, 입력한 예약 내용을 저장하지도 않습니다. 문의는 고객님이 직접 보내는 문자·메신저·전화로만 전달됩니다.",
  },
];
