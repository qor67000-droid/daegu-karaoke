import Link from "next/link";
import type { ReactNode } from "react";
import { site, brand, fullAddress, isDev, businessReady } from "@/lib/site";
import { buildMetadata, businessLd, faqLd, websiteLd } from "@/lib/seo";
import { GENERAL_FAQ, businessFaq } from "@/lib/content";
import { DAEGU_AREAS } from "@/lib/guides";
import { AmbientArt, JsonLd, MoreLink, Pending, Picture, SectionHeading } from "@/components/ui";
import { ContactButtons } from "@/components/contact";
import { Features, FaqList, HoursAndAddress, PriceTable, RoomCards, VenueCompare, VisitSteps } from "@/components/sections";

export const metadata = buildMetadata("/");

/**
 * 홈은 두 모드로 동작한다.
 *  - 정보 모드(업체 정보 미확인): 특정 업체를 소개하지 않는 독립 정보 가이드
 *  - 업체 모드(필수 정보 확인 완료): 공식 업체 안내 + 가이드 링크
 * 개발 모드에서는 업체 모드 레이아웃에 [미정] 표시를 보여 준다.
 */
export default function HomePage() {
  return businessReady() || isDev ? <BusinessHome /> : <InfoHome />;
}

function Hero({ eyebrow, title, lead, actions }: { eyebrow: string; title: ReactNode; lead: ReactNode; actions: ReactNode }) {
  return (
    <section className="grain relative isolate overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div className="wrap grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="eyebrow mb-5">{eyebrow}</p>
          <h1 className="h-display text-[2.2rem] leading-[1.22] sm:text-5xl lg:text-[3.4rem]">{title}</h1>
          <div className="mt-6 max-w-xl text-[1.05rem] text-mute">{lead}</div>
          <div className="mt-9">{actions}</div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-md lg:max-w-none">
          {site.heroPhoto && businessReady() ? (
            <Picture
              file={site.heroPhoto.file}
              alt={site.heroPhoto.alt}
              width={site.heroPhoto.width}
              height={site.heroPhoto.height}
              priority
              className="h-full w-full rounded-[2rem] object-cover"
            />
          ) : (
            <AmbientArt className="h-full w-full" />
          )}
        </div>
      </div>
    </section>
  );
}

function AreasPreview() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2">
      {DAEGU_AREAS.map((a) => (
        <li key={a.id} className="card p-6">
          <p className="text-xs tracking-widest text-gold">{a.district}</p>
          <h3 className="h-display mt-1 text-xl">{a.name}</h3>
          <p className="mt-2 text-sm text-mute">{a.stations.join(" · ")}</p>
        </li>
      ))}
    </ul>
  );
}

/* ───────────────────────── 정보 모드 ───────────────────────── */
function InfoHome() {
  return (
    <>
      <JsonLd data={websiteLd()} />
      <JsonLd data={faqLd(GENERAL_FAQ)} />
      <Hero
        eyebrow="Daegu · Karaoke & Noraebang Guide"
        title={
          <>
            대구 가라오케·노래방,
            <br />
            <span className="text-gold-2">가기 전에 알아둘 것</span>
          </>
        }
        lead={
          <p>
            “대구 노래방”과 “대구 가라오케”는 검색 결과에 같이 나오지만 법적으로 다른 업종입니다. 업종 차이, 지역별 교통, 처음 갈 때
            요금 확인하는 법을 정리했습니다.
          </p>
        }
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/guide/" className="btn-gold">
              업종 차이 보기
            </Link>
            <Link href="/guide/daegu-areas/" className="btn-ghost">
              대구 지역별 안내
            </Link>
          </div>
        }
      />

      <section aria-labelledby="compare" className="wrap py-16 sm:py-20">
        <SectionHeading eyebrow="Guide" id="compare" title="노래연습장·단란주점·유흥주점 한눈에 비교">
          주류 판매 여부와 청소년 출입 가능 여부가 가장 큰 차이입니다. 목적에 맞는 곳을 고르세요.
        </SectionHeading>
        <VenueCompare />
        <MoreLink href="/guide/">업종별 차이와 확인 방법 자세히 보기</MoreLink>
      </section>

      <section aria-labelledby="areas" className="border-y border-line bg-ink-2/60 py-16 sm:py-20">
        <div className="wrap">
          <SectionHeading eyebrow="Areas" id="areas" title="대구에서 노래방·주점이 모인 지역">
            지역마다 분위기와 이용객이 다릅니다. 가까운 도시철도역을 기준으로 정리했습니다.
          </SectionHeading>
          <AreasPreview />
          <MoreLink href="/guide/daegu-areas/">지역별 특징과 귀가 팁 보기</MoreLink>
        </div>
      </section>

      <section aria-labelledby="steps" className="wrap py-16 sm:py-20">
        <SectionHeading eyebrow="First visit" id="steps" title="처음 이용할 때 순서" />
        <VisitSteps />
        <MoreLink href="/guide/first-visit/">요금 확인 체크리스트와 안전한 귀가 방법 보기</MoreLink>
      </section>

      <section aria-labelledby="faq" className="wrap py-16 sm:py-20">
        <SectionHeading eyebrow="FAQ" id="faq" title="자주 묻는 질문" />
        <FaqList items={GENERAL_FAQ} />
      </section>
    </>
  );
}

