/** 사업장 정보 스키마. 실제 값은 config/site.ts 한 곳에서만 입력한다. */

export type DayCode = "Mo" | "Tu" | "We" | "Th" | "Fr" | "Sa" | "Su";

export interface OpeningHours {
  days: DayCode[];
  /** "19:00" 형식 */
  opens: string;
  /** "05:00" 형식. opens보다 이르면 다음 날 새벽으로 해석 */
  closes: string;
}

export interface Room {
  name: string;
  /** 예: "4~6인" */
  capacity: string;
  count?: number;
  /** 실제 확인된 시설만. 예: "TJ 반주기", "85인치 화면" */
  equipment: string[];
  description?: string;
  /** public/images 아래 원본 파일명(확장자 제외). 실제 사진만 */
  photo?: string;
  photoAlt?: string;
}

export interface PriceItem {
  label: string;
  /** 표시 문자열 그대로. 예: "150,000원" */
  price: string;
  /** 포함 항목 / 조건 */
  note?: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface Photo {
  /** public/images/<file>.{avif,webp,jpg} */
  file: string;
  alt: string;
  width: number;
  height: number;
}

export interface SiteConfig {
  /** 간판 상호 */
  name: string | null;
  nameEn: string | null;
  /** 영업신고증상 업종 */
  licenseType: "유흥주점" | "단란주점" | null;
  /** 영업신고증으로 업종을 확인했으면 true */
  licenseVerified: boolean;
  /** 사업자 표시용 (선택) */
  businessRegistrationNo: string | null;
  representative: string | null;

  /**
   * 커스텀 도메인. "https://example.kr" 형식, 끝 슬래시 없음.
   * 값이 있으면 out/CNAME 이 생성되고 canonical 기준이 된다.
   * null 이면 GitHub Pages 기본 주소(https://<user>.github.io/<repo>)를 사용한다.
   */
  domain: string | null;

  phone: string | null;
  smsNumber: string | null;
  kakaoUrl: string | null;
  /** 실제로 동작하는 온라인 예약 경로가 있을 때만 */
  reservationUrl: string | null;

  address: {
    region: "대구광역시";
    district: string | null; // 예: "수성구"
    dong: string | null; // 예: "황금동" (실제 소재 동 1곳)
    street: string | null; // 도로명 주소 (구 제외)
    detail: string | null; // 건물명/층
    postalCode: string | null;
  };
  geo: { lat: number; lng: number } | null;
  /** 실제 길찾기 링크 (네이버/카카오/구글 지도 공유 URL) */
  mapUrl: string | null;
  /** 실제로 걸어서 갈 수 있는 지하철역·랜드마크 */
  nearby: string[];
  parking: string | null;

  hours: OpeningHours[];
  closedNote: string | null;

  features: string[];
  rooms: Room[];
  prices: PriceItem[];
  priceNotes: string[];
  payment: string[];
  /** 업소 고유 FAQ (실제 답변만) */
  faq: FaqItem[];
  photos: Photo[];
  heroPhoto: Photo | null;

  verification: { google: string | null; naver: string | null };
  ga4Id: string | null;
}
