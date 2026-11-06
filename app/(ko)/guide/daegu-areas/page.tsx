import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { partners, reservationReady } from "@/lib/site";
import { DAEGU_AREAS, LICENSE_COUNTS } from "@/lib/guides";
import { DRINK_NOTICE } from "@/lib/content";
import { SubPage } from "@/components/subpage";
import { SectionHeading } from "@/components/ui";

export const metadata = buildMetadata("/guide/daegu-areas/");

export default function AreasPage() {
  const max = Math.max(...LICENSE_COUNTS.rows.map((r) => r.count));
  return (
    <SubPage
      path="/guide/daegu-areas/"
      modified="2026-10-30"
      lead={
        <>
          대구에서 노래방과 주점은 도심(동성로), 수성구, 동대구역 주변, 달서구 생활권에 많이 모여 있습니다. 지역별 분위기와 가까운
          도시철도역, 귀가 팁을 정리했습니다. 특정 업소를 추천하지 않습니다.
        </>
      }
    >
      <nav aria-label="지역 바로가기">
        <ul className="flex flex-wrap gap-2">
          {DAEGU_AREAS.map((a) => (
            <li key={a.id}>
              <a href={`#${a.id}`} className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm hover:border-gold/60">
                {a.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {DAEGU_AREAS.map((a) => (
        <section key={a.id} aria-labelledby={a.id} className="scroll-mt-24">
          <SectionHeading eyebrow={a.district} id={a.id} title={a.name} />
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <p className="text-ivory/90">{a.character}</p>
            <dl className="card space-y-4 p-6 text-sm">
              <div>
                <dt className="eyebrow mb-2">가까운 역</dt>
                <dd>
                  <ul className="space-y-1">
                    {a.stations.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="eyebrow mb-2">팁</dt>
                <dd>
                  <ul className="space-y-1 text-mute">
                    {a.tips.map((t) => (
                      <li key={t}>· {t}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        </section>
      ))}
      <section aria-labelledby="counts">
        <SectionHeading id="counts" title="구별 유흥주점 등록 현황 (참고)">
          {LICENSE_COUNTS.source}, {LICENSE_COUNTS.asOf}. {LICENSE_COUNTS.note}
        </SectionHeading>
        <figure className="card p-6">
          <ul className="space-y-4">
            {LICENSE_COUNTS.rows.map((r) => (
              <li key={r.district} className="grid grid-cols-[4.5rem_1fr_3.5rem] items-center gap-3 text-sm">
                <span>{r.district}</span>
                <span className="h-2.5 rounded-full bg-ink-3">
                  <span className="block h-full rounded-full bg-gold/80" style={{ width: `${(r.count / max) * 100}%` }} />
                </span>
                <span className="text-right font-semibold text-gold-2">{r.count}곳</span>
              </li>
            ))}
          </ul>
          <figcaption className="mt-4 text-xs text-mute">유흥주점 업종만 집계한 값이며 노래연습장·단란주점은 포함하지 않습니다.</figcaption>
        </figure>
      </section>
      {reservationReady() && partners.length > 0 && (
        <section aria-labelledby="area-rsv">
          <SectionHeading id="area-rsv" title="수성구 제휴 매장 예약 문의">
            현재 예약을 연결하는 제휴 매장은 수성구에 있습니다. 예약 안내 서비스는 매장의 직영점이 아니며, 예약 가능 여부는 문의 후 확인해 안내합니다.
          </SectionHeading>
          <Link href="/reservation/" className="btn-gold" data-track="click_reservation_guide">
            예약 문의하기
          </Link>
        </section>
      )}
      <section aria-labelledby="home-safe">
        <SectionHeading id="home-safe" title="어느 지역이든 공통으로">
          {DRINK_NOTICE} 도시철도 운행 시간은 노선마다 다르니 대구교통공사 안내에서 막차 시간을 확인하세요.
        </SectionHeading>
      </section>
    </SubPage>
  );
}
