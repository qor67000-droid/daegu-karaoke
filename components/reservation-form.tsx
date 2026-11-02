"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";

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
}

const DAY = ["일", "월", "화", "수", "목", "금", "토"];
const TIMES = (() => {
  const t: string[] = [];
  for (let h = 17; h <= 28; h++) for (const m of [0, 30]) t.push(`${String(h % 24).padStart(2, "0")}:${m ? "30" : "00"}`);
  return t;
})();
const PEOPLE = [...Array.from({ length: 15 }, (_, i) => `${i + 1}명`), "16명 이상"];

function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

type Method = "sms" | "kakao" | "line" | "telegram" | "call";
const METHOD_LABEL: Record<Method, string> = { sms: "문자", kakao: "카카오톡", line: "LINE", telegram: "텔레그램", call: "전화" };

/** 오늘·내일·이번 토요일(오늘이 토요일이면 다음 토요일) */
function quickDates(today: string) {
  const base = new Date(`${today}T00:00:00`);
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const add = (n: number) => {
    const d = new Date(base);
    d.setDate(d.getDate() + n);
    return d;
  };
  const toSat = (6 - base.getDay() + 7) % 7 || 7;
  return [
    { key: "today", label: "오늘", value: fmt(base) },
    { key: "tomorrow", label: "내일", value: fmt(add(1)) },
    { key: "saturday", label: `토요일 ${add(toSat).getMonth() + 1}/${add(toSat).getDate()}`, value: fmt(add(toSat)) },
  ];
}

export function buildMessage(v: { date: string; time: string; people: string; note: string; method?: Method }) {
  const d = v.date ? new Date(`${v.date}T00:00:00`) : null;
  const dateLabel = d && !Number.isNaN(d.getTime()) ? `${v.date} (${DAY[d.getDay()]})` : v.date;
  return [
    "[대구 가라오케 예약 문의]",
    `날짜: ${dateLabel}`,
    `시간: ${v.time}`,
    `인원: ${v.people}`,
    `요청사항: ${v.note.trim() || "없음"}`,
    ...(v.method ? [`희망 연락 방식: ${METHOD_LABEL[v.method]}`] : []),
    "예약 가능 여부 확인 후 연락 부탁드립니다.",
  ].join("\n");
}

export function ReservationForm({ smsNumber, phone, kakaoUrl, lineUrl, telegramUrl }: ReservationFormProps) {
  const [method, setMethod] = useState<Method>("sms");
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
    setIos(/iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) && "ontouchend" in document);
  }, []);

  const errors = {
    date: !date ? "방문 날짜를 선택하세요." : minDate && date < minDate ? "오늘 이후 날짜를 선택하세요." : "",
    time: !time ? "방문 시간을 선택하세요." : "",
    people: !people ? "인원을 선택하세요." : "",
    adult: !adult ? "만 19세 이상만 문의할 수 있습니다." : "",
  };
  const valid = !Object.values(errors).some(Boolean);
  const message = useMemo(() => buildMessage({ date, time, people, note, method }), [date, time, people, note, method]);
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
      ? { href: smsHref, label: "문자 앱에서 예약 문의 보내기", track: "click_sms_reservation", onClick: (e) => guard(e) }
      : method === "call"
        ? { href: `tel:${(phone ?? "").replace(/[^0-9+]/g, "")}`, label: `전화로 예약 문의 (${phone})`, track: "click_call_reservation" }
        : {
            href: messengerUrl[method] ?? "#",
            label: `내용 복사 후 ${METHOD_LABEL[method]} 열기`,
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
    <form className="card space-y-6 p-6 sm:p-8" onSubmit={(e) => e.preventDefault()} noValidate aria-describedby="rsv-notice">
      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block text-sm">
          방문 날짜 <span className="text-gold">*</span>
          <input type="date" name="date" className={field} value={date} min={minDate} onChange={(e) => setDate(e.target.value)} required />
          {minDate && (
            <span className="mt-2 flex gap-2" role="group" aria-label="빠른 날짜 선택">
              {quickDates(minDate).map((q) => (
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
          방문 시간 <span className="text-gold">*</span>
          <select name="time" className={field} value={time} onChange={(e) => setTime(e.target.value)} required>
            <option value="">시간 선택</option>
            {TIMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {err(errors.time)}
        </label>
        <label className="block text-sm">
          인원 <span className="text-gold">*</span>
          <select name="people" className={field} value={people} onChange={(e) => setPeople(e.target.value)} required>
            <option value="">인원 선택</option>
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
        요청사항 <span className="text-mute">(선택, 300자 이내)</span>
        <textarea
          name="note"
          maxLength={300}
          rows={3}
          className={`${field} py-3`}
          placeholder="예: 룸 크기, 도착 예정 시간 변동 가능성 등"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input type="checkbox" name="adult" className="h-5 w-5 accent-[#c9a96b]" checked={adult} onChange={(e) => setAdult(e.target.checked)} />
        방문 인원 모두 만 19세 이상입니다.
      </label>
      {err(errors.adult)}

      <fieldset>
        <legend className="text-sm">
          연락 방식 <span className="text-gold">*</span>
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
              {METHOD_LABEL[m]}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <p className="text-sm text-mute">보낼 문의 내용 미리보기</p>
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
          문의 내용 복사
        </button>
      </div>
      {method === "call" && (
        <p className="text-sm text-mute" role="note">
          통화 연결 후 위 미리보기의 날짜·시간·인원·요청사항을 말씀해 주세요.
        </p>
      )}
      {copied === "ok" && (
        <p className="text-sm text-gold-2" role="status">
          문의 내용을 복사했습니다. {method === "sms" || method === "call" ? "메신저" : METHOD_LABEL[method]} 대화창에 붙여넣어 보내 주세요.
        </p>
      )}
      {copied === "fail" && (
        <p className="text-sm text-red-300" role="status">
          자동 복사가 되지 않았습니다. 미리보기 내용을 길게 눌러 직접 복사해 주세요.
        </p>
      )}
      <p id="rsv-notice" className="rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm text-ivory/85">
        이 화면은 입력 내용을 저장하거나 전송하지 않습니다. 버튼을 누르면 문자 앱·메신저·전화가 열리며, <strong>직접 전송하거나 통화하셔야 문의가 전달</strong>
        됩니다. 예약은 운영자가 제휴 매장의 예약 가능 여부를 확인한 뒤 연락드려 <strong>고객님과 확인 후 확정</strong>됩니다.
      </p>
    </form>
  );
}
