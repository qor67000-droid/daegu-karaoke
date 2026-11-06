import type { LocaleContent } from "@/lib/i18n/types";

/**
 * English — written for visitors to Korea, not a word-for-word translation.
 * "Karaoke" in English usually means a noraebang (singing room). This page says clearly that we only handle
 * licensed bars (yuheung jujeom / danran jujeom) and not noraebang.
 */
export const en: LocaleContent = {
  meta: {
    siteName: "Daegu Karaoke",
    homeTitle: "Daegu Karaoke Bar Reservations | Yuheung & Danran Jujeom",
    homeDescription:
      "Reservation inquiries for licensed karaoke bars in Daegu, Korea — yuheung and danran jujeom, 19+ only. Send your date and group size; we check availability.",
    rsvTitle: "Reservation Inquiry Form | Daegu Karaoke",
    rsvDescription:
      "Pick the venue type, date, time and group size, then send the inquiry by SMS, KakaoTalk, LINE, Telegram or phone. We check with our Daegu partner venue.",
  },
  ui: {
    skipToContent: "Skip to content",
    menuOpen: "Open menu",
    mainMenu: "Main menu",
    mobileMenu: "Mobile menu",
    language: "Language",
    home: "Home",
    reservation: "Reservation",
    bar: { reserve: "Reserve", call: "Call", kakao: "KakaoTalk", label: "Quick contact" },
    footerAbout:
      "An independently run service that passes reservation inquiries for yuheung jujeom and danran jujeom in Daegu to partner venues. Partner venues are not owned or run by the operator. We do not take reservations for noraebang or coin karaoke rooms.",
    legalNotice:
      "Yuheung jujeom and danran jujeom are adults-only venues under Korea's Youth Protection Act. Anyone under 19 may not enter, and venues may ask for ID such as a passport.",
    drinkNotice: "Drunk driving is illegal in Korea. Please use a designated driver service, a taxi or public transport.",
    copyright: "Venue details such as prices and opening hours are set by each venue and may change. Please confirm before you visit.",
  },
  home: {
    eyebrow: "Daegu Karaoke · Reservation Inquiry",
    h1: ["Daegu karaoke bar", "reservation inquiries"],
    lead: [
      "We help you make reservation inquiries for licensed karaoke bars in Daegu — yuheung jujeom and danran jujeom. Tell us your date, time and group size, and we will check availability and get back to you.",
      "This is an independent service. The partner venue is not owned by the operator. We do not handle noraebang or coin karaoke rooms.",
    ],
    cta: "Make an inquiry",
    quickLabel: "Quick contact",
    quick: { call: "Call", sms: "SMS", kakao: "KakaoTalk" },
    typesLabel: "Inquire by venue type",
    typeShort: { yuheung: "Singing and dancing allowed", danran: "Singing allowed" },
    reservationTitle: "How reservation inquiries work",
    reservationBody:
      "Send us the venue type you want, your date, arrival time and group size. The operator checks with the partner venue and replies to you. The partner venue sets its own prices and rules. A reservation is only confirmed after you have read and agreed to the details we send you.",
    reservationSteps: [
      ["Send", "Send the venue type, date, time and group size by phone, SMS, KakaoTalk, LINE or Telegram."],
      ["Check", "The operator checks the partner venue's licence type, availability and prices."],
      ["Reply", "We reply through the contact method you used."],
      ["Confirm", "The reservation is confirmed only when you agree to the details."],
    ],
    reservationCta: "Open the inquiry form",
    typesTitle: "Two types of licensed karaoke bar",
    typesIntro:
      "Korean law treats these as two different businesses with different rules. Tell us which one you want and we only check venues registered under that type.",
    nameNoteTitle: "“Karaoke” is not a legal category",
    nameNote:
      "In Korea, signs may say “karaoke” (가라오케) or “norae jujeom” (노래주점), but neither is a legal business type. A place called “karaoke” can be registered as either a yuheung jujeom or a danran jujeom, so the actual type is whatever its business licence says.",
    noraebangTitle: "Looking for a noraebang or coin karaoke?",
    noraebang:
      "Most English guides use “karaoke” for noraebang — singing rooms rented by the hour, where no alcohol is sold. That is a different business under a different law, and this service does not book them. You can usually just walk in, or find one on a map app.",
    compareTitle: "Yuheung jujeom, danran jujeom and noraebang compared",
    compareIntro:
      "Based on Korea's Food Sanitation Act Enforcement Decree and the Music Industry Promotion Act. Check the licence for the actual business type of a venue.",
    compareHead: { type: "Type", law: "Law", alcohol: "Alcohol", staff: "Staff / facilities", sing: "Singing / dancing", youth: "Under 19" },
    contactTitle: "How to contact us",
    contactIntro:
      "You can reach the operator by phone, SMS, KakaoTalk, LINE or Telegram. If you use the inquiry form, it writes the message for you in English and Korean, so the details are clear on both sides.",
    languageNote:
      "Replies in English are not guaranteed. The operator works in Korean, so short messages and the form's bilingual template work best.",
    intlPhone: "Calling from a non-Korean number: {intl}",
    tipsTitle: "Before you go",
    tips: [
      "Ask what the base price includes, how extra time is charged, and whether cards are accepted, before you confirm.",
      "Bring your passport. Venues may check that everyone in your group is 19 or older.",
      "Keep your receipt. For help with tourist problems, call the Korea Travel Hotline at 1330. In an emergency, call 112 (police).",
      "Don't drive after drinking. Taxis and designated drivers (daeri unjeon) are easy to find in Daegu.",
    ],
    faqTitle: "Frequently asked questions",
  },
  types: {
    yuheung: {
      name: "Yuheung jujeom",
      korean: "유흥주점",
      law: "Food Sanitation Act (Enforcement Decree, Art. 21-8-d)",
      alcohol: "Mainly prepares and sells alcohol",
      staff: "May employ hostesses (yuheung jongsaja) or install a dance floor",
      sing: "Guests may sing and dance",
      youth: "No entry or employment under 19",
      points: [
        "A bar mainly serving alcohol that may employ hostesses (yuheung jongsaja) or have a dance floor.",
        "Guests are allowed to sing and to dance.",
        "When you ask, we check that the venue is registered as a yuheung jujeom, and confirm available times and how prices work.",
      ],
      cta: "Inquire: yuheung jujeom",
    },
    danran: {
      name: "Danran jujeom",
      korean: "단란주점",
      law: "Food Sanitation Act (Enforcement Decree, Art. 21-8-c)",
      alcohol: "Mainly prepares and sells alcohol",
      staff: "May not employ hostesses",
      sing: "Guests may sing (dancing is not included)",
      youth: "No entry or employment under 19",
      points: [
        "A bar mainly serving alcohol where guests are allowed to sing.",
        "Hostesses cannot be employed, so it is for your own group to drink and sing together.",
        "When you ask, we check that the venue is registered as a danran jujeom, and confirm available times and how prices work.",
      ],
      cta: "Inquire: danran jujeom",
    },
    noraebang: {
      name: "Noraebang (singing room, coin karaoke)",
      korean: "노래연습장",
      law: "Music Industry Promotion Act",
      alcohol: "May not sell or serve alcohol",
      staff: "May not employ or arrange hostesses",
      sing: "Rooms for singing",
      youth: "Minors allowed in rooms meeting youth standards (time limits)",
    },
  },
  faq: [
    {
      q: "What does this service do?",
      a: "We take reservation inquiries for yuheung jujeom and danran jujeom in Daegu and pass them to a partner venue. We do not run the venue ourselves, and the partner venue is not owned by the operator.",
    },
    {
      q: "What is the difference between a yuheung jujeom and a danran jujeom?",
      a: "Both mainly sell alcohol under Korea's Food Sanitation Act. At a danran jujeom guests may sing, but hostesses cannot be employed. A yuheung jujeom may employ hostesses or have a dance floor, and guests may sing and dance.",
    },
    {
      q: "Is this the same as a noraebang?",
      a: "No. A noraebang (including coin karaoke) is a singing room under a different law and cannot sell alcohol. We do not take reservations for noraebang.",
    },
    {
      q: "When is my reservation confirmed?",
      a: "Only after the operator has checked with the partner venue, replied to you, and you have agreed to the details. Nothing on this website confirms a reservation automatically.",
    },
    {
      q: "Can I get a reply in English?",
      a: "We cannot guarantee it. The operator works in Korean. The inquiry form writes your message in both English and Korean so the key details are clear.",
    },
    {
      q: "Can people under 19 come along?",
      a: "No. Both venue types are adults-only under the Youth Protection Act, so nobody under 19 can enter, even with a guardian.",
    },
  ],
  rsv: {
    h1: "Reservation inquiry — Daegu karaoke bars",
    lead:
      "Choose the venue type, date, time and group size. The form writes an inquiry message in English and Korean, and you send it yourself. The operator then checks availability with the partner venue in Suseong-gu, Daegu, and replies to you. The partner venue is not owned by the operator.",
    formTitle: "Write your inquiry",
    directTitle: "Or contact us directly",
    stepsTitle: "What happens next",
    steps: [
      { title: "You send the inquiry", body: "Pick the details below and send them by SMS or messenger. Pressing a button only opens the app — you still have to press send." },
      { title: "We check", body: "The operator checks the partner venue's licence type, availability for your date, time and group size, and prices." },
      { title: "We reply", body: "We reply through the contact method you used. Check the price and any conditions at this point." },
      { title: "You confirm", body: "The reservation is only confirmed once you agree to the details. This website never confirms anything automatically." },
    ],
    partnerTitle: "Partner venue location",
    partnerIntro: "This is where the partner venue is. It is not the operator's business address.",
    partnerAddress: "Address",
    partnerAddressLocal: "117 Dongdaegu-ro, Suseong-gu, Daegu",
    partnerLicense: "Licence type",
    partnerLicensePending: "Being verified — shown once we have checked the business licence",
    partnerInfo: "Venue name, opening hours, prices and photos will be added once confirmed. Ask us and we will tell you what has been confirmed.",
    partnerDisclaimer: "The partner venue is not owned or run by the operator, and this is not the operator's address.",
    map: "View on Kakao Map",
    faqTitle: "Questions about inquiries",
    faq: [
      {
        q: "Does the messenger button send my inquiry automatically?",
        a: "No. KakaoTalk, LINE and Telegram links cannot pre-fill a message. The button copies your inquiry and opens the chat — paste it and press send yourself.",
      },
      {
        q: "Is anything I type saved on this website?",
        a: "No. The message is created on your own device. It only reaches the operator when you send it yourself.",
      },
      {
        q: "Do I pay anything on this website?",
        a: "No. There is no payment or deposit on this website.",
      },
    ],
  },
};
