import { site, brand, fullAddress } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";
import { legalNotice } from "@/lib/content";
import { SubPage } from "@/components/subpage";
import { Features, VenueCompare, VisitSteps } from "@/components/sections";
import Link from "next/link";
import { Pending, SectionHeading } from "@/components/ui";

export const metadata = buildMetadata("/about/");

/** 업체 소개 — 실제 업체 정보 확인 전에는 SubPage가 본문을 숨기고 noindex로 유지한다 */
export default function AboutPage() {
  const addr = fullAddress();
  return (
    <SubPage path="/about/" lead={<>{brand() || "업소"}의 영업신고 업종과 위치, 특징을 소개합니다. 확인된 정보만 게시합니다.</>}>
      <section aria-labelledby="license">
        <SectionHeading id="license" title="업종과 이용 대상" />
        <dl className="grid gap-5 sm:grid-cols-3">
          <div className="card p-6">
            <dt className="eyebrow mb-2">상호</dt>
            <dd className="text-lg">{site.name ?? <Pending label="상호" />}</dd>
          </div>
          <div className="card p-6">
            <dt className="eyebrow mb-2">영업신고 업종</dt>
            <dd className="text-lg">
              {site.licenseType ?? <Pending label="업종" />}
              {!site.licenseVerified && <Pending label="신고증 확인" />}
            </dd>
          </div>
          <div className="card p-6">
            <dt className="eyebrow mb-2">소재지</dt>
            <dd className="text-lg">{addr ?? <Pending label="주소" />}</dd>
          </div>
        </dl>
        <p className="mt-6 text-sm text-mute">{legalNotice()}</p>
      </section>
      <section aria-labelledby="features">
        <SectionHeading id="features" title="특징" />
        <Features />
      </section>
      <section aria-labelledby="type">
        <SectionHeading id="type" title="일반 노래방과 무엇이 다른가요">
          {brand() || "업소"}는 {site.licenseType ?? "유흥주점"}으로 영업합니다. 주류를 판매하고 만 19세 이상만 이용할 수 있어, 청소년도 이용하는 노래연습장과는 업종이 다릅니다.
        </SectionHeading>
        <VenueCompare />
      </section>
      <section aria-labelledby="visit">
        <SectionHeading id="visit" title="이용 절차" />
        <VisitSteps />
        <p className="mt-6 text-sm">
          <Link href="/guide/first-visit/" className="link-more">요금 확인 체크리스트 보기 →</Link>
        </p>
      </section>
    </SubPage>
  );
}
