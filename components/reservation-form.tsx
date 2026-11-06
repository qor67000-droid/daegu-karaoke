"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import type { LocaleKey } from "@/lib/i18n/locales";
import { FORM_TEXT, buildInquiry, type FormText, type Method, type VenueTypeKey } from "@/lib/i18n/form-text";

/**
 * 예약 문의 작성기 (GitHub Pages — 서버 없음)
 * - 입력값을 저장하거나 어디로도 전송하지 않는다.
 * - "문자로 예약 문의"를 누르면 입력 내용이 담긴 문자 작성 화면(sms:)이 열리고, 전송은 고객이 직접 한다.
 * - 카카오톡·LINE·텔레그램은 본문을 미리 채울 수 없으므로 "문의 내용 복사" 후 붙여넣기 방식.
 * - 예약 확정은 운영자가 제휴 매장 가능 여부를 확인한 뒤 고객과 연락해 진행한다.
 */

export interface ReservationFormProps {
  smsNumber: string;
  phone: string | null;
  kakaoUrl: string | null;
  lineUrl: string | null;
  telegramUrl: string | null;
  /** 화면·메시지 언어 (기본 ko = 기존 /reservation/ 그대로) */
  locale?: LocaleKey;
}

const TIMES = (() => {
  const t: string[] = [];
  for (let h = 17; h <= 28; h++) for (const m of [0, 30]) t.push(`${String(h % 24).padStart(2, "0")}:${m ? "30" : "00"}`);
  return t;
})();

function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

/** 오늘·내일·이번 토요일(오늘이 토요일이면 다음 토요일) */
function quickDates(today: string, t: FormText) {
  const base = new Date(`${today}T00:00:00`);
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const add = (n: number) => {
    const d = new Date(base);
    d.setDate(d.getDate() + n);
    return d;
  };
  const toSat = (6 - base.getDay() + 7) % 7 || 7;
  return [
    { key: "today", label: t.today, value: fmt(base) },
    { key: "tomorrow", label: t.tomorrow, value: fmt(add(1)) },
    { key: "saturday", label: `${t.saturday} ${add(toSat).getMonth() + 1}/${add(toSat).getDate()}`, value: fmt(add(toSat)) },
  ];
}

export const VENUE_TYPE_KEYS: VenueTypeKey[] = ["yuheung", "danran", "any"];

