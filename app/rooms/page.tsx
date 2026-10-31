import { site, brand } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";
import { SubPage } from "@/components/subpage";
import { RoomCards } from "@/components/sections";
import { SectionHeading } from "@/components/ui";

export const metadata = buildMetadata("/rooms/");

export default function RoomsPage() {
  const total = site.rooms.reduce((n, r) => n + (r.count ?? 0), 0);
  return (
    <SubPage
      path="/rooms/"
      lead={
        <>
          {brand() || "저희 업소"}의 룸을 인원과 시설 기준으로 정리했습니다.
          {site.rooms.length > 0 && ` 룸 종류 ${site.rooms.length}가지${total ? `, 총 ${total}실` : ""}입니다.`} 사진은 실제 매장 사진만 게시합니다.
        </>
      }
    >
      <section aria-labelledby="room-list">
        <SectionHeading id="room-list" title="룸 종류" />
        <RoomCards />
      </section>
      {site.rooms.length > 0 && (
        <section aria-labelledby="by-size">
          <SectionHeading id="by-size" title="인원별로 맞는 룸">
            일행 수에 맞춰 고르세요. 표시된 인원은 업소가 안내한 기준입니다.
          </SectionHeading>
          <ul className="grid gap-3 sm:grid-cols-2">
            {site.rooms.map((r) => (
              <li key={r.name} className="card flex items-center justify-between gap-4 p-5">
                <span>
                  <span className="block font-semibold">{r.capacity} 모임</span>
                  <span className="text-sm text-mute">
                    {r.name}
                    {r.count ? ` · ${r.count}실` : ""}
                  </span>
                </span>
                {r.equipment.length > 0 && <span className="text-right text-xs text-mute">{r.equipment.join(" · ")}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
      <section aria-labelledby="room-tip">
        <SectionHeading id="room-tip" title="룸을 고를 때">
          인원보다 한 단계 여유 있는 룸을 원하시면 예약할 때 말씀해 주세요. 단체 모임은 미리 예약해야 원하는 시간에 이용하기 쉽습니다.
          룸 크기에 따라 기본 요금이 달라질 수 있으니 예약할 때 함께 확인하세요.
        </SectionHeading>
      </section>
    </SubPage>
  );
}
