import type { LocaleKey } from "@/lib/i18n/locales";

/**
 * 예약 문의 작성기 문구 (클라이언트 번들에 포함되므로 폼에 필요한 문구만 둔다).
 * ko 는 기존 /reservation/ 화면 문구와 동일해야 한다 (기존 기능·테스트 보존).
 * 외국어 메시지는 운영자가 읽을 수 있도록 "현지어 / 한국어" 병기로 만든다.
 */
export type Method = "sms" | "kakao" | "line" | "telegram" | "call";
export type VenueTypeKey = "yuheung" | "danran" | "any";

export interface FormText {
  /** 메시지에 표기할 언어명 (한국어 병기용) */
  languageName: string;
  typeLegend: string;
  typeLabels: Record<VenueTypeKey, string>;
  typeHelp: string;
  date: string;
  quickDates: string;
  today: string;
  tomorrow: string;
  saturday: string;
  days: string[];
  time: string;
  timePlaceholder: string;
  people: string;
  peoplePlaceholder: string;
  peopleUnit: (n: number) => string;
  peopleMax: string;
  note: string;
  noteOptional: string;
  notePlaceholder: string;
  adult: string;
  methodLegend: string;
  methods: Record<Method, string>;
  errDate: string;
  errDateFuture: string;
  errTime: string;
  errPeople: string;
  errAdult: string;
  preview: string;
  submitSms: string;
  submitCall: (phone: string) => string;
  submitMessenger: (name: string) => string;
  copy: string;
  callNote: string;
  copied: (target: string) => string;
  messengerWord: string;
  copyFail: string;
  notice: [string, string, string, string, string];
  /** 메시지 라벨 (현지어) */
  msg: { language: string; type: string; date: string; time: string; people: string; note: string; none: string; method: string; closing: string };
}

