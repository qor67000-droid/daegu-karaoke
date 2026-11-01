import type { OperatorConfig, PartnerVenue, SiteConfig } from "@/lib/types";

/**
 * ─────────────────────────────────────────────────────────────
 *  [운영 구조] 이 사이트는 독립 예약 안내 서비스입니다.
 *   - operator : 사이트 운영자(예약 문의 접수) 연락처
 *   - partners : 예약을 연결하는 제휴 매장 (운영자 사업장 아님, 확인된 정보만)
 *   - site     : 업체 소개 페이지용(직영 업체 정보). 직영 업체가 없으므로 비워 둡니다.
 *
 *  사업장 정보는 이 파일 한 곳에서만 관리합니다.
 *  메타데이터, JSON-LD, 사이트맵, robots, 리디렉션, 화면 표시가 모두 여기를 읽습니다.
 *
 *  규칙
 *  - 확인되지 않은 값은 null 또는 빈 배열로 둡니다. 추측 값을 넣지 마세요.
 *  - null 항목은 개발 서버(npm run dev)에서만 "[미정]" 표시가 보입니다.
 *  - 업체 필수 항목(상호·업종 확인·전화·주소·영업시간)이 모두 채워지기 전에는
 *    업체 페이지(/about/ /rooms/ /price/ /location/ /contact/)가 noindex + 사이트맵 제외 상태로 유지되고,
 *    홈은 업체를 소개하지 않는 "정보 가이드" 모드로 공개됩니다.
 * ─────────────────────────────────────────────────────────────
 */
export const site: SiteConfig = {
  // ── 업체 ──────────────────────────────
  name: null, // 예: "OOO 가라오케"
  nameEn: null,
  licenseType: "유흥주점", // 작업 지시서 기준. 영업신고증으로 확인 후 licenseVerified를 true로
  licenseVerified: false,
  businessRegistrationNo: null,
  representative: null,

  // ── 도메인 ────────────────────────────
  // 커스텀 도메인을 GitHub Pages에 연결했을 때만 입력. 비워 두면 https://<user>.github.io/<repo> 사용
  domain: null, // 예: "https://daegu-example.kr"

  // ── 연락 · 예약 ───────────────────────
  phone: null, // 예: "053-123-4567"
  smsNumber: null, // 문자 받을 휴대폰 번호
  kakaoUrl: null, // 카카오톡 채널/오픈채팅 실제 URL
  reservationUrl: null, // 실제 동작하는 예약 페이지가 있을 때만

  // ── 위치 ──────────────────────────────
  address: {
    region: "대구광역시",
    district: null,
    dong: null,
    street: null,
    detail: null,
    postalCode: null,
  },
  geo: null, // { lat: 35.86, lng: 128.62 }
  mapUrl: null,
  nearby: [],
  parking: null,

  // ── 영업시간 ──────────────────────────
  hours: [], // [{ days: ["Mo","Tu","We","Th","Fr","Sa","Su"], opens: "19:00", closes: "05:00" }]
  closedNote: null,

  // ── 콘텐츠 (검증된 사실만) ─────────────
  features: [],
  rooms: [],
  prices: [],
  priceNotes: [],
  payment: [],
  faq: [],
  photos: [],
  heroPhoto: null,

  // ── 검색 · 분석 (연결 준비) ────────────
  verification: {
    google: null, // Search Console HTML 태그의 content 값
    naver: null, // 네이버 서치어드바이저 content 값
  },
  ga4Id: null, // "G-XXXXXXX" — 환경변수 NEXT_PUBLIC_GA4_ID가 있으면 그것이 우선
};

/** 예약 안내 서비스 운영자 연락처 (사용자 제공, 2026-11-01) */
export const operator: OperatorConfig = {
  serviceName: "대구 가라오케·노래방 예약 안내",
  phone: "010-2464-6135",
  smsNumber: "01024646135",
  kakaoUrl: "https://open.kakao.com/o/s3KS17Ui",
  lineUrl: "https://line.me/ti/p/8DDtc6maE9",
  telegramUrl: "https://t.me/+821024646135",
};

/**
 * 현재 예약 연결 가능한 제휴 매장.
 * 주소만 확인됨. 매장명·인허가 업종·영업시간·가격·사진은 확인 후 입력 (그 전에는 화면에 공개되지 않음).
 */
export const partners: PartnerVenue[] = [
  {
    address: "대구광역시 수성구 동대구로 117",
    mapQuery: "대구광역시 수성구 동대구로 117",
    name: null,
    licenseType: null,
    licenseVerified: false,
    hours: null,
    priceNote: null,
    photos: [],
  },
];
