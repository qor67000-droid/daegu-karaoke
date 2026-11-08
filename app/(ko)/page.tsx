import Link from "next/link";
import type { ReactNode } from "react";
import { site, partners, brand, fullAddress, isDev, businessReady, reservationReady } from "@/lib/site";
import { buildMetadata, businessLd, faqLd, websiteLd } from "@/lib/seo";
import { GENERAL_FAQ, NAME_NOTE, SERVICE_FAQ, businessFaq } from "@/lib/content";
import { DAEGU_AREAS } from "@/lib/guides";
import { AmbientArt, JsonLd, MoreLink, Pending, Picture, SectionHeading } from "@/components/ui";
import { ContactButtons, OperatorButtons, QuickContact } from "@/components/contact";
import { Features, FaqList, HoursAndAddress, PriceTable, RoomCards, VenueCompare, VisitSteps } from "@/components/sections";

export const metadata = buildMetadata("/");

/**
 * 홈은 두 모드로 동작한다.
 *  - 예약 문의 모드(업체 정보 미확인): 운영자가 제휴 매장 예약 문의를 연결하는 홈
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

/**
 * 제휴 매장: 실제 확인된 정보(위치)만 표시하고, 미확인 항목은 '확인 중'으로 둔다.
 * 상호·허가 업종·객실·가격·영업시간은 config/site.ts 의 partners 에 확인된 값이 들어올 때만 표시된다.
 */
