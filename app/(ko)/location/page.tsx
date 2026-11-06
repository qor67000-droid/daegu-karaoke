import { site, brand, fullAddress } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";
import { SubPage } from "@/components/subpage";
import { HoursAndAddress } from "@/components/sections";
import { SectionHeading } from "@/components/ui";
import { DRINK_NOTICE } from "@/lib/content";
import { FIRST_VISIT } from "@/lib/guides";
import Link from "next/link";

export const metadata = buildMetadata("/location/");

export default function LocationPage() {
  const addr = fullAddress();
  return (
    <SubPage
      path="/location/"
      lead={<>{addr ? `${brand() || "저희 업소"}는 ${addr}에 있습니다.` : "주소와 영업시간을 안내합니다."} 방문 전 전화로 당일 영업 여부를 확인하시면 더 편합니다.</>}
    >
      <section aria-labelledby="addr">
        <SectionHeading id="addr" title="주소와 영업시간" />
        <HoursAndAddress />
      </section>
      {site.geo && (
        <section aria-labelledby="map">
          <SectionHeading id="map" title="지도" />
          {/* 외부 지도 iframe은 LCP에 영향을 주므로 클릭 시 이동하는 링크로 제공 */}
          <a
            href={site.mapUrl ?? `https://www.google.com/maps/search/?api=1&query=${site.geo.lat},${site.geo.lng}`}
            target="_blank"
            rel="noopener"
            data-track="click_directions"
            className="card grain flex aspect-[16/7] items-center justify-center text-gold-2"
          >
            지도 앱에서 위치 열기 →
          </a>
        </section>
      )}
      <section aria-labelledby="transport">
        <SectionHeading id="transport" title="오시는 방법">
          {DRINK_NOTICE}
        </SectionHeading>
        {site.nearby.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {site.nearby.map((n) => (
              <li key={n} className="card p-5">{n}</li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="go-home">
        <SectionHeading id="go-home" title="귀가 안내" />
        <ul className="grid gap-3 sm:grid-cols-3">
          {FIRST_VISIT.goingHome.map((t) => (
            <li key={t} className="card p-5 text-sm">{t}</li>
          ))}
        </ul>
        <p className="mt-6 text-sm">
          <Link href="/guide/daegu-areas/" className="link-more">대구 지역별 교통 안내 보기 →</Link>
        </p>
      </section>
    </SubPage>
  );
}
