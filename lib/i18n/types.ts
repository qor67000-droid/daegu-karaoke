import type { FaqItem } from "@/lib/types";

/**
 * 언어별 페이지 콘텐츠 형식.
 * 모든 언어가 같은 형식을 채워야 타입검사를 통과한다 (번역 누락 = 빌드 실패).
 * 법적 영업 범위·연락 방식·제휴 매장 정보는 한국어 원문과 같은 사실만 담는다. 가격·영업시간·외국어 응대는 확인 전까지 쓰지 않는다.
 */
export interface VenueTypeText {
  /** 이 언어에서 쓰는 이름 (예: Yuheung jujeom) */
  name: string;
  /** 한국어 법정 명칭 병기 */
  korean: string;
  /** 법령 근거 */
  law: string;
  /** 비교표 행 */
  alcohol: string;
  staff: string;
  sing: string;
  youth: string;
  /** 업종 카드 설명 */
  points: string[];
  /** 예약 문의 버튼 */
  cta: string;
}

export interface LocaleContent {
  meta: {
    siteName: string;
    homeTitle: string;
    homeDescription: string;
    rsvTitle: string;
    rsvDescription: string;
  };
  ui: {
    skipToContent: string;
    menuOpen: string;
    mainMenu: string;
    mobileMenu: string;
    language: string;
    home: string;
    reservation: string;
    bar: { reserve: string; call: string; kakao: string; label: string };
    footerAbout: string;
    legalNotice: string;
    drinkNotice: string;
    copyright: string;
  };
  home: {
    eyebrow: string;
    h1: [string, string];
    lead: string[];
    cta: string;
    quickLabel: string;
    quick: { call: string; sms: string; kakao: string };
    typesLabel: string;
    typeShort: { yuheung: string; danran: string };
    reservationTitle: string;
    reservationBody: string;
    reservationSteps: [string, string][];
    reservationCta: string;
    typesTitle: string;
    typesIntro: string;
    nameNoteTitle: string;
    nameNote: string;
    noraebangTitle: string;
    noraebang: string;
    compareTitle: string;
    compareIntro: string;
    compareHead: { type: string; law: string; alcohol: string; staff: string; sing: string; youth: string };
    contactTitle: string;
    contactIntro: string;
    languageNote: string;
    intlPhone: string;
    tipsTitle: string;
    tips: string[];
    faqTitle: string;
  };
  types: { yuheung: VenueTypeText; danran: VenueTypeText; noraebang: Omit<VenueTypeText, "points" | "cta"> };
  faq: FaqItem[];
  rsv: {
    h1: string;
    lead: string;
    formTitle: string;
    directTitle: string;
    stepsTitle: string;
    steps: { title: string; body: string }[];
    partnerTitle: string;
    partnerIntro: string;
    partnerAddress: string;
    /** 제휴 매장 주소의 현지어 표기 (한국어 원문과 함께 표시) */
    partnerAddressLocal: string;
    partnerLicense: string;
    partnerLicensePending: string;
    partnerInfo: string;
    partnerDisclaimer: string;
    map: string;
    faqTitle: string;
    faq: FaqItem[];
  };
}