const KO_MSG = { language: "언어", type: "희망 업종", date: "날짜", time: "시간", people: "인원", note: "요청사항", none: "없음", method: "희망 연락 방식", closing: "예약 가능 여부 확인 후 연락 부탁드립니다." };
export const KO_TYPE: Record<VenueTypeKey, string> = { yuheung: "유흥주점", danran: "단란주점", any: "상담 후 결정" };
export const KO_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export const FORM_TEXT: Record<LocaleKey, FormText> = {
  ko: {
    languageName: "한국어",
    typeLegend: "희망 업종",
    typeLabels: KO_TYPE,
    typeHelp: "유흥주점과 단란주점은 영업 범위가 다른 업종입니다. 선택하신 업종으로 영업신고된 제휴 매장이 있는지 확인해 안내하며, 잘 모르시면 ‘상담 후 결정’을 선택하세요.",
    date: "방문 날짜",
    quickDates: "빠른 날짜 선택",
    today: "오늘",
    tomorrow: "내일",
    saturday: "토요일",
    days: KO_DAYS,
    time: "방문 시간",
    timePlaceholder: "시간 선택",
    people: "인원",
    peoplePlaceholder: "인원 선택",
    peopleUnit: (n) => `${n}명`,
    peopleMax: "16명 이상",
    note: "요청사항",
    noteOptional: "(선택, 300자 이내)",
    notePlaceholder: "예: 룸 크기, 도착 예정 시간 변동 가능성 등",
    adult: "방문 인원 모두 만 19세 이상입니다.",
    methodLegend: "연락 방식",
    methods: { sms: "문자", kakao: "카카오톡", line: "LINE", telegram: "텔레그램", call: "전화" },
    errDate: "방문 날짜를 선택하세요.",
    errDateFuture: "오늘 이후 날짜를 선택하세요.",
    errTime: "방문 시간을 선택하세요.",
    errPeople: "인원을 선택하세요.",
    errAdult: "만 19세 이상만 문의할 수 있습니다.",
    preview: "보낼 문의 내용 미리보기",
    submitSms: "문자 앱에서 예약 문의 보내기",
    submitCall: (p) => `전화로 예약 문의 (${p})`,
    submitMessenger: (n) => `내용 복사 후 ${n} 열기`,
    copy: "문의 내용 복사",
    callNote: "통화 연결 후 위 미리보기의 날짜·시간·인원·요청사항을 말씀해 주세요.",
    copied: (t) => `문의 내용을 복사했습니다. ${t} 대화창에 붙여넣어 보내 주세요.`,
    messengerWord: "메신저",
    copyFail: "자동 복사가 되지 않았습니다. 미리보기 내용을 길게 눌러 직접 복사해 주세요.",
    notice: [
      "이 화면은 입력 내용을 저장하거나 전송하지 않습니다. 버튼을 누르면 문자 앱·메신저·전화가 열리며, ",
      "직접 전송하거나 통화하셔야 문의가 전달",
      "됩니다. 예약은 운영자가 제휴 매장의 예약 가능 여부를 확인한 뒤 연락드려 ",
      "고객님과 확인 후 확정",
      "됩니다.",
    ],
    msg: KO_MSG,
  },
  en: {
    languageName: "English",
    typeLegend: "Venue type",
    typeLabels: { yuheung: "Yuheung jujeom", danran: "Danran jujeom", any: "Not sure — please advise" },
    typeHelp: "Yuheung jujeom and danran jujeom are different licence types. We check whether a partner venue is registered under the type you choose. If you're not sure, choose “Not sure”.",
    date: "Date",
    quickDates: "Quick date",
    today: "Today",
    tomorrow: "Tomorrow",
    saturday: "Sat",
    days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    time: "Arrival time",
    timePlaceholder: "Select time",
    people: "Guests",
    peoplePlaceholder: "Select",
    peopleUnit: (n) => `${n} ${n === 1 ? "person" : "people"}`,
    peopleMax: "16 or more",
    note: "Requests",
    noteOptional: "(optional, up to 300 characters)",
    notePlaceholder: "e.g. room size, arrival time may change",
    adult: "Everyone in my group is 19 or older.",
    methodLegend: "Send via",
    methods: { sms: "SMS", kakao: "KakaoTalk", line: "LINE", telegram: "Telegram", call: "Phone" },
    errDate: "Please choose a date.",
    errDateFuture: "Please choose today or a later date.",
    errTime: "Please choose a time.",
    errPeople: "Please choose the number of guests.",
    errAdult: "Only adults aged 19 or older can make an inquiry.",
    preview: "Message preview",
    submitSms: "Open SMS with this inquiry",
    submitCall: (p) => `Call to inquire (${p})`,
    submitMessenger: (n) => `Copy message & open ${n}`,
    copy: "Copy message",
    callNote: "Once connected, please tell us the date, time, group size and requests shown in the preview.",
    copied: (t) => `Message copied. Paste it into the ${t} chat and press send.`,
    messengerWord: "messenger",
    copyFail: "Copying didn't work. Press and hold the preview to copy it yourself.",
    notice: [
      "This page doesn't save or send anything. The button only opens your SMS app, messenger or phone — ",
      "your inquiry reaches us only when you send it or call",
      ". The operator checks availability with the partner venue and replies, and the reservation is ",
      "confirmed only after you agree",
      ".",
    ],
    msg: { language: "Language", type: "Venue type", date: "Date", time: "Time", people: "Guests", note: "Requests", none: "None", method: "Reply via", closing: "Please let me know if a reservation is available." },
  },
  ja: {
    languageName: "日本語",
    typeLegend: "希望の業種",
    typeLabels: { yuheung: "遊興酒店", danran: "団欒酒店", any: "相談して決めたい" },
    typeHelp: "遊興酒店と団欒酒店は営業範囲が異なる業種です。選んだ業種で届け出ている提携店舗があるか確認してご案内します。わからない場合は「相談して決めたい」を選んでください。",
    date: "ご来店日",
    quickDates: "日付をすばやく選択",
    today: "今日",
    tomorrow: "明日",
    saturday: "土曜",
    days: ["日", "月", "火", "水", "木", "金", "土"],
    time: "ご来店時間",
    timePlaceholder: "時間を選択",
    people: "人数",
    peoplePlaceholder: "人数を選択",
    peopleUnit: (n) => `${n}名`,
    peopleMax: "16名以上",
    note: "ご要望",
    noteOptional: "（任意・300文字以内）",
    notePlaceholder: "例：部屋の広さ、到着時間が変わるかもしれない など",
    adult: "来店する全員が19歳以上です。",
    methodLegend: "連絡方法",
    methods: { sms: "SMS", kakao: "カカオトーク", line: "LINE", telegram: "テレグラム", call: "電話" },
    errDate: "ご来店日を選択してください。",
    errDateFuture: "今日以降の日付を選択してください。",
    errTime: "ご来店時間を選択してください。",
    errPeople: "人数を選択してください。",
    errAdult: "19歳以上の方のみお問い合わせいただけます。",
    preview: "送信内容のプレビュー",
    submitSms: "SMSアプリで問い合わせを送る",
    submitCall: (p) => `電話で問い合わせる（${p}）`,
    submitMessenger: (n) => `内容をコピーして${n}を開く`,
    copy: "問い合わせ内容をコピー",
    callNote: "電話がつながったら、プレビューの日付・時間・人数・ご要望をお伝えください。",
    copied: (t) => `問い合わせ内容をコピーしました。${t}のトーク画面に貼り付けて送信してください。`,
    messengerWord: "メッセンジャー",
    copyFail: "自動コピーができませんでした。プレビューを長押ししてコピーしてください。",
    notice: [
      "この画面は入力内容を保存・送信しません。ボタンを押すとSMSアプリ・メッセンジャー・電話が開きます。",
      "ご自身で送信または通話して初めて問い合わせが届きます",
      "。運営者が提携店舗の空き状況を確認してご連絡し、",
      "お客様の同意をもって予約が確定",
      "します。",
    ],
    msg: { language: "言語", type: "希望の業種", date: "日付", time: "時間", people: "人数", note: "ご要望", none: "なし", method: "希望の連絡方法", closing: "予約できるか確認のうえご連絡ください。" },
  },
  "zh-cn": {
    languageName: "简体中文",
    typeLegend: "希望业态",
    typeLabels: { yuheung: "游兴酒店", danran: "团栾酒店", any: "咨询后再决定" },
    typeHelp: "游兴酒店和团栾酒店是营业范围不同的业态。我们会确认是否有以您所选业态登记的合作门店。如果不确定，请选择“咨询后再决定”。",
    date: "到店日期",
    quickDates: "快速选择日期",
    today: "今天",
    tomorrow: "明天",
    saturday: "周六",
    days: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
    time: "到店时间",
    timePlaceholder: "选择时间",
    people: "人数",
    peoplePlaceholder: "选择人数",
    peopleUnit: (n) => `${n}人`,
    peopleMax: "16人以上",
    note: "其他要求",
    noteOptional: "（选填，300字以内）",
    notePlaceholder: "例如：包厢大小、到店时间可能变动等",
    adult: "同行所有人都已满19岁。",
    methodLegend: "联系方式",
    methods: { sms: "短信", kakao: "KakaoTalk", line: "LINE", telegram: "Telegram", call: "电话" },
    errDate: "请选择到店日期。",
    errDateFuture: "请选择今天或之后的日期。",
    errTime: "请选择到店时间。",
    errPeople: "请选择人数。",
    errAdult: "仅限年满19岁的成人咨询。",
    preview: "发送内容预览",
    submitSms: "用短信应用发送咨询",
    submitCall: (p) => `电话咨询（${p}）`,
    submitMessenger: (n) => `复制内容并打开${n}`,
    copy: "复制咨询内容",
    callNote: "电话接通后，请告知预览中的日期、时间、人数和其他要求。",
    copied: (t) => `已复制咨询内容。请粘贴到${t}聊天窗口后发送。`,
    messengerWord: "聊天应用",
    copyFail: "无法自动复制。请长按预览内容手动复制。",
    notice: [
      "本页面不会保存或发送任何内容。点击按钮只会打开短信、聊天应用或电话，",
      "需要您本人发送或通话，咨询才会送达",
      "。运营者向合作门店确认是否可预订后会联系您，",
      "经您同意后预订才成立",
      "。",
    ],
    msg: { language: "语言", type: "希望业态", date: "日期", time: "时间", people: "人数", note: "其他要求", none: "无", method: "希望联系方式", closing: "请确认能否预订后联系我，谢谢。" },
  },
  "zh-tw": {
    languageName: "繁體中文（台灣）",
    typeLegend: "想去的業態",
    typeLabels: { yuheung: "遊興酒店", danran: "團欒酒店", any: "諮詢後再決定" },
    typeHelp: "遊興酒店和團欒酒店是營業範圍不同的業態。我們會確認是否有以您選擇的業態登記的合作店家。不確定的話，請選「諮詢後再決定」。",
    date: "到店日期",
    quickDates: "快速選擇日期",
    today: "今天",
    tomorrow: "明天",
    saturday: "週六",
    days: ["週日", "週一", "週二", "週三", "週四", "週五", "週六"],
    time: "到店時間",
    timePlaceholder: "選擇時間",
    people: "人數",
    peoplePlaceholder: "選擇人數",
    peopleUnit: (n) => `${n}位`,
    peopleMax: "16位以上",
    note: "其他需求",
    noteOptional: "（選填，300字以內）",
    notePlaceholder: "例如：包廂大小、到店時間可能會變動等",
    adult: "同行的人都已滿19歲。",
    methodLegend: "聯絡方式",
    methods: { sms: "簡訊", kakao: "KakaoTalk", line: "LINE", telegram: "Telegram", call: "電話" },
    errDate: "請選擇到店日期。",
    errDateFuture: "請選擇今天或之後的日期。",
    errTime: "請選擇到店時間。",
    errPeople: "請選擇人數。",
    errAdult: "僅限年滿19歲的成人諮詢。",
    preview: "傳送內容預覽",
    submitSms: "用簡訊App傳送諮詢",
    submitCall: (p) => `打電話諮詢（${p}）`,
    submitMessenger: (n) => `複製內容並開啟${n}`,
    copy: "複製諮詢內容",
    callNote: "電話接通後，請說明預覽中的日期、時間、人數和其他需求。",
    copied: (t) => `已複製諮詢內容。請貼到${t}聊天視窗後傳送。`,
    messengerWord: "通訊軟體",
    copyFail: "無法自動複製。請長按預覽內容自行複製。",
    notice: [
      "這個頁面不會儲存或傳送任何內容。按下按鈕只會打開簡訊、通訊軟體或電話，",
      "要由您自己傳送或通話，諮詢才會送達",
      "。經營者向合作店家確認能否預約後會聯絡您，",
      "經您同意後預約才成立",
      "。",
    ],
    msg: { language: "語言", type: "想去的業態", date: "日期", time: "時間", people: "人數", note: "其他需求", none: "無", method: "希望聯絡方式", closing: "麻煩確認能否預約後再聯絡我，謝謝。" },
  },
  "zh-hk": {
    languageName: "繁體中文（香港）",
    typeLegend: "想去的業態",
    typeLabels: { yuheung: "遊興酒店", danran: "團欒酒店", any: "查詢後再決定" },
    typeHelp: "遊興酒店與團欒酒店是營業範圍不同的業態。我們會確認有否以您所選業態登記的合作店舖。如不確定，請選「查詢後再決定」。",
    date: "到訪日期",
    quickDates: "快速選擇日期",
    today: "今日",
    tomorrow: "明日",
    saturday: "星期六",
    days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    time: "到訪時間",
    timePlaceholder: "選擇時間",
    people: "人數",
    peoplePlaceholder: "選擇人數",
    peopleUnit: (n) => `${n}位`,
    peopleMax: "16位或以上",
    note: "其他要求",
    noteOptional: "（選填，300字以內）",
    notePlaceholder: "例如：房間大小、到達時間或有變動等",
    adult: "同行各人均已年滿19歲。",
    methodLegend: "聯絡方法",
    methods: { sms: "短訊", kakao: "KakaoTalk", line: "LINE", telegram: "Telegram", call: "致電" },
    errDate: "請選擇到訪日期。",
    errDateFuture: "請選擇今日或之後的日期。",
    errTime: "請選擇到訪時間。",
    errPeople: "請選擇人數。",
    errAdult: "只限年滿19歲的成人查詢。",
    preview: "發送內容預覽",
    submitSms: "以短訊App發送查詢",
    submitCall: (p) => `致電查詢（${p}）`,
    submitMessenger: (n) => `複製內容並開啟${n}`,
    copy: "複製查詢內容",
    callNote: "接通電話後，請說明預覽中的日期、時間、人數及其他要求。",
    copied: (t) => `已複製查詢內容。請貼上至${t}對話視窗後發送。`,
    messengerWord: "通訊App",
    copyFail: "未能自動複製。請長按預覽內容自行複製。",
    notice: [
      "此頁面不會儲存或發送任何內容。按下按鈕只會開啟短訊、通訊App或電話，",
      "須由您親自發送或致電，查詢才會送達",
      "。營運者向合作店舖確認可否預約後會聯絡您，",
      "經您同意後預約才確立",
      "。",
    ],
    msg: { language: "語言", type: "想去的業態", date: "日期", time: "時間", people: "人數", note: "其他要求", none: "沒有", method: "希望聯絡方法", closing: "請確認可否預約後聯絡我，謝謝。" },
  },
};

