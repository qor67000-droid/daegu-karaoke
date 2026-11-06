# 다국어(글로벌) SEO — 2026-11-06

> 검색량·순위는 측정하지 않았다. 아래 검색어는 **실제 검색 결과(웹 검색 도구로 확인한 상위 결과)를 보고 고른 후보**이며, 효과는 Search Console 데이터로만 판단한다.

## 1. 공개 언어와 URL

| 언어 | hreflang | html lang | 홈 | 예약 |
|---|---|---|---|---|
| 한국어 (기존) | ko-KR · x-default | ko | `/` | `/reservation/` |
| 日本語 | ja-JP | ja | `/ja/` | `/ja/reservation/` |
| English | en | en | `/en/` | `/en/reservation/` |
| 简体中文 | zh-CN | zh-CN | `/zh-cn/` | `/zh-cn/reservation/` |
| 繁體中文（台灣） | zh-TW | zh-TW | `/zh-tw/` | `/zh-tw/reservation/` |
| 繁體中文（香港） | zh-HK | zh-HK | `/zh-hk/` | `/zh-hk/reservation/` |

- 모든 언어 페이지는 **self-canonical**. 다른 언어를 한국어 홈으로 canonical 처리하지 않는다.
- hreflang 은 HTML `<link rel="alternate">` 한 가지 방식으로만 제공 (Google 문서: 세 방식은 동등하며 함께 써도 이점 없음). 홈 묶음·예약 묶음 각각 7개(6개 언어 + x-default), 상호 참조.
- 한국어 전용 페이지(`/guide/…`)는 번역본이 없으므로 hreflang 없음. 언어 선택기에서는 그 언어의 홈으로 이동.
- 자동 리디렉션(IP·브라우저 언어) 없음. 언어 선택은 PC 상단 드롭다운, 모바일 햄버거 메뉴.
- sitemap.xml: 색인 대상 15개 URL(기존 5 + 신규 10). 기존 URL·canonical·인증 파일 변경 없음.

## 2. 구조 (새 언어 추가 방법)

- `lib/i18n/locales.ts` — 언어 레지스트리(경로·hreflang·html lang·status). **status: "published" 만 빌드·사이트맵·hreflang 에 포함.**
- `lib/i18n/types.ts` — 언어별 콘텐츠 형식. 항목이 빠지면 타입검사 실패.
- `lib/i18n/content/{locale}.ts` — 언어별 문구, `lib/i18n/form-text.ts` — 예약 폼·메시지 문구.
- `app/(ko)/` 한국어(URL 영향 없는 route group), `app/[locale]/` 외국어. 언어마다 루트 레이아웃이 달라 `<html lang>` 이 페이지별로 정확함.
- 새 언어: 레지스트리에 `draft` 로 추가 → 콘텐츠·폼 문구 작성 → 원어민 검수 → `published` 로 변경 → `npm run seo` 통과 확인.

## 3. 자동 검사 (npm run seo / test:routes / verify:live)

- 페이지별 html lang = 레지스트리 값
- self-canonical, og:url = canonical
- hreflang 집합 = 기대값, 자기 참조·x-default 포함, **상호 참조(되돌림 링크)**, 대상 페이지 canonical·index 여부
- 번역 누락: 외국어 본문 한글 비율 > 8% 이면 오류, 콘텐츠 구조가 기준(en)과 다르거나 빈 문구면 오류, zh-tw/zh-hk 가 글자 그대로 같으면 오류
- 언어별 "예약 완료/접수" 허위 표시 문구 금지
- 제휴 매장 주소 옆 "운영자 사업장 아님" 고지(언어별)
- 브라우저: 언어별 폼 문구, `?type=` 사전 선택, 문자 본문(선택 언어 + 한국어 병기), LINE '복사 후 열기'(자동 전송 아님), 모바일·PC 언어 전환
- 의도적 변조 테스트(lang 변경, hreflang 되돌림 제거, canonical 을 한국어 홈으로, 본문 한국어로)로 검사가 실제로 오류를 잡는 것을 확인함

## 4. 언어별 검색 의도와 표현 선택

공통 문제: 외국어에서 "karaoke / カラオケ / KTV / 卡拉OK" 는 대부분 **노래연습장(노래방)** 을 뜻한다. 그래서 모든 언어 페이지에 "노래방·코인노래방은 예약하지 않는다" 블록을 두고, 업종명은 한국 법정 명칭을 그대로 쓰되 설명을 붙였다.