/* ───────────────────────── 업체 모드 ───────────────────────── */
function BusinessHome() {
  const faq = [...businessFaq(), ...GENERAL_FAQ.slice(1)];
  const addr = fullAddress();
  const area = [site.address.district, site.address.dong].filter(Boolean).join(" ");

  return (
    <>
      <JsonLd data={websiteLd()} />
      <JsonLd data={businessLd()} />
      <JsonLd data={faqLd(faq)} />

      <Hero
        eyebrow={`Daegu ${area ? `· ${area}` : ""} · ${site.licenseType ?? "Karaoke"}`}
        title={
          <>
            대구 가라오케·노래방
            {brand() ? (
              <>
                ,<br />
                <span className="text-gold-2">{brand()}</span>
              </>
            ) : (
              <>
                <br />
                <Pending label="상호" />
              </>
            )}
          </>
        }
        lead={
          <>
            <p>
              {brand() || "업소"}는 대구{area ? ` ${area}` : ""}에서 영업하는{" "}
              <strong className="font-semibold text-ivory">{site.licenseType ?? "유흥주점"}</strong>입니다. 룸에서 주류와 함께 노래를 즐기는
              성인 전용 공간으로, 일반 노래연습장과는 업종이 다릅니다.
            </p>
            {addr && <p className="mt-4 text-sm">{addr}</p>}
          </>
        }
        actions={<ContactButtons />}
      />

      <section aria-labelledby="about" className="wrap py-16 sm:py-20">
        <SectionHeading eyebrow="About" id="about" title={`${brand() || "업소"}는 어떤 곳인가요`}>
          영업신고 업종은 <strong className="text-ivory">{site.licenseType ?? "유흥주점"}</strong>
          {!site.licenseVerified && (
            <>
              {" "}
              <Pending label="영업신고증 확인" />
            </>
          )}
          이며, 만 19세 이상 성인만 이용할 수 있습니다. 아래 정보는 업소가 직접 확인한 내용만 게시합니다.
        </SectionHeading>
        <Features />
        {site.name && site.licenseVerified && <MoreLink href="/about/">업체 소개 자세히 보기</MoreLink>}
      </section>

      {(site.rooms.length > 0 || isDev) && (
        <section aria-labelledby="rooms" className="wrap py-16 sm:py-20">
          <SectionHeading eyebrow="Rooms" id="rooms" title="룸과 시설" />
          <RoomCards limit={3} />
          {site.rooms.length > 0 && <MoreLink href="/rooms/">룸별 인원과 음향 시설 자세히 보기</MoreLink>}
        </section>
      )}

      {(site.prices.length > 0 || isDev) && (
        <section aria-labelledby="price" className="wrap py-16 sm:py-20">
          <SectionHeading eyebrow="Price" id="price" title="이용 요금">
            요금은 이미지가 아닌 텍스트로 공개하며, 방문 전 전화로 최종 금액을 확인하실 수 있습니다.
          </SectionHeading>
          <PriceTable />
          {site.prices.length > 0 && <MoreLink href="/price/">포함·불포함 항목과 결제 수단 보기</MoreLink>}
        </section>
      )}

      <section aria-labelledby="compare" className="border-y border-line bg-ink-2/60 py-16 sm:py-20">
        <div className="wrap">
          <SectionHeading eyebrow="Guide" id="compare" title="대구 노래방과 가라오케, 무엇이 다른가요">
            “노래방”으로 검색해도 업종은 세 가지로 나뉩니다. 주류 판매 여부와 청소년 출입 가능 여부가 다릅니다.
          </SectionHeading>
          <VenueCompare />
          <MoreLink href="/guide/">업종별 차이와 확인 방법 자세히 보기</MoreLink>
        </div>
      </section>

      <section aria-labelledby="steps" className="wrap py-16 sm:py-20">
        <SectionHeading eyebrow="How to visit" id="steps" title="예약과 이용 절차" />
        <VisitSteps />
        <MoreLink href="/guide/first-visit/">요금 확인 체크리스트 보기</MoreLink>
      </section>

      <section aria-labelledby="location" className="wrap py-16 sm:py-20">
        <SectionHeading eyebrow="Location" id="location" title="오시는 길·영업시간" />
        <HoursAndAddress />
        {site.address.street && <MoreLink href="/location/">대중교통·주차 안내 보기</MoreLink>}
      </section>

      <section aria-labelledby="faq" className="wrap py-16 sm:py-20">
        <SectionHeading eyebrow="FAQ" id="faq" title="자주 묻는 질문" />
        <FaqList items={faq} />
      </section>

      <section className="wrap py-10">
        <div className="card grain flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-12">
          <div>
            <p className="eyebrow mb-2">Reservation</p>
            <p className="h-display text-2xl sm:text-3xl">방문 날짜와 인원을 알려주세요</p>
          </div>
          <ContactButtons compact />
        </div>
      </section>
    </>
  );
}
