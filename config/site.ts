import type { SiteConfig } from "@/lib/types";

/**
 * ─────────────────────────────────────────────────────────────
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
