import Link from "next/link";
import type { ReactNode } from "react";
import { site, brand, fullAddress, isDev, businessReady, reservationReady } from "@/lib/site";
import { buildMetadata, businessLd, faqLd, websiteLd } from "@/lib/seo";
import { GENERAL_FAQ, businessFaq } from "@/lib/content";
import { DAEGU_AREAS } from "@/lib/guides";
import { AmbientArt, JsonLd, MoreLink, Pending, Picture, SectionHeading } from "@/components/ui";
import { ContactButtons, OperatorButtons, QuickContact } from "@/components/contact";
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
  const rsv = reservationReady();
  return (
    <>
      <JsonLd data={websiteLd()} />
      <JsonLd data={faqLd(GENERAL_FAQ)} />
      <Hero
        eyebrow={rsv ? "Daegu · Independent Reservation Service" : "Daegu · Karaoke & Noraebang Guide"}
        title={
          rsv ? (
            <>
              대구 가라오케·노래방
              <br />
              <span className="text-gold-2">예약 안내</span>
            </>
          ) : (
            <>
              대구 가라오케·노래방,
              <br />
              <span className="text-gold-2">가기 전에 알아둘 것</span>
            </>
          )
        }
        lead={
          rsv ? (
            <p>
              날짜·시간·인원을 남기면 대구 수성구 제휴 매장의 예약 가능 여부를 확인해 연락드리는{" "}
              <strong className="font-semibold text-ivory">독립 예약 안내 서비스</strong>입니다. 업종 차이와 지역 정보도 함께 안내합니다.
            </p>
          ) : (
            <p>
              “대구 노래방”과 “대구 가라오케”는 검색 결과에 같이 나오지만 법적으로 다른 업종입니다. 업종 차이, 지역별 교통, 처음 갈 때
              요금 확인하는 법을 정리했습니다.
            </p>
          )
        }
        actions={
          rsv ? (
            <div className="space-y-4">
              <Link
                href="/reservation/"
                className="group inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-2 to-gold px-8 text-base font-bold text-ink shadow-[0_10px_30px_-10px_rgb(201_169_107/0.7)] hover:from-gold hover:to-gold sm:w-auto sm:text-lg"
                data-track="click_reservation_hero"
                data-testid="hero-reservation"
              >
                예약 문의하기
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <div>
                <p className="mb-2 text-xs tracking-widest text-mute">빠른 문의</p>
                <QuickContact />
              </div>
              <p className="flex flex-wrap gap-x-5 gap-y-1 pt-1 text-sm">
                <Link href="/guide/" className="text-mute underline-offset-4 hover:text-ivory hover:underline">
                  업종 차이 보기
                </Link>
                <Link href="/guide/daegu-areas/" className="text-mute underline-offset-4 hover:text-ivory hover:underline">
                  대구 지역별 안내
                </Link>
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Link href="/guide/" className="btn-gold">
                업종 차이 보기
              </Link>
              <Link href="/guide/daegu-areas/" className="btn-ghost">
                대구 지역별 안내
              </Link>
            </div>
          )
        }
      />

      {rsv && (
        <section aria-labelledby="reservation" className="wrap pt-4 pb-16 sm:pb-20">
          <div className="card grain p-8 sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start">
              <div>
                <p className="eyebrow mb-3">Reservation</p>
                <h2 id="reservation" className="h-display text-[1.65rem] leading-snug sm:text-4xl">
                  예약 문의 안내
                </h2>
                <div className="gold-rule mt-5" />
                <p className="mt-5 text-mute">
                  이 사이트는 독립적으로 운영되는 예약 안내 서비스입니다. 제휴 매장은 운영자의 직영점이 아니며, 매장의 영업과 요금은 각 매장이
                  정합니다. 예약은 아래 순서로 진행되고, 고객님이 안내 내용을 확인하신 뒤에만 확정됩니다.
                </p>
                <Link href="/reservation/" className="btn-gold mt-7" data-track="click_reservation_section">
                  예약 문의 작성하기
                </Link>
              </div>
              <ol className="space-y-3">
                {[
                  ["문의", "전화·문자·카카오톡·LINE·텔레그램으로 날짜·시간·인원을 보내 주세요."],
                  ["확인", "운영자가 제휴 매장에 예약 가능 여부와 요금을 확인합니다."],
                  ["안내", "확인 결과를 보내주신 연락처로 알려드립니다."],
                  ["확정", "안내 내용에 동의하시면 예약이 확정됩니다."],
                ].map(([t, d], i) => (
                  <li key={t} className="flex gap-4 rounded-xl border border-line bg-ink/60 p-4">
                    <span className="h-display text-2xl text-gold/80">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="block font-semibold">{t}</span>
                      <span className="text-sm text-mute">{d}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="mt-8 border-t border-line pt-6">
              <OperatorButtons set="all" />
            </div>
          </div>
        </section>
      )}

      {rsv && (
        <section aria-labelledby="intent" className="wrap py-16 sm:py-20">
          <SectionHeading eyebrow="Which one?" id="intent" title="대구 노래방과 가라오케, 어떤 곳을 찾으세요?">
            “대구 노래방”과 “대구 가라오케”는 비슷해 보이지만 업종이 다릅니다. 목적에 맞는 곳을 먼저 고르세요.
          </SectionHeading>
          <div className="grid gap-5 lg:grid-cols-2">
            <article className="card p-6 sm:p-8">
              <p className="eyebrow mb-2">노래만 부를 때</p>
              <h3 className="h-display text-2xl">노래연습장 (코인·일반 노래방)</h3>
              <ul className="mt-4 space-y-2 text-sm text-mute">
                <li>· 주류를 팔지 않고, 시간·곡 단위로 요금을 냅니다.</li>
                <li>· 청소년실이 있으면 청소년도 이용할 수 있습니다.</li>
                <li>· 이 서비스는 노래연습장 예약을 안내하지 않습니다. 가까운 노래연습장은 지도 앱에서 찾으세요.</li>
              </ul>
              <MoreLink href="/guide/">업종 차이 자세히 보기</MoreLink>
            </article>
            <article className="card border-gold/40 p-6 sm:p-8">
              <p className="eyebrow mb-2">술과 함께 룸에서</p>
              <h3 className="h-display text-2xl">가라오케 (유흥주점·단란주점)</h3>
              <ul className="mt-4 space-y-2 text-sm text-mute">
                <li>· 주류를 판매하며 만 19세 이상만 이용할 수 있습니다.</li>
                <li>· “가라오케”라는 이름의 업소는 식품위생법상 유흥주점이나 단란주점으로 영업신고된 경우가 있습니다. 간판보다 영업신고 업종을 확인하세요.</li>
                <li>· 요금은 업소마다 다르므로 예약할 때 포함 항목과 연장 기준을 확인하세요.</li>
              </ul>
              <p className="mt-5 text-sm text-ivory/85">문의 전에 정해 두면 빠릅니다: <strong>방문 날짜·도착 시간</strong>, <strong>인원</strong>, <strong>원하는 룸 크기나 요청</strong>.</p>
              <Link href="/reservation/" className="btn-gold mt-5" data-track="click_reservation_intent">
                가라오케 예약 문의하기
              </Link>
            </article>
          </div>
        </section>
      )}

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
