#!/usr/bin/env bash
# GitHub 계정 연결 이후에 실행하는 배포 준비 스크립트 (GitHub CLI 'gh' 로그인 필요)
#   사용: bash scripts/publish-github.sh <사용자명> <저장소명> [public|private]
# 하는 일:
#   1) 저장소 생성 + 현재 폴더 push (main)
#   2) Pages 소스를 "GitHub Actions"로 설정
#   3) lockfile.yml 실행 → package-lock.json 생성·커밋
#   4) deploy.yml 실행 → next build / seo / test:routes / 배포 / verify:live
#   5) 실제 운영 URL 출력
# 참고: GitHub Free 계정은 public 저장소에서만 Pages를 쓸 수 있습니다.
set -euo pipefail
OWNER=${1:?사용자명 필요}; REPO=${2:?저장소명 필요}; VIS=${3:-public}
cd "$(dirname "$0")/.."
gh auth status >/dev/null

if [ ! -d .git ]; then git init -q -b main; fi
git add -A
git -c user.name="${GIT_AUTHOR_NAME:-$OWNER}" -c user.email="${GIT_AUTHOR_EMAIL:-$OWNER@users.noreply.github.com}" commit -qm "Daegu karaoke site (GitHub Pages)" || true
git branch -M main
if ! gh repo view "$OWNER/$REPO" >/dev/null 2>&1; then
  gh repo create "$OWNER/$REPO" --"$VIS" --source . --remote origin --push
else
  git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$OWNER/$REPO.git"
  git push -u origin main
fi

# Pages: Source = GitHub Actions
gh api -X POST "repos/$OWNER/$REPO/pages" -f build_type=workflow >/dev/null 2>&1 \
  || gh api -X PUT "repos/$OWNER/$REPO/pages" -f build_type=workflow >/dev/null

echo "▶ package-lock.json 생성 (lockfile.yml)"
gh workflow run lockfile.yml -R "$OWNER/$REPO"
sleep 8
gh run watch -R "$OWNER/$REPO" "$(gh run list -R "$OWNER/$REPO" --workflow lockfile.yml -L1 --json databaseId -q '.[0].databaseId')" --exit-status
git pull -q origin main

echo "▶ 배포 (deploy.yml)"
gh workflow run deploy.yml -R "$OWNER/$REPO"
sleep 8
RUN=$(gh run list -R "$OWNER/$REPO" --workflow deploy.yml -L1 --json databaseId -q '.[0].databaseId')
gh run watch -R "$OWNER/$REPO" "$RUN" --exit-status
gh run download -R "$OWNER/$REPO" "$RUN" -n live-verify -D reports/ || true

echo "✓ 운영 URL: $(gh api "repos/$OWNER/$REPO/pages" -q .html_url)"
echo "  검증 결과: reports/live-verify.json"