/**
 * 문의 메시지 생성.
 * ko: 기존 형식 그대로. 그 외: "현지어 / 한국어" 병기 + 선택 언어 표시 → 운영자가 정확히 읽을 수 있다.
 */
export function buildInquiry(
  locale: LocaleKey,
  v: { venueType?: VenueTypeKey; date: string; time: string; people: string; note: string; method?: Method },
): string {
  const t = FORM_TEXT[locale];
  const d = v.date ? new Date(`${v.date}T00:00:00`) : null;
  const okDate = d && !Number.isNaN(d.getTime());
  const type = v.venueType ?? "any";
  if (locale === "ko") {
    return [
      "[대구 가라오케 예약 문의]",
      `희망 업종: ${KO_TYPE[type]}`,
      `날짜: ${okDate ? `${v.date} (${KO_DAYS[d!.getDay()]})` : v.date}`,
      `시간: ${v.time}`,
      `인원: ${v.people}`,
      `요청사항: ${v.note.trim() || "없음"}`,
      ...(v.method ? [`희망 연락 방식: ${FORM_TEXT.ko.methods[v.method]}`] : []),
      "예약 가능 여부 확인 후 연락 부탁드립니다.",
    ].join("\n");
  }
  const m = t.msg;
  const k = KO_MSG;
  const pair = (local: string, ko: string) => (local === ko ? local : `${local} / ${ko}`);
  const peopleKo = (() => {
    if (v.people === t.peopleMax) return "16명 이상";
    const n = Number.parseInt(v.people, 10);
    return Number.isFinite(n) ? `${n}명` : v.people;
  })();
  return [
    `[대구 가라오케 예약 문의 · ${t.languageName}]`,
    `${m.language} / ${k.language}: ${t.languageName}`,
    `${m.type} / ${k.type}: ${pair(t.typeLabels[type], KO_TYPE[type])}`,
    `${m.date} / ${k.date}: ${okDate ? `${v.date} (${pair(t.days[d!.getDay()]!, KO_DAYS[d!.getDay()]!)})` : v.date}`,
    `${m.time} / ${k.time}: ${v.time}`,
    `${m.people} / ${k.people}: ${pair(v.people, peopleKo)}`,
    `${m.note} / ${k.note}: ${v.note.trim() || `${m.none} / ${k.none}`}`,
    ...(v.method ? [`${m.method} / ${k.method}: ${pair(t.methods[v.method], FORM_TEXT.ko.methods[v.method])}`] : []),
    m.closing,
    k.closing,
  ].join("\n");
}
