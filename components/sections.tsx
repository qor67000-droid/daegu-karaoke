import { site, fullAddress, formatDays, formatHours, isDev } from "@/lib/site";
import { VENUE_TYPES, VISIT_STEPS } from "@/lib/content";
import type { FaqItem } from "@/lib/types";
import { Pending, Picture } from "@/components/ui";

export function RoomCards({ limit }: { limit?: number }) {
  const rooms = limit ? site.rooms.slice(0, limit) : site.rooms;
  if (!rooms.length) return isDev ? <Pending label="룸 정보 (config/site.ts rooms)" /> : null;
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {rooms.map((r) => (
        <li key={r.name} className="card overflow-hidden">
          {r.photo && (
            <Picture file={r.photo} alt={r.photoAlt ?? `${r.name} 실내`} width={800} height={533} className="aspect-[3/2] w-full object-cover" />
          )}
          <div className="p-6">
            <h3 className="h-display text-xl">{r.name}</h3>
            <p className="mt-1 text-sm text-gold-2">
              {r.capacity}
              {r.count ? ` · ${r.count}실` : ""}
            </p>
            {r.description && <p className="mt-3 text-sm text-mute">{r.description}</p>}
            {r.equipment.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {r.equipment.map((e) => (
                  <li key={e} className="rounded-full border border-line px-3 py-1 text-xs text-ivory/80">
                    {e}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function PriceTable() {
  if (!site.prices.length) return isDev ? <Pending label="요금표 (config/site.ts prices)" /> : null;
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-left text-sm sm:text-base">
        <caption className="sr-only">이용 요금표</caption>
        <thead className="bg-ink-3 text-xs tracking-widest text-mute">
          <tr>
            <th scope="col" className="px-5 py-3 font-medium">구분</th>
            <th scope="col" className="px-5 py-3 text-right font-medium">요금</th>
          </tr>
        </thead>
        <tbody>
          {site.prices.map((p) => (
            <tr key={p.label} className="border-t border-line">
              <th scope="row" className="px-5 py-4 font-medium">
                {p.label}
                {p.note && <span className="mt-1 block text-xs font-normal text-mute">{p.note}</span>}
              </th>
              <td className="px-5 py-4 text-right font-semibold whitespace-nowrap text-gold-2">{p.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function HoursAndAddress() {
  const addr = fullAddress();
  // 미리보기·프로덕션에서 표시할 실제 정보가 없으면 빈 카드를 만들지 않는다
  if (!isDev && !addr && !site.hours.length) return null;
  return (
    <dl className="grid gap-6 sm:grid-cols-2">
      <div className="card p-6">
        <dt className="eyebrow mb-3">주소</dt>
        <dd className="text-lg">{addr ?? <Pending label="도로명 주소" />}</dd>
        {site.nearby.length > 0 && (
          <dd className="mt-3 text-sm text-mute">
            <ul className="space-y-1">
              {site.nearby.map((n) => (
                <li key={n}>· {n}</li>
              ))}
            </ul>
          </dd>
        )}
        {site.parking && <dd className="mt-3 text-sm text-mute">주차: {site.parking}</dd>}
        {site.mapUrl && (
          <dd className="mt-5">
            <a href={site.mapUrl} target="_blank" rel="noopener" data-track="click_directions" className="btn-ghost">
              지도에서 길찾기
            </a>
          </dd>
        )}
      </div>
      <div className="card p-6">
        <dt className="eyebrow mb-3">영업시간</dt>
        {site.hours.length ? (
          site.hours.map((h) => (
            <dd key={h.days.join()} className="flex justify-between gap-4 text-lg">
              <span>{formatDays(h.days)}</span>
              <span className="text-gold-2">{formatHours(h)}</span>
            </dd>
          ))
        ) : (
          <dd>
            <Pending label="영업시간" />
          </dd>
        )}
        {site.closedNote && <dd className="mt-3 text-sm text-mute">{site.closedNote}</dd>}
      </div>
    </dl>
  );
}

export function VenueCompare() {
  return (
    <>
      {/* 모바일: 카드형 */}
      <ul className="grid gap-4 sm:hidden">
        {VENUE_TYPES.map((v) => (
          <li key={v.type} className={`card p-5 ${v.type.startsWith("유흥") ? "border-gold/50" : ""}`}>
            <p className="font-semibold text-ivory">{v.type}</p>
            <dl className="mt-3 grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1.5 text-sm">
              <dt className="text-mute">근거 법령</dt><dd>{v.law}</dd>
              <dt className="text-mute">주류</dt><dd>{v.alcohol}</dd>
              <dt className="text-mute">종사자·시설</dt><dd>{v.staff}</dd>
              <dt className="text-mute">노래·춤</dt><dd>{v.sing}</dd>
              <dt className="text-mute">청소년</dt><dd>{v.youth}</dd>
            </dl>
          </li>
        ))}
      </ul>
    <div className="hidden sm:block">
      <table className="w-full border-separate border-spacing-0 text-left text-sm">
        <caption className="sr-only">유흥주점, 단란주점, 노래연습장 비교</caption>
        <thead>
          <tr className="text-xs tracking-widest text-mute">
            <th scope="col" className="border-b border-line py-3 pr-4 font-medium">업종</th>
            <th scope="col" className="border-b border-line px-4 py-3 font-medium">근거 법령</th>
            <th scope="col" className="border-b border-line px-4 py-3 font-medium">주류</th>
            <th scope="col" className="border-b border-line px-4 py-3 font-medium">종사자·시설</th>
            <th scope="col" className="border-b border-line px-4 py-3 font-medium">청소년</th>
            <th scope="col" className="border-b border-line py-3 pl-4 font-medium">노래·춤</th>
          </tr>
        </thead>
        <tbody>
          {VENUE_TYPES.map((v) => (
            <tr key={v.type} className={v.type.startsWith("유흥") ? "text-ivory" : "text-mute"}>
              <th scope="row" className="border-b border-line py-4 pr-4 font-semibold text-ivory">{v.type}</th>
              <td className="border-b border-line px-4 py-4">{v.law}</td>
              <td className="border-b border-line px-4 py-4">{v.alcohol}</td>
              <td className="border-b border-line px-4 py-4">{v.staff}</td>
              <td className="border-b border-line px-4 py-4">{v.youth}</td>
              <td className="border-b border-line py-4 pl-4">{v.sing}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}

export function VisitSteps() {
  return (
    <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {VISIT_STEPS.map((s, i) => (
        <li key={s.title} className="card p-6">
          <span className="h-display text-3xl text-gold/80">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
          <p className="mt-2 text-sm text-mute">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((f) => (
        <details key={f.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-base font-semibold sm:text-lg [&::-webkit-details-marker]:hidden">
            <h3 className="font-semibold">{f.q}</h3>
            <span aria-hidden="true" className="mt-1 text-gold transition-transform group-open:rotate-45">＋</span>
          </summary>
          <p className="mt-3 max-w-3xl text-mute">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function Features() {
  if (!site.features.length) return isDev ? <Pending label="검증된 업체 특징 (config/site.ts features)" /> : null;
  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {site.features.map((f) => (
        <li key={f} className="card flex items-start gap-3 p-5">
          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
          <span>{f}</span>
        </li>
      ))}
    </ul>
  );
}
