import Link from "next/link";
import { operator, partners, reservationReady, intlPhone } from "@/lib/site";
import { faqLd, websiteLd } from "@/lib/seo";
import { CONTENT } from "@/lib/i18n";
import { FORM_TEXT } from "@/lib/i18n/form-text";
import { localePath, type IntlLocaleKey } from "@/lib/i18n/locales";
import type { LocaleContent } from "@/lib/i18n/types";
import { AmbientArt, JsonLd, SectionHeading } from "@/components/ui";
import { OperatorButtons, QuickContact } from "@/components/contact";
import { FaqList } from "@/components/sections";
import { ReservationForm } from "@/components/reservation-form";

/**
 * 외국어 홈·예약 페이지. 문구는 전부 lib/i18n/content/{locale}.ts 에서 가져온다.
 * 사실 정보(연락처·제휴 매장 주소·법적 영업 범위)는 한국어 페이지와 같은 출처(config/site.ts, 시행령)를 쓴다.
 */

const fill = (s: string) => s.replace("{intl}", intlPhone(operator.phone));

function operatorLabels(locale: IntlLocaleKey) {
  const m = FORM_TEXT[locale].methods;
  return { call: m.call, sms: m.sms, kakao: m.kakao, line: m.line, telegram: m.telegram };
}