function PartnerSection() {
  const p = partners[0];
  if (!p) return null;
  const mapUrl = `https://map.kakao.com/?q=${encodeURIComponent(p.mapQuery)}`;
  const rows: [string, string | null][] = [
    ["매장명", p.name],
    ["허가 업종", p.licenseVerified ? p.licenseType : null],
    ["영업시간", p.hours],
    ["요금", p.priceNote],
  ];
  return (
    <section aria-labelledby="partner" className="wrap py-16 sm:py-20">
      <SectionHeading eyebrow="Partner venue" id="partner" title="제휴 매장 정보">
        예약 문의를 연결하는 제휴 매장의 확인된 정보입니다. 확인되지 않은 항목은 지어내지 않고 ‘확인 중’으로 표시합니다.
      </SectionHeading>
      <div className="card grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="eyebrow mb-1">위치 (확인됨)</p>
          <p className="text-lg">{p.address}</p>
          <p className="mt-2 text-sm text-mute">제휴 매장 위치이며 예약 안내 서비스 운영자의 사업장 주소가 아닙니다. 제휴 매장은 운영자의 직영점이 아닙니다.</p>
          <a href={mapUrl} target="_blank" rel="noopener" className="btn-ghost mt-5" data-track="click_directions">
            카카오맵에서 위치 보기
          </a>
        </div>
        <dl className="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-3 text-sm" data-testid="partner-facts">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-mute">{k}</dt>
              <dd className={v ? "text-ivory" : "text-mute"}>{v ?? "확인 중 — 확인되면 게시합니다"}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ───────────────────────── 정보 모드 ───────────────────────── */
function InfoHome() {
  const rsv = reservationReady();
  const faq = rsv ? [...SERVICE_FAQ, ...GENERAL_FAQ] : GENERAL_FAQ;
  return (
    <>
      <JsonLd data={websiteLd()} />
      <JsonLd data={faqLd(faq)} />
      <Hero
        eyebrow={rsv ? "Daegu Karaoke · Reservation Inquiry" : "Daegu · Karaoke & Noraebang Guide"}
        title={
          rsv ? (
            <>
              대구 가라오케{" "}
              <br />
              <span className="text-gold-2">예약 문의</span>
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
            <>
              <p>
                대구 지역 <strong className="font-semibold text-ivory">유흥주점·단란주점</strong> 이용을 위한 예약 문의 서비스를 제공합니다. 방문
                일정과 인원을 알려주시면 이용 가능 여부를 확인해 안내합니다.
              </p>
              <p className="mt-3 text-sm">
                독립적으로 운영하는 예약 문의 서비스이며, 제휴 매장은 운영자의 직영점이 아닙니다. 노래연습장·코인노래방 예약은 안내하지 않습니다.
              </p>
            </>
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
                className="group inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-gold bg-gradient-to-r from-gold-2 to-gold px-8 text-base font-bold text-ink shadow-[0_10px_30px_-10px_rgb(201_169_107/0.7)] hover:from-gold hover:to-gold sm:w-auto sm:text-lg"
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
              <div data-testid="hero-types">
                <p className="mb-2 text-xs tracking-widest text-mute">업종별 예약 문의</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/reservation/?type=yuheung"
                    className="rounded-xl border border-gold/50 bg-ink/60 px-4 py-3 text-sm hover:border-gold"
                    data-track="click_reservation_type_yuheung"
                    data-testid="hero-type-yuheung"
                  >
                    <span className="block font-semibold text-ivory">유흥주점</span>
                    <span className="text-xs text-mute">노래·춤 허용 업종</span>
                  </Link>
                  <Link
                    href="/reservation/?type=danran"
                    className="rounded-xl border border-gold/50 bg-ink/60 px-4 py-3 text-sm hover:border-gold"
                    data-track="click_reservation_type_danran"
                    data-testid="hero-type-danran"
                  >
                    <span className="block font-semibold text-ivory">단란주점</span>
                    <span className="text-xs text-mute">노래 허용 업종</span>
                  </Link>
                </div>
              </div>
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
                  희망 업종(유흥주점·단란주점)과 방문 날짜·시간·인원을 보내 주시면 운영자가 제휴 매장에 이용 가능 여부를 확인해 알려드립니다. 제휴
                  매장은 운영자의 직영점이 아니며, 매장의 영업과 요금은 각 매장이 정합니다. 예약은 고객님이 안내 내용을 확인하신 뒤에만 확정됩니다.
                </p>
                <Link href="/reservation/" className="btn-gold mt-7" data-track="click_reservation_section">
                  예약 문의 작성하기
                </Link>
              </div>
              <ol className="space-y-3">
                {[
                  ["문의", "전화·문자·카카오톡·LINE·텔레그램으로 희망 업종과 날짜·시간·인원을 보내 주세요."],
                  ["확인", "운영자가 제휴 매장의 영업신고 업종과 예약 가능 여부, 요금을 확인합니다."],
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
          <SectionHeading eyebrow="Choose a type" id="intent" title="업종을 고르고 예약 문의하기">
            유흥주점과 단란주점은 법에서 허용하는 영업 범위가 다른 업종입니다. 희망 업종을 고르면 그 업종으로 허가된 제휴 매장인지부터 확인해 안내하며,
            잘 모르시면 ‘상담 후 결정’으로 문의하셔도 됩니다.
          </SectionHeading>
          <div className="grid gap-5 lg:grid-cols-2">
            <article className="card border-gold/40 p-6 sm:p-8" data-testid="type-yuheung">
              <p className="eyebrow mb-2">식품위생법 · 유흥주점영업</p>
              <h3 className="h-display text-2xl">대구 유흥주점 예약 문의</h3>
              <p className="mt-3 text-sm text-mute">유흥종사자를 두거나 유흥시설을 설치할 수 있고, 노래·춤이 허용되는 주점입니다.</p>
              <ul className="mt-4 space-y-2 text-sm text-mute">
                <li>· 확인해 드리는 것: 유흥주점 허가 여부, 날짜·시간·인원 가능 여부, 요금 기준(세금·봉사료 포함 여부), 결제 수단</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/reservation/?type=yuheung" className="btn-gold" data-track="click_reservation_intent_yuheung">
                  유흥주점 예약 문의
                </Link>
                <Link href="/yuheung-jujeom/" className="btn-ghost" data-testid="detail-yuheung">
                  대구 유흥주점 자세히 보기
                </Link>
              </div>
            </article>
            <article className="card border-gold/40 p-6 sm:p-8" data-testid="type-danran">
              <p className="eyebrow mb-2">식품위생법 · 단란주점영업</p>
              <h3 className="h-display text-2xl">대구 단란주점 예약 문의</h3>
              <p className="mt-3 text-sm text-mute">유흥종사자 없이 일행끼리 술과 노래를 즐기는 주점입니다. 회식·모임 2차에 많이 찾습니다.</p>
              <ul className="mt-4 space-y-2 text-sm text-mute">
                <li>· 확인해 드리는 것: 단란주점 허가 여부, 날짜·시간·인원 수용 여부, 요금·연장 기준, 결제 수단</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/reservation/?type=danran" className="btn-gold" data-track="click_reservation_intent_danran">
                  단란주점 예약 문의
                </Link>
                <Link href="/danran-jujeom/" className="btn-ghost" data-testid="detail-danran">
                  대구 단란주점 자세히 보기
                </Link>
              </div>
            </article>
          </div>
        </section>
      )}

      {rsv && <PartnerSection />}

      <section aria-labelledby="steps" className="wrap py-16 sm:py-20">
        <SectionHeading eyebrow="Process" id="steps" title="예약부터 이용까지 절차" />
        <VisitSteps />
        <MoreLink href="/guide/first-visit/">요금 확인 체크리스트와 안전한 귀가 방법</MoreLink>
      </section>

      <section aria-labelledby="compare" className="border-y border-line bg-ink-2/60 py-16 sm:py-20">
        <div className="wrap">
          <SectionHeading eyebrow="In short" id="compare" title="업종 차이 핵심 요약" />
          <ul className="grid gap-4 md:grid-cols-3" data-testid="compare-summary">
            <li className="card p-5 text-sm text-mute">
              <Link href="/yuheung-jujeom/" className="font-semibold text-ivory hover:text-gold-2">
                유흥주점 →
              </Link>
              <p className="mt-2">주류 판매. 유흥종사자·유흥시설 가능, 노래·춤 허용. 구청 허가 업종, 만 19세 미만 출입 금지.</p>
            </li>
            <li className="card p-5 text-sm text-mute">
              <Link href="/danran-jujeom/" className="font-semibold text-ivory hover:text-gold-2">
                단란주점 →
              </Link>
              <p className="mt-2">주류 판매. 손님 노래 허용, 유흥종사자 불가. 구청 허가 업종, 만 19세 미만 출입 금지.</p>
            </li>
            <li className="card p-5 text-sm text-mute">
              <span className="font-semibold text-ivory">노래연습장 (일반 노래방·코인노래방)</span>
              <p className="mt-2">주류 판매 불가, 다른 법(음악산업진흥법) 업종. 이 서비스는 노래연습장 예약을 안내하지 않습니다.</p>
            </li>
          </ul>
          <p className="mt-5 text-sm text-mute">{NAME_NOTE}</p>
          <MoreLink href="/guide/">법령 근거와 비교표 자세히 보기</MoreLink>
        </div>
      </section>

      <section aria-labelledby="areas" className="wrap py-16 sm:py-20">
        <SectionHeading eyebrow="Areas" id="areas" title="대구 주요 상권과 가까운 역">
          제휴 매장은 수성구에 있으며, 대구 다른 상권에서 이동하실 때 참고할 수 있도록 가까운 도시철도역을 정리했습니다.
        </SectionHeading>
        <AreasPreview />
        <MoreLink href="/guide/daegu-areas/">지역별 특징과 귀가 팁 보기</MoreLink>
      </section>

      <section aria-labelledby="faq" className="wrap py-16 sm:py-20">
        <SectionHeading eyebrow="FAQ" id="faq" title="자주 묻는 질문" />
        <FaqList items={faq} />
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
