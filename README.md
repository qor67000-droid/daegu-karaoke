# 대구 가라오케·노래방 사이트

Next.js 16 (App Router, 정적 export) · TypeScript · Tailwind CSS 4 · **GitHub Pages**

## GitHub 연결 후 한 번에 배포
```bash
gh auth login
bash scripts/publish-github.sh <사용자명> daegu-karaoke public
```
저장소 생성 → push → Pages 소스(GitHub Actions) 설정 → `lockfile.yml`(package-lock.json 생성) → `deploy.yml` → 공개 URL 검증 순서로 실행합니다.
GitHub Free 계정은 **public 저장소에서만 Pages**를 쓸 수 있습니다(private + Pages는 Pro/Team 이상).

## GitHub Pages 배포 (수동으로 할 때)
1. 이 폴더를 GitHub 저장소로 push합니다(기본 브랜치 `main`).
2. 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 바꿉니다.
3. `main`에 push하면 `.github/workflows/deploy.yml`이 다음 순서로 실행됩니다.
   - `npm install` → `typecheck` → `build`(guard → `next build` → `.nojekyll`/CNAME) → `seo` → `test:routes`
   - Pages 배포
   - `verify:live`: 공개 URL의 페이지·CSS·이미지·내부 링크·sitemap·robots·canonical 검사
   - 하나라도 실패하면 job이 빨간색이 됩니다.
4. 공개 주소는 `https://<사용자명>.github.io/<저장소명>/`입니다. basePath는 Actions가 자동으로 넣으므로 코드를 고칠 필요가 없습니다.

### 커스텀 도메인을 쓸 때
1. Settings → Pages → Custom domain에 도메인을 입력하고 DNS를 설정한 뒤 **Enforce HTTPS**를 켭니다.
2. `config/site.ts`에 `domain: "https://도메인"`을 넣고 push합니다.
3. 빌드가 `out/CNAME`을 만들고 canonical·sitemap·robots가 새 도메인으로 바뀝니다. 커스텀 도메인과 basePath가 동시에 잡히면 guard가 빌드를 중단합니다.

## 로컬 개발
```bash
npm install
npm run dev                       # http://localhost:3000 — 미정 정보는 [미정: …] 표시
npm run check                     # typecheck + build + seo + test:routes
# GitHub Pages 프로젝트 사이트와 같은 조건으로 확인:
SITE_ENV=production SITE_URL=https://me.github.io/repo NEXT_PUBLIC_BASE_PATH=/repo npm run check
```

## 공개 정책: 정보 콘텐츠 vs 업체 페이지
| 종류 | 페이지 | 지금(업체 정보 미정) | 업체 정보 입력 후 |
|---|---|---|---|
| 정보 | `/`, `/guide/`, `/guide/first-visit/`, `/guide/daegu-areas/` | **색인·사이트맵 포함.** 홈은 특정 업체를 소개하지 않는 가이드 | 홈이 공식 업체 안내로 전환 |
| 업체 | `/about/`, `/rooms/`, `/price/`, `/location/`, `/contact/` | **noindex**, 사이트맵·메뉴 제외, 본문 대신 "공개 준비 중" | 데이터가 있는 페이지부터 색인·메뉴 노출 |

- 업체 필수 정보: 상호, 영업신고 업종 + `licenseVerified: true`, 대표 전화, 구, 도로명 주소, 영업시간
- 이 값들은 `config/site.ts` 한 파일에서만 관리합니다. 허위·추측 값을 넣지 마세요.
- `PR`과 로컬 빌드는 `SITE_ENV=preview`로 전 페이지 noindex 처리됩니다.

## 실제 사진 넣기
```bash
mkdir photos && cp ~/매장사진/*.jpg photos/
npm run images       # public/images/에 AVIF·WebP·JPG 생성 (경로는 basePath 자동 적용)
```

## 스크립트
| 명령 | 내용 |
|---|---|
| `npm run build` | guard(설정 검증) → `next build` → `.nojekyll`·CNAME 생성 |
| `npm run seo` | 출력 HTML 기준 SEO 감사: 색인/noindex 기대값, sitemap, robots, canonical, basePath 경로, 링크·CSS·이미지, JSON-LD, 임시 문구, 허위 최상급 표현 |
| `npm run test:routes` | GitHub Pages 규칙 모의 서버(basePath, 끝 슬래시 301, 404.html)로 응답 코드·모바일·CSS·클릭 이벤트 검사 |
| `npm run verify:live -- <URL>` | 배포된 공개 URL 검사 |
| `npm run verify:offline` | Next.js를 설치할 수 없는 환경용 대체 검증 (`tools/offline/`) |

## 문서
`reports/` 폴더: 경쟁 분석, 키워드 전략, 준법·호스팅 제약, Search Console·GA4 연결, QA 보고서
