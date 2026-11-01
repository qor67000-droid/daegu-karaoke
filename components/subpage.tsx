import Link from "next/link";
import type { ReactNode } from "react";
import { getRoute, isPublished, navRoutes } from "@/lib/routes";
import { articleLd, breadcrumbLd } from "@/lib/seo";
import { isDev, reservationReady } from "@/lib/site";
import { Breadcrumbs, JsonLd } from "@/components/ui";
import { ContactButtons } from "@/components/contact";

/**
 * 하위 페이지 공통 틀: breadcrumb + 단일 H1 + 관련 페이지 + CTA
 * 업체 페이지인데 실제 정보가 아직 없으면(미공개) 본문 대신 '공개 준비 중' 안내만 렌더링한다.
 * 이 상태의 페이지는 noindex · 사이트맵 제외 · 내비게이션 미노출이다.
 */
export function SubPage({
  path,
  lead,
  children,
  modified,
}: {
  path: string;
  lead: ReactNode;
  children: ReactNode;
  /** 정보 페이지 콘텐츠 수정일 (YYYY-MM-DD) → Article JSON-LD */
  modified?: string;
}) {
  const r = getRoute(path);
  const published = isPublished(r);
  const showBody = published || isDev;
  const related = navRoutes(isDev)
    .filter((x) => x.path !== path && x.path !== "/")
    .sort((a, b) => (a.kind === r.kind ? -1 : 0) - (b.kind === r.kind ? -1 : 0))
    .slice(0, 3);
  return (
    <>
      <JsonLd data={breadcrumbLd(r)} />
      {r.kind === "info" && modified && <JsonLd data={articleLd(path, modified)} />}
      <div className="grain">
        <Breadcrumbs route={r} />
        <header className="wrap pt-8 pb-12 sm:pb-16">
          <h1 className="h-display text-[2rem] leading-tight sm:text-5xl">{r.h1()}</h1>
          <div className="gold-rule mt-6" />
          <div className="mt-6 max-w-2xl text-mute">
            {showBody ? lead : "이 페이지는 업체 정보가 확인된 뒤 공개됩니다. 그동안 아래 이용 가이드를 참고해 주세요."}
          </div>
          {r.kind !== "business" && modified && (
            <p className="mt-4 text-xs text-mute/70">
              최종 수정 <time dateTime={modified}>{modified}</time>
            </p>
          )}
        </header>
      </div>
      {showBody ? (
        <div className="wrap space-y-16">{children}</div>
      ) : (
        <div className="wrap">
          <ul className="grid gap-4 sm:grid-cols-3">
            {navRoutes(false)
              .filter((x) => x.kind === "info" && x.path !== "/")
              .map((x) => (
                <li key={x.path}>
                  <Link href={x.path} className="card block p-6 hover:border-gold/60">
                    <span className="font-semibold">{x.nav}</span>
                    <span className="mt-2 block text-sm text-mute">{x.description()}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      )}
      <aside aria-label="관련 안내" className="wrap mt-20">
        <div className="card grid gap-8 p-8 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="eyebrow mb-3">More</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {related.map((x) => (
                <li key={x.path}>
                  <Link href={x.path} className="link-more">
                    {x.nav} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {reservationReady() && path !== "/reservation/" ? (
            <Link href="/reservation/" className="btn-gold" data-track="click_reservation_page">
              예약 문의
            </Link>
          ) : (
            <ContactButtons compact />
          )}
        </div>
      </aside>
    </>
  );
}