function Compare({ c }: { c: LocaleContent }) {
  const h = c.home.compareHead;
  const rows = [c.types.yuheung, c.types.danran, c.types.noraebang];
  return (
    <>
      <ul className="grid gap-4 sm:hidden">
        {rows.map((v, i) => (
          <li key={v.korean} className={`card p-5 ${i < 2 ? "border-gold/50" : ""}`}>
            <p className="font-semibold text-ivory">
              {v.name} <span className="text-sm font-normal text-mute">({v.korean})</span>
            </p>
            <dl className="mt-3 grid grid-cols-[6.5rem_1fr] gap-x-3 gap-y-1.5 text-sm">
              <dt className="text-mute">{h.law}</dt><dd>{v.law}</dd>
              <dt className="text-mute">{h.alcohol}</dt><dd>{v.alcohol}</dd>
              <dt className="text-mute">{h.staff}</dt><dd>{v.staff}</dd>
              <dt className="text-mute">{h.sing}</dt><dd>{v.sing}</dd>
              <dt className="text-mute">{h.youth}</dt><dd>{v.youth}</dd>
            </dl>
          </li>
        ))}
      </ul>
      <div className="hidden sm:block">
        <table className="w-full border-separate border-spacing-0 text-left text-sm">
          <caption className="sr-only">{c.home.compareTitle}</caption>
          <thead>
            <tr className="text-xs tracking-widest text-mute">
              {[h.type, h.law, h.alcohol, h.staff, h.sing, h.youth].map((x) => (
                <th key={x} scope="col" className="border-b border-line px-3 py-3 font-medium first:pl-0">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((v, i) => (
              <tr key={v.korean} className={i < 2 ? "text-ivory" : "text-mute"}>
                <th scope="row" className="border-b border-line py-4 pr-3 font-semibold text-ivory">
                  {v.name}
                  <span className="block text-xs font-normal text-mute">{v.korean}</span>
                </th>
                <td className="border-b border-line px-3 py-4">{v.law}</td>
                <td className="border-b border-line px-3 py-4">{v.alcohol}</td>
                <td className="border-b border-line px-3 py-4">{v.staff}</td>
                <td className="border-b border-line px-3 py-4">{v.sing}</td>
                <td className="border-b border-line px-3 py-4">{v.youth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ───────────────────────── 홈 ───────────────────────── */
export function LocaleHome({ locale }: { locale: IntlLocaleKey }) {
  const c = CONTENT[locale];
  const h = c.home;
  const rsv = reservationReady();
  const rsvPath = localePath(locale, "reservation");
  return (
    <>
      <JsonLd data={websiteLd(locale)} />
      <JsonLd data={faqLd(c.faq)} />
      <section className="grain relative isolate overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="wrap grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="eyebrow mb-5">{h.eyebrow}</p>
            <h1 className="h-display text-[2.1rem] leading-[1.22] sm:text-5xl lg:text-[3.3rem]">
              {h.h1[0]}{" "}
              <br />
              <span className="text-gold-2">{h.h1[1]}</span>
            </h1>
            <div className="mt-6 max-w-xl text-[1.05rem] text-mute">
              <p>{h.lead[0]}</p>
              {h.lead.slice(1).map((p) => (
                <p key={p} className="mt-3 text-sm">
                  {p}
                </p>
              ))}
            </div>
            {rsv && (
              <div className="mt-9 space-y-4">
                <Link
                  href={rsvPath}
                  className="group inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-gold bg-gradient-to-r from-gold-2 to-gold px-8 text-base font-bold text-ink shadow-[0_10px_30px_-10px_rgba(201,169,107,0.6)] sm:w-auto"
                  data-track="click_reservation_hero"
                  data-testid="hero-reservation"
                >
                  {h.cta}
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
                <div>
                  <p className="mb-2 text-xs tracking-widest text-mute">{h.quickLabel}</p>
                  <QuickContact labels={h.quick} />
                </div>
                <div data-testid="hero-types">
                  <p className="mb-2 text-xs tracking-widest text-mute">{h.typesLabel}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["yuheung", "danran"] as const).map((k) => (
                      <Link
                        key={k}
                        href={`${rsvPath}?type=${k}`}
                        className="rounded-xl border border-gold/50 bg-ink/60 px-4 py-3 text-sm hover:border-gold"
                        data-track={`click_reservation_type_${k}`}
                        data-testid={`hero-type-${k}`}
                      >
                        <span className="block font-semibold text-ivory">{c.types[k].name}</span>
                        <span className="text-xs text-mute">{h.typeShort[k]}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-md lg:max-w-none">
            <AmbientArt className="h-full w-full" />
          </div>
        </div>
      </section>

      {rsv && (
        <section aria-labelledby="reservation" className="wrap pt-4 pb-16 sm:pb-20">
          <div className="card grain p-8 sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start">
              <div>
                <p className="eyebrow mb-3">Reservation</p>
                <h2 id="reservation" className="h-display text-[1.65rem] leading-snug sm:text-4xl">
                  {h.reservationTitle}
                </h2>
                <div className="gold-rule mt-5" />
                <p className="mt-5 text-mute">{h.reservationBody}</p>
                <Link href={rsvPath} className="btn-gold mt-7" data-track="click_reservation_section">
                  {h.reservationCta}
                </Link>
              </div>
              <ol className="space-y-3">
                {h.reservationSteps.map(([t, d], i) => (
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
              <OperatorButtons set="all" labels={operatorLabels(locale)} />
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="intent" className="wrap py-16 sm:py-20">
        <SectionHeading eyebrow="Venue types" id="intent" title={h.typesTitle}>
          {h.typesIntro}
        </SectionHeading>
        <div className="grid gap-5 lg:grid-cols-2">
          {(["yuheung", "danran"] as const).map((k) => {
            const v = c.types[k];
            return (
              <article key={k} className="card border-gold/40 p-6 sm:p-8" data-testid={`type-${k}`}>
                <p className="eyebrow mb-2">{v.law}</p>
                <h3 className="h-display text-2xl">
                  {v.name} <span className="text-base text-mute">({v.korean})</span>
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-mute">
                  {v.points.map((p) => (
                    <li key={p}>· {p}</li>
                  ))}
                </ul>
                {rsv && (
                  <Link href={`${rsvPath}?type=${k}`} className="btn-gold mt-6" data-track={`click_reservation_intent_${k}`}>
                    {v.cta}
                  </Link>
                )}
              </article>
            );
          })}
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-line bg-ink/60 p-5 text-sm text-mute">
            <h3 className="font-semibold text-ivory">{h.nameNoteTitle}</h3>
            <p className="mt-1">{h.nameNote}</p>
          </div>
          <div className="rounded-xl border border-line bg-ink/60 p-5 text-sm text-mute">
            <h3 className="font-semibold text-ivory">{h.noraebangTitle}</h3>
            <p className="mt-1">{h.noraebang}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="compare" className="border-y border-line bg-ink-2/60 py-16 sm:py-20">
        <div className="wrap">
          <SectionHeading eyebrow="Compare" id="compare" title={h.compareTitle}>
            {h.compareIntro}
          </SectionHeading>
          <Compare c={c} />
        </div>
      </section>

      <section aria-labelledby="contact" className="wrap py-16 sm:py-20">
        <SectionHeading eyebrow="Contact" id="contact" title={h.contactTitle}>
          {h.contactIntro}
        </SectionHeading>
        {rsv && <OperatorButtons set="all" labels={operatorLabels(locale)} />}
        <ul className="mt-6 space-y-2 text-sm text-mute">
          <li>· {h.languageNote}</li>
          <li>· {fill(h.intlPhone)}</li>
        </ul>
      </section>

      <section aria-labelledby="steps" className="wrap py-16 sm:py-20">
        <SectionHeading eyebrow="Before you go" id="steps" title={h.tipsTitle} />
        <ul className="grid gap-4 sm:grid-cols-2">
          {h.tips.map((t) => (
            <li key={t} className="card p-5 text-sm text-mute">
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq" className="wrap py-16 sm:py-20">
        <SectionHeading eyebrow="FAQ" id="faq" title={h.faqTitle} />
        <FaqList items={c.faq} />
      </section>
    </>
  );
}

/* ───────────────────────── 예약 문의 ───────────────────────── */
export function LocaleReservation({ locale }: { locale: IntlLocaleKey }) {
  const c = CONTENT[locale];
  const r = c.rsv;
  const p = partners[0];
  const mapUrl = p ? `https://map.kakao.com/?q=${encodeURIComponent(p.mapQuery)}` : null;
  return (
    <>
      <JsonLd data={faqLd(r.faq)} />
      <div className="grain">
        <nav aria-label="Breadcrumb" className="wrap pt-28 text-xs text-mute">
          <ol className="flex gap-2">
            <li>
              <Link href={localePath(locale, "home")} className="hover:text-ivory">
                {c.ui.home}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ivory/80">
              {c.ui.reservation}
            </li>
          </ol>
        </nav>
        <header className="wrap pt-8 pb-12 sm:pb-16">
          <h1 className="h-display text-[2rem] leading-tight sm:text-5xl">{r.h1}</h1>
          <div className="gold-rule mt-6" />
          <p className="mt-6 max-w-2xl text-mute">{r.lead}</p>
        </header>
      </div>
      <div className="wrap space-y-16">
        {reservationReady() && operator.smsNumber && (
          <section aria-labelledby="form">
            <SectionHeading id="form" title={r.formTitle} />
            <ReservationForm
              locale={locale}
              smsNumber={operator.smsNumber}
              phone={operator.phone}
              kakaoUrl={operator.kakaoUrl}
              lineUrl={operator.lineUrl}
              telegramUrl={operator.telegramUrl}
            />
          </section>
        )}
        <section aria-labelledby="direct">
          <SectionHeading id="direct" title={r.directTitle}>
            {c.home.languageNote}
          </SectionHeading>
          <OperatorButtons set="all" labels={operatorLabels(locale)} />
          <p className="mt-4 text-sm text-mute">{fill(c.home.intlPhone)}</p>
        </section>
        <section aria-labelledby="flow">
          <SectionHeading id="flow" title={r.stepsTitle} />
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {r.steps.map((s, i) => (
              <li key={s.title} className="card p-5">
                <span className="h-display text-2xl text-gold/80">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-mute">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>
        {p && (
          <section aria-labelledby="partner">
            <SectionHeading id="partner" title={r.partnerTitle}>
              {r.partnerIntro}
            </SectionHeading>
            <div className="card grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <dl className="space-y-3">
                <div>
                  <dt className="eyebrow mb-1">{r.partnerAddress}</dt>
                  <dd className="text-lg">{r.partnerAddressLocal}</dd>
                  <dd className="text-sm text-mute" lang="ko">
                    {p.address}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow mb-1">{r.partnerLicense}</dt>
                  <dd className="text-sm" data-testid="partner-license">
                    {p.licenseVerified && p.licenseType ? p.licenseType : r.partnerLicensePending}
                  </dd>
                </div>
                <div>
                  <dd className="text-sm text-mute">{r.partnerInfo}</dd>
                </div>
              </dl>
              {mapUrl && (
                <a href={mapUrl} target="_blank" rel="noopener" className="btn-ghost" data-track="click_directions">
                  {r.map}
                </a>
              )}
            </div>
            <p className="mt-4 text-sm text-mute" data-testid="partner-disclaimer">
              {r.partnerDisclaimer}
            </p>
          </section>
        )}
        <section aria-labelledby="rsv-faq">
          <SectionHeading id="rsv-faq" title={r.faqTitle} />
          <FaqList items={r.faq} />
        </section>
      </div>
    </>
  );
}