| 언어 | 검색 결과에서 본 것 | 선택한 표현 | 피한 것 |
|---|---|---|---|
| en | 상위 결과는 노래방 체험기, 외국인 바 포럼, 야간 생활 가이드. 노래방을 "karaoke"로 부르는 글이 대부분이고, 일부 가이드는 접객원이 있는 업소를 따로 경고함 | "Daegu karaoke bar", "yuheung jujeom / danran jujeom" + 설명, "Not a noraebang" | "Daegu karaoke"만 단독으로 쓰는 것(노래방 의도와 혼동) |
| ja | "大邱 カラオケ" 상위는 관광·맛집 가이드 위주, 업종 구분 정보는 거의 없음 | 「大邱カラオケ」+「遊興酒店（ユフンジュジョム）・団欒酒店（タンランジュジョム）」, ノレバン 구분 | 「キャバクラ」 등 일본 업종명으로 옮기는 것(법적 범위가 다름) |
| zh-CN | "大邱 KTV/练歌房" 결과는 노래방 소개(코인노래방 포함)가 중심. KTV·卡拉OK·练歌房이 같은 뜻으로 쓰임 | 「大邱卡拉OK预订咨询」, 「游兴酒店·团栾酒店」, "这里的酒店不是住宿酒店" 명시 | 제목에 "KTV" 사용(노래방 의도 유입) |
| zh-TW | 대만 여행 매체는 "練歌房", "投幣KTV" 표현. 대만에서 KTV = 노래방형 | 「預約諮詢」「簡訊」「計程車」, 「台灣常說的KTV」 = 練歌房 설명 | 간체 → 번체 글자 변환만 한 문장 |
| zh-HK | 홍콩은 "唱K/K房" 표현(위키 Karaoke box 항목) | 「預約查詢」「短訊」「的士」「營業牌照」「K房」, 한국 법 기준 19세 명시 | 대만식 어휘(簡訊·計程車) 그대로 사용 |

조사 후보 검색어(검증된 검색량 아님): `Daegu karaoke`, `Daegu karaoke reservation`, `karaoke in Daegu`, `大邱 カラオケ`, `大邱 カラオケ 予約`, `大邱 卡拉OK`, `大邱 KTV`, `大邱 卡拉OK 预订 / 預約`.

## 5. 시장별 검색엔진 환경 (StatCounter, 2026년 6~9월 표시값)

| 시장 | Google | 그 밖의 엔진 | 시사점 |
|---|---|---|---|
| 일본 | 약 59% | Bing 약 31~33%, Yahoo! 약 6~8% | Bing 비중이 큼 → Bing Webmaster Tools 등록 권장(Search Console 가져오기 가능). Yahoo! Japan 검색은 Google 기술 기반으로 알려져 있음 |
| 대만 | 약 79~82% | Yahoo! 약 10~12%, Bing 약 7~8% | Google 우선 |
| 홍콩 | 약 90~91% | Yahoo!·Bing 각 3~4%, Baidu 0.3% | Google 우선 |
| 중국 본토 | (Google 차단) | Baidu 약 47~51%, Bing 약 22%, Haosou·Yandex·Sogou | 별도 대응 필요 (아래) |
| 미국 | 조회 실패(StatCounter 페이지를 가져오지 못함) | — | 확인 못 함. Google 우선으로 가정하되 수치는 미확인 |

### 중국 본토(Baidu) 조건 — 조사 결과, 등록하지 않음
- Baidu 웹마스터 플랫폼(ziyuan.baidu.com)에서 사이트 인증 후 사이트맵·링크 제출 가능. 표준 XML 사이트맵 지원. 계정·인증은 사이트 소유자가 직접 해야 함.
- 해외 호스팅은 ICP 비안(备案) 없이도 색인될 수 있지만 크롤링 빈도가 낮고 느리다는 것이 업계 자료의 공통 설명. ICP는 중국 본토 서버 호스팅에 필요하며 중국 법인이 필요.
- GitHub Pages(github.io)는 본토에서 접속이 불안정할 수 있어 Baidu 노출 기대치는 낮게 잡아야 함.
- 이 서비스의 업종(유흥주점) 특성상 Baidu 정책상 노출 제한 가능성도 있음 — 확인되지 않았으며 주장하지 않음.
- **어느 검색엔진에도 자동 등록하지 않았다.** Search Console 외 등록은 사용자 작업.

## 6. 성과 구분 추적

- Search Console(기존 URL-prefix 속성 `https://qor67000-droid.github.io/daegu-karaoke/`): 실적 → 페이지 필터 "URL 포함"
  - 한국어: `/daegu-karaoke/ja/` 등 외국어 접두사를 **제외** 필터로 보거나, `/daegu-karaoke/`(홈)·`/reservation/` 정확히 일치
  - 외국어: `/daegu-karaoke/ja/`, `/en/`, `/zh-cn/`, `/zh-tw/`, `/zh-hk/` 각각 "URL 포함"
  - 국가 필터와 함께 보면 언어 × 국가 교차 확인 가능
- GA4: 클릭 이벤트에 `page_language`(html lang) 파라미터 추가 → 맞춤 측정기준 등록 후 언어별 전환 클릭 비교 (클릭 ≠ 예약 성사)
- 새 URL 색인 요청: Search Console URL 검사에서 언어별 홈 5개만 수동 요청 권장(남용 금지)

## 7. 미확인·후속 과제

- 번역은 초기 작성 + 용어 검토까지. **원어민 검수는 하지 않았다** — 일본어·중국어(3종)·영어 원어민 검토를 권장.
- 외국어 응대 가능 여부 미확인 → 모든 언어 페이지에 "해당 언어 회신 보장 안 함" 명시.
- 제휴 매장 업종·가격·영업시간 미확인 → "확인 중" 유지, 번역에도 가격·시간 없음.
- 미국 검색엔진 점유율 수치 미확인.
