import { site, brand, businessReady, isProduction, reservationReady } from "@/lib/site";

/**
 * 라우트 두 종류
 *  - info     : 업체 정보와 무관하게 사실인 독립 정보 콘텐츠. 프로덕션에서 항상 색인 허용.
 *  - service  : 독립 예약 안내 서비스(운영자 연락처 기반). 운영자 연락처가 있으면 공개·색인.
 *  - business : 실제 업체 소개. 필수 업체 정보 확인 + 페이지 고유 데이터가 있을 때만 색인·내비게이션·사이트맵 포함.
 * 경로는 GitHub Pages(trailingSlash) 정규형인 끝 슬래시 형태로 고정한다.
 */
export type RouteKind = "info" | "service" | "business";

export interface RouteDef {
  path: string;
  kind: RouteKind;
  nav: string;
  title: () => string;
  description: () => string;
  h1: () => string;
  /** 페이지가 독자적으로 유용한 실제 정보를 갖고 있는지 */
  hasContent: () => boolean;
  priority: number;
}

const b = () => (brand() ? ` | ${brand()}` : "");
const area = () => [site.address.district, site.address.dong].filter(Boolean).join(" ");

export const routes: RouteDef[] = [
  /* ───────── 정보 콘텐츠 (항상 공개) ───────── */
  {
    path: "/",
    kind: "info",
    nav: "홈",
    title: () =>
      businessReady()
        ? `대구 가라오케·노래방 | ${brand()} 공식 안내`
        : "대구 가라오케·노래방 가이드 — 업종 차이·지역·요금 확인법",
    description: () =>
      businessReady()
        ? `대구 ${area()}에서 영업하는 ${site.licenseType} ${brand()} 공식 홈페이지입니다. 룸·요금·영업시간·오시는 길·예약 방법과 일반 노래방과의 차이를 안내합니다.`
        : "대구에서 가라오케나 노래방을 찾기 전에 알아둘 정보입니다. 노래연습장·단란주점·유흥주점의 차이, 동성로·수성구·동대구역 주변 교통, 처음 이용할 때 요금 확인법을 정리했습니다.",
    h1: () => (businessReady() ? `대구 가라오케·노래방, ${brand()}` : "대구 가라오케·노래방, 가기 전에 알아둘 것"),
    hasContent: () => true,
    priority: 1.0,
  },
  {
    path: "/guide/",
    kind: "info",
    nav: "노래방·가라오케 차이",
    title: () => `대구 노래방과 가라오케 차이 — 노래연습장·단란주점·유흥주점 비교${b()}`,
    description: () =>
      "“대구 노래방”을 검색하면 섞여 나오는 노래연습장, 단란주점, 유흥주점(가라오케)의 차이를 근거 법령, 주류 판매, 청소년 출입 기준으로 비교했습니다.",
    h1: () => "노래방과 가라오케, 무엇이 다른가요",
    hasContent: () => true,
    priority: 0.9,
  },
  {
    path: "/guide/first-visit/",
    kind: "info",
    nav: "처음 이용 가이드",
    title: () => `가라오케 처음 이용 가이드 — 예약·요금 확인·귀가까지${b()}`,
    description: () =>
      "가라오케를 처음 이용할 때 예약 전 확인할 것, 요금 분쟁을 막는 체크리스트, 신분증 확인, 안전한 귀가 방법을 순서대로 정리했습니다.",
    h1: () => "가라오케 처음 이용 가이드",
    hasContent: () => true,
    priority: 0.8,
  },
  {
    path: "/guide/daegu-areas/",
    kind: "info",
    nav: "대구 지역별 안내",
    title: () => `대구 가라오케·노래방 많은 지역 — 동성로·수성구·동대구역 교통 정리${b()}`,
    description: () =>
      "대구에서 노래방과 주점이 모여 있는 동성로, 수성구 범어·황금동, 동대구역, 달서구 일대의 분위기와 가까운 도시철도역, 귀가 팁을 정리했습니다.",
    h1: () => "대구 지역별 안내",
    hasContent: () => true,
    priority: 0.8,
  },

  /* ───────── 예약 안내 서비스 ───────── */
  {
    path: "/reservation/",
    kind: "service",
    nav: "예약 문의",
    title: () => "대구 가라오케·노래방 예약 문의 — 제휴 매장 연결 안내",
    description: () =>
      "날짜·시간·인원을 남기면 대구 수성구 제휴 매장의 예약 가능 여부를 확인해 연락드리는 독립 예약 안내 서비스입니다. 전화·문자·카카오톡·LINE·텔레그램으로 문의할 수 있습니다.",
    h1: () => "대구 가라오케·노래방 예약 문의",
    hasContent: () => reservationReady(),
    priority: 0.9,
  },

  /* ───────── 업체 페이지 (실제 정보 확인 후 공개) ───────── */
  {
    path: "/about/",
    kind: "business",
    nav: "업체 소개",
    title: () => `업체 소개 — 대구 ${area()} ${site.licenseType ?? "가라오케"}${b()}`,
    description: () =>
      `${brand() || "업소"}의 영업신고 업종, 위치, 특징을 소개합니다. 모든 정보는 업소가 직접 확인한 내용만 게시합니다.`,
    h1: () => `${brand() || "업체"} 소개`,
    hasContent: () => Boolean(site.name && site.licenseVerified),
    priority: 0.8,
  },
  {
    path: "/rooms/",
    kind: "business",
    nav: "룸 안내",
    title: () => `룸 안내 — 인원별 룸과 음향 시설${b()}`,
    description: () => `${brand() || "업소"}의 룸 종류와 룸별 수용 인원, 반주기·화면·마이크 등 음향 시설을 실제 매장 기준으로 안내합니다.`,
    h1: () => "룸과 시설 안내",
    hasContent: () => site.rooms.length > 0,
    priority: 0.7,
  },
  {
    path: "/price/",
    kind: "business",
    nav: "이용 요금",
    title: () => `이용 요금 안내 — 대구 가라오케${b()}`,
    description: () => `${brand() || "업소"} 이용 요금표와 기본 요금에 포함·불포함되는 항목, 연장 기준, 결제 수단을 텍스트로 투명하게 안내합니다.`,
    h1: () => "이용 요금",
    hasContent: () => site.prices.length > 0,
    priority: 0.7,
  },
  {
    path: "/location/",
    kind: "business",
    nav: "오시는 길",
    title: () => `오시는 길${area() ? ` — 대구 ${area()}` : ""}${b()}`,
    description: () =>
      `대구${area() ? ` ${area()}` : ""}에 있는 ${brand() || "업소"}의 도로명 주소, 가까운 지하철역과 출구, 주차 안내, 요일별 영업시간을 확인하세요.`,
    h1: () => "오시는 길·영업시간",
    hasContent: () => Boolean(site.address.street),
    priority: 0.7,
  },
  {
    path: "/contact/",
    kind: "business",
    nav: "예약·문의",
    title: () => `예약·문의${b()}`,
    description: () =>
      `${brand() || "업소"} 예약은 전화${site.kakaoUrl ? "·카카오톡" : ""}${site.smsNumber ? "·문자" : ""}로 가능합니다. 방문 날짜·시간·인원 등 예약할 때 알려주실 내용과 연락처를 안내합니다.`,
    h1: () => "예약·문의",
    hasContent: () => Boolean(site.phone),
    priority: 0.7,
  },
];

export const getRoute = (path: string) => {
  const r = routes.find((x) => x.path === path);
  if (!r) throw new Error(`unknown route ${path}`);
  return r;
};

/** 페이지를 실제로 공개(내비게이션 노출)할지 */
export const isPublished = (r: RouteDef) =>
  r.kind === "info" || (r.kind === "service" ? r.hasContent() : businessReady() && r.hasContent());

/** 색인 허용 = 프로덕션 + 공개 페이지 */
export const isIndexable = (r: RouteDef) => isProduction && isPublished(r);

/** 내비게이션: 공개 페이지만 (개발 모드는 전부 노출해 작업 확인) */
export const navRoutes = (dev: boolean) => routes.filter((r) => dev || isPublished(r));
