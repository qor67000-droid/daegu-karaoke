import type { SiteConfig } from "@/lib/types";

/**
 * 테스트 전용 가상 데이터. 실제 업체가 아님.
 * SITE_CONFIG_FIXTURE=1 일 때만 사용되며, GitHub Pages 배포 job(PAGES_DEPLOY=1)에서는 guard가 차단한다.
 * 목적: "모든 정보가 채워진 상태"의 레이아웃·JSON-LD·사이트맵 경로를 검증하기 위함.
 */
export const fixtureSite: SiteConfig = {
  name: "테스트용 가라오케",
  nameEn: "Fixture Karaoke",
  licenseType: "유흥주점",
  licenseVerified: true,
  businessRegistrationNo: "000-00-00000",
  representative: "테스트",
  domain: null, // basePath(프로젝트 사이트) 경로 검증을 위해 커스텀 도메인 없음
  phone: "053-000-0001",
  smsNumber: "010-0000-0001",
  kakaoUrl: "https://pf.kakao.com/_fixture-test",
  reservationUrl: null,
  address: {
    region: "대구광역시",
    district: "테스트구",
    dong: "테스트동",
    street: "테스트로 1",
    detail: "테스트빌딩 1층",
    postalCode: "00000",
  },
  geo: { lat: 35.8714, lng: 128.6014 },
  mapUrl: "https://map.kakao.com/?q=fixture-test",
  nearby: ["테스트역 1번 출구 도보 3분"],
  parking: "건물 내 주차 2시간 (테스트 문구)",
  hours: [{ days: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"], opens: "19:00", closes: "05:00" }],
  closedNote: "명절 당일 휴무 (테스트 문구)",
  features: ["테스트 특징 A", "테스트 특징 B", "테스트 특징 C"],
  rooms: [
    { name: "테스트 소형룸", capacity: "2~4인", count: 3, equipment: ["반주기 A", "화면 B"] },
    { name: "테스트 중형룸", capacity: "5~8인", count: 4, equipment: ["반주기 A", "무선마이크 4"] },
    { name: "테스트 대형룸", capacity: "10~15인", count: 1, equipment: ["반주기 A", "대형 화면"] },
  ],
  prices: [
    { label: "테스트 기본", price: "000,000원", note: "테스트 조건" },
    { label: "테스트 세트", price: "000,000원" },
  ],
  priceNotes: ["테스트 안내 문구"],
  payment: ["카드", "현금"],
  faq: [{ q: "테스트 질문?", a: "테스트 답변입니다." }],
  photos: [],
  heroPhoto: null,
  verification: { google: "fixture-google", naver: "fixture-naver" },
  ga4Id: null,
};
