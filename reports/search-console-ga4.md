# Google Search Console · GA4 연결 가이드 (준비 완료 상태)

인증이 필요한 작업이라 실제 등록·제출은 하지 않았습니다. 아래 순서대로 하시면 됩니다.

## 1. Search Console 소유권 인증
1. 주소에 따라 속성 유형이 다릅니다.
   - **GitHub Pages 기본 주소**(`https://<user>.github.io/<repo>/`): **URL 접두어 속성**으로 `https://<user>.github.io/<repo>/`를 추가합니다. github.io 도메인은 DNS를 소유하지 않으므로 HTML 태그 방식만 가능합니다.
   - **커스텀 도메인**: 도메인 속성 + DNS TXT 레코드 방식을 권장합니다.
2. HTML 태그 방식을 쓸 경우: 발급된 `content` 값을 `config/site.ts` → `verification.google`에 넣고 재배포합니다. 그러면 `<meta name="google-site-verification">`이 자동 출력됩니다.
3. 네이버 서치어드바이저: 같은 방식으로 `verification.naver`에 넣습니다.

## 2. 사이트맵 제출
- 제출 URL: `https://{정규도메인}/sitemap.xml`
- 제출 URL 예: `https://<user>.github.io/<repo>/sitemap.xml` (URL 접두어 속성 안이라 제출 가능)
- 현재(업체 정보 미정) 사이트맵에는 정보 페이지 4개(`/`, `/guide/`, `/guide/first-visit/`, `/guide/daegu-areas/`)만 들어갑니다. 업체 정보를 입력하고 재배포하면 업체 페이지가 자동으로 추가됩니다.
- 프로젝트 사이트의 robots.txt는 크롤러가 읽지 않으므로, 사이트맵은 Search Console에서 직접 제출해야 합니다.

## 3. URL 검사 · 색인 확인 루틴
- 배포 직후: URL 검사 → "실시간 URL 테스트" → "색인 생성 요청" (홈, 주요 페이지만 수동으로)
- **Indexing API는 사용하지 않습니다**(채용공고·라이브 방송 전용 API라 일반 페이지에 쓰면 오용).
- 주간: [페이지] 보고서에서 "크롤링됨 - 현재 색인이 생성되지 않음" 증감 확인

## 4. 두 검색어 분리 추적
[실적] → 검색결과 → 필터 → 검색어 → **정확히 일치하는 검색어**
| 저장 이름 | 필터 |
|---|---|
| KW-가라오케 | `대구 가라오케` |
| KW-가라오케(붙여쓰기) | `대구가라오케` |
| KW-노래방 | `대구 노래방` |
| KW-노래방(붙여쓰기) | `대구노래방` |
- 각 필터에서 노출수·클릭수·CTR·평균 게재순위를 보고, [페이지] 탭으로 페이지별 성과를 분리합니다.
- Search Console 평균 게재순위는 **자연검색** 기준입니다. Google 지도·로컬팩 순위는 비즈니스 프로필 실적(검색어, 전화, 길찾기)에서 따로 확인합니다.
- 월 1회 CSV로 내보내 `reports/gsc/YYYY-MM.csv`로 보관하는 것을 권장합니다.

## 5. GA4
1. GA4 속성 생성 → 웹 스트림 → 측정 ID(`G-XXXX`) 발급
2. `config/site.ts`의 `ga4Id`에 입력하거나, 저장소 Settings → Secrets and variables → Actions → Variables에 `NEXT_PUBLIC_GA4_ID`를 추가하고 deploy.yml의 env에 연결합니다.
3. 프로덕션 빌드에서만 gtag가 로드됩니다.
4. 이벤트가 자동 전송됩니다(코드 구현·오프라인 테스트 완료): `click_call`, `click_kakao`, `click_sms`, `click_directions`, `click_reservation`
5. GA4 관리 → 이벤트 → 위 이벤트를 "주요 이벤트(전환)"로 표시합니다.
6. **클릭 ≠ 예약 성사.** 실제 예약 건수는 매장 장부의 "어디서 보고 오셨나요" 기록과 월별로 대조합니다.