export function ReservationForm({ smsNumber, phone, kakaoUrl, lineUrl, telegramUrl, locale = "ko" }: ReservationFormProps) {
  const t = FORM_TEXT[locale];
  const PEOPLE = useMemo(() => [...Array.from({ length: 15 }, (_, i) => t.peopleUnit(i + 1)), t.peopleMax], [t]);
  const [method, setMethod] = useState<Method>("sms");
  const [venueType, setVenueType] = useState<VenueTypeKey>("any");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [people, setPeople] = useState("");
  const [note, setNote] = useState("");
  const [adult, setAdult] = useState(false);
  const [minDate, setMinDate] = useState<string | undefined>(undefined);
  const [ios, setIos] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [copied, setCopied] = useState<"" | "ok" | "fail">("");

  useEffect(() => {
    setMinDate(todayISO());
    const q = new URLSearchParams(window.location.search).get("type");
    if (q === "yuheung" || q === "danran") setVenueType(q);
    setIos(/iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) && "ontouchend" in document);
  }, []);

  const errors = {
    date: !date ? t.errDate : minDate && date < minDate ? t.errDateFuture : "",
    time: !time ? t.errTime : "",
    people: !people ? t.errPeople : "",
    adult: !adult ? t.errAdult : "",
  };
  const valid = !Object.values(errors).some(Boolean);
  const message = useMemo(() => buildInquiry(locale, { venueType, date, time, people, note, method }), [locale, venueType, date, time, people, note, method]);
  // iOS는 sms:번호&body=, 그 외(안드로이드 등)는 sms:번호?body=
  const smsHref = `sms:${smsNumber}${ios ? "&" : "?"}body=${encodeURIComponent(message)}`;

  const guard = (e: MouseEvent) => {
    if (!valid) {
      e.preventDefault();
      setShowErrors(true);
    }
  };
  const messengerUrl: Record<"kakao" | "line" | "telegram", string | null> = { kakao: kakaoUrl, line: lineUrl, telegram: telegramUrl };
  const methods: Method[] = ["sms", ...(["kakao", "line", "telegram"] as const).filter((m) => messengerUrl[m]), ...(phone ? (["call"] as const) : [])];
  const primary: { href: string; label: string; track: string; external?: boolean; onClick?: (e: MouseEvent) => void } =
    method === "sms"
      ? { href: smsHref, label: t.submitSms, track: "click_sms_reservation", onClick: (e) => guard(e) }
      : method === "call"
        ? { href: `tel:${(phone ?? "").replace(/[^0-9+]/g, "")}`, label: t.submitCall(phone ?? ""), track: "click_call_reservation" }
        : {
            href: messengerUrl[method] ?? "#",
            label: t.submitMessenger(t.methods[method]),
            track: `click_${method}_reservation`,
            external: true,
            onClick: (e) => {
              if (!valid) return guard(e);
              navigator.clipboard?.writeText(message).then(
                () => setCopied("ok"),
                () => setCopied("fail"),
              );
            },
          };

  const copy = async () => {
    if (!valid) {
      setShowErrors(true);
      return;
    }
    try {
      await navigator.clipboard.writeText(message);
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
  };

  const field = "mt-2 block min-h-12 w-full rounded-xl border border-line bg-ink-3 px-4 text-base text-ivory focus:border-gold";
  const err = (m: string) => showErrors && m ? <p className="mt-1.5 text-sm text-red-300" role="alert">{m}</p> : null;

  return (
    <form className="card space-y-6 p-6 sm:p-8" onSubmit={(e) => e.preventDefault()} noValidate aria-describedby="rsv-notice" data-locale={locale}>
      <fieldset>
        <legend className="text-sm">
          {t.typeLegend} <span className="text-gold">*</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" data-testid="rsv-type">
          {VENUE_TYPE_KEYS.map((key) => ({ key, label: t.typeLabels[key] })).map((o) => (
            <label
              key={o.key}
              className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm ${
                venueType === o.key ? "border-gold bg-gold/15 text-gold-2" : "border-line text-ivory/80 hover:border-gold/50"
              }`}
            >
              <input
                type="radio"
                name="venueType"
                value={o.key}
                checked={venueType === o.key}
                onChange={() => setVenueType(o.key)}
                className="sr-only"
                data-testid={`rsv-type-${o.key}`}
              />
              {o.label}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-mute">
          {t.typeHelp}
        </p>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block text-sm">
          {t.date} <span className="text-gold">*</span>
          <input type="date" name="date" className={field} value={date} min={minDate} onChange={(e) => setDate(e.target.value)} required />
          {minDate && (
            <span className="mt-2 flex gap-2" role="group" aria-label={t.quickDates}>
              {quickDates(minDate, t).map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => setDate(q.value)}
                  className={`min-h-10 rounded-full border px-3 text-xs ${date === q.value ? "border-gold bg-gold/15 text-gold-2" : "border-line text-ivory/80"}`}
                  data-testid={`quick-date-${q.key}`}
                >
                  {q.label}
                </button>
              ))}
            </span>
          )}
          {err(errors.date)}
        </label>
        <label className="block text-sm">
          {t.time} <span className="text-gold">*</span>
          <select name="time" className={field} value={time} onChange={(e) => setTime(e.target.value)} required>
            <option value="">{t.timePlaceholder}</option>
            {TIMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {err(errors.time)}
        </label>
        <label className="block text-sm">
          {t.people} <span className="text-gold">*</span>
          <select name="people" className={field} value={people} onChange={(e) => setPeople(e.target.value)} required>
            <option value="">{t.peoplePlaceholder}</option>
            {PEOPLE.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {err(errors.people)}
        </label>
      </div>
      <label className="block text-sm">
        {t.note} <span className="text-mute">{t.noteOptional}</span>
        <textarea
          name="note"
          maxLength={300}
          rows={3}
          className={`${field} py-3`}
          placeholder={t.notePlaceholder}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input type="checkbox" name="adult" className="h-5 w-5 accent-[#c9a96b]" checked={adult} onChange={(e) => setAdult(e.target.checked)} />
        {t.adult}
      </label>
      {err(errors.adult)}

      <fieldset>
        <legend className="text-sm">
          {t.methodLegend} <span className="text-gold">*</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup">
          {methods.map((m) => (
            <label
              key={m}
              className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm ${
                method === m ? "border-gold bg-gold/15 text-gold-2" : "border-line text-ivory/80 hover:border-gold/50"
              }`}
            >
              <input type="radio" name="method" value={m} checked={method === m} onChange={() => setMethod(m)} className="sr-only" />
              {t.methods[m]}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <p className="text-sm text-mute">{t.preview}</p>
        <pre className="mt-2 rounded-xl border border-line bg-ink p-4 text-sm whitespace-pre-wrap text-ivory/90" data-testid="rsv-preview">
          {message}
        </pre>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={primary.href}
          onClick={primary.onClick}
          className="btn-gold min-h-14 px-8 text-base"
          data-track={primary.track}
          data-testid="rsv-submit"
          data-method={method}
          {...(primary.external ? { target: "_blank", rel: "noopener" } : {})}
        >
          {primary.label}
        </a>
        <button type="button" onClick={copy} className="btn-ghost" data-testid="rsv-copy">
          {t.copy}
        </button>
      </div>
      {method === "call" && (
        <p className="text-sm text-mute" role="note">
          {t.callNote}
        </p>
      )}
      {copied === "ok" && (
        <p className="text-sm text-gold-2" role="status">
          {t.copied(method === "sms" || method === "call" ? t.messengerWord : t.methods[method])}
        </p>
      )}
      {copied === "fail" && (
        <p className="text-sm text-red-300" role="status">
          {t.copyFail}
        </p>
      )}
      <p id="rsv-notice" className="rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm text-ivory/85">
        {t.notice[0]}
        <strong>{t.notice[1]}</strong>
        {t.notice[2]}
        <strong>{t.notice[3]}</strong>
        {t.notice[4]}
      </p>
    </form>
  );
}
