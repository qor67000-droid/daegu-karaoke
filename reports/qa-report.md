# QA 보고서 (2026-10-31)

원본 로그는 `reports/logs/`, 결과 JSON은 `reports/*.json`, 스크린샷은 `reports/screenshots/`에 있습니다.

## 0. 요청 항목별 상태

| # | 항목 | 상태 | 근거 / 사유 |
|---|---|---|---|
| 1 | 실제 Next.js 의존성 설치 + 프로덕션 빌드 | **미완료** | 작업 환경 네트워크 정책이 `registry.npmjs.org`를 차단합니다(2026-10-31 재확인, 403 `connect_rejected`). GitHub 연결과는 무관합니다. `deploy.yml`·`lockfile.yml`이 GitHub Actions에서 실행합니다. |
| 2 | package-lock.json 생성·포함 | **미완료** | 레지스트리 없이 만든 lockfile은 무결성 해시가 거짓이 되므로 만들지 않았습니다. `lockfile.yml`(Actions)이 실제 레지스트리로 생성해 커밋합니다. |
| 3 | GitHub Actions 실행 시 문제 점검 | 정적 점검 완료 / **실행 미완료** | 액션 버전 갱신(§2), lockfile 유무에 따른 설치 분기, YAML 구문 검사 통과. 실제 실행 이력은 없습니다. |
| 4 | 빌드 후 CSS·이미지·링크·canonical·sitemap 경로 | 오프라인 렌더 출력으로 완료 | §1. 실제 `next build` 출력으로는 미확인 |
| 5 | 실제 공개 URL 기준 검증 | **미완료** | GitHub 계정이 이 세션에 연결되지 않아 배포하지 못했습니다. `verify:live`는 로컬 모의 서버에서만 62/62 통과 |
| 6 | 임시 URL과 실제 운영 URL 구분 | 완료 | §3 |
| 7 | SEO 자동 검사 실패 항목 수정 | 완료 | 실제 config 프로덕션: 오류 0 / 경고 0 / 정보 1 |
| 8 | 구글 경쟁 분석 불가 항목 미검증 유지 | 완료 | `competitors.md` 상단 "검증 상태" |

## 1. 실행한 검증 (오프라인 렌더 — 실제 app/ 소스를 React 19로 렌더링, Next 빌드 아님)

| 실행 | URL 종류 | SEO 감사 | 라우트·브라우저 |
|---|---|---|---|
| production + basePath `/daegu-karaoke` (실제 config) | 검증용 임시 URL | 오류 0, 경고 0, 정보 1² — 색인 4 / noindex 5 / 사이트맵 4 | 136/136 |
| production + basePath + 업체 정보 fixture | 검증용 임시 URL | 오류 0, 경고 0 — 색인 9 / 사이트맵 9 | 138/138 |
| preview | 로컬 | 오류 0 (경고 9 = localhost canonical, 예상된 결과) | 135/135 |
| development | 로컬 | 오류 0 (경고 27 = [미정] 표시, 예상된 결과) | 136/136 |
| guard: 실제 배포(`PAGES_DEPLOY=1`)에 테스트 URL 사용 | — | **빌드 차단** (의도한 동작) | — |
| guard: 실제 배포에 fixture 사용 | — | **빌드 차단** (의도한 동작) | — |
| 감사기 결함 주입 11종 | — | 전부 감지, exit 1 | — |
| `verify:live` 드라이런 (GitHub Pages 규칙 모의 서버) | 로컬 모의 | — | 62/62 |
| 타입 검사: scripts/lib/config | — | exit 0 | — |
| 타입 검사: TSX 구조 (최소 React 타입 셸, JSX 속성 미검증) | — | exit 0 | — |

² 정보 1 = 프로젝트 사이트의 `/repo/robots.txt`는 크롤러가 읽지 않는다는 안내입니다. 색인 제어는 meta robots로 하므로 실패 항목이 아닙니다.

실제 출력 경로 확인 (`out/guide/first-visit/index.html`):
```
canonical  https://verify-owner.github.io/daegu-karaoke/guide/first-visit/   ← 검증용 임시 URL
og:image   https://verify-owner.github.io/daegu-karaoke/og-default.png
icon       /daegu-karaoke/icon.svg
css        /daegu-karaoke/_next/static/css/app.css
```

## 2. 이번에 수정한 사항
1. **액션 버전 갱신:** checkout v6, setup-node v6, configure-pages v6, upload-pages-artifact v5, deploy-pages v5, upload-artifact v7. 이 조합으로 Pages 배포가 성공한 사례가 있습니다(HenryLach/taskplane#592, 2026-06). upload-pages-artifact v4 이상은 dotfile을 제외하지만, Actions 배포 방식은 Jekyll을 쓰지 않으므로 `.nojekyll` 누락은 문제가 되지 않습니다.
2. **설치 분기:** `package-lock.json`이 있으면 `npm ci`, 없으면 경고 후 `npm install`. 빌드 아티팩트에 생성된 lockfile을 함께 보관합니다.
3. **`lockfile.yml` 추가:** 실제 레지스트리로 lockfile을 만들고, 빌드·SEO 검사를 통과하면 main에 커밋합니다.
4. **파비콘:** `metadata.icons`에 basePath가 자동으로 붙는지 확인하지 못했습니다(붙으면 `/repo/repo/` 이중 경로 위험). Next 파일 규칙 `app/icon.svg`로 옮겼고, 감사기에 이중 경로 검사를 추가했습니다.
5. **테스트 URL 차단:** `lib/env.ts` TEST_HOSTS에 등록된 URL을 실제 배포에서 쓰면 guard가 빌드를 중단합니다. 보고서 JSON에는 `urlKind`(test / production / local)를 기록합니다.
6. **`scripts/publish-github.sh` 추가:** GitHub 연결 후 저장소 생성 → push → Pages 소스 설정 → lockfile → 배포 → 공개 URL 검증을 한 번에 실행합니다.

## 3. URL 구분
| 구분 | URL | 용도 |
|---|---|---|
| 검증용 임시 | `https://verify-owner.github.io/daegu-karaoke` | 오프라인 검증 (존재하지 않는 주소) |
| 검증용 임시 | `https://ci-check.github.io/ci-repo` | ci.yml 매트릭스 |
| 검증용 임시 | `https://daegu-karaoke-verify.kr` | 커스텀 도메인 경로 검증 |
| 로컬 모의 | `http://127.0.0.1:<port>/daegu-karaoke` | route-test, verify-live 드라이런 |
| **실제 운영** | `https://<GitHub 사용자명>.github.io/daegu-karaoke/` | **미정** — 배포 시 configure-pages가 자동 주입 |

## 4. 오프라인 검증의 한계
- Next.js 자체 출력(head 병합, `_next` 청크, 아이콘 해시 쿼리, `_not-found` 파일)은 재현하지 않습니다. 실제 결과는 Actions의 `seo`·`test:routes`·`verify:live`가 판정합니다.
- TSX의 JSX 속성 타입은 `@types/react`가 없어 검사하지 못했습니다.
