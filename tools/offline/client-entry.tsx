// 오프라인 검증용 클라이언트 번들: 실제 components 의 클라이언트 컴포넌트를 브라우저에서 실행
// (실제 Next 빌드에서는 React hydration이 자동으로 처리한다)
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { ClickTracker } from "@/components/analytics";
import { ReservationForm } from "@/components/reservation-form";
import { operator } from "@/config/site";

const el = document.createElement("div");
el.hidden = true;
document.body.appendChild(el);
createRoot(el).render(<ClickTracker />);

const form = document.querySelector('[data-testid="rsv-submit"]')?.closest("form");
if (form?.parentElement && operator.smsNumber) {
  // 빈 영역이 화면에 그려지지 않도록 분리된 노드에 동기 렌더한 뒤 교체한다
  // (실제 Next 는 hydration 이라 DOM 교체 자체가 없음 — 이 처리는 오프라인 CLS 측정 왜곡을 막기 위한 것)
  const locale = (form.getAttribute("data-locale") || "ko") as Parameters<typeof ReservationForm>[0]["locale"];
  const host = document.createElement("div");
  const root = createRoot(host);
  flushSync(() =>
    root.render(
      <ReservationForm locale={locale} defaultType={(form.getAttribute("data-default-type") || "any") as "yuheung" | "danran" | "any"} smsNumber={operator.smsNumber} phone={operator.phone} kakaoUrl={operator.kakaoUrl} lineUrl={operator.lineUrl} telegramUrl={operator.telegramUrl} />,
    ),
  );
  form.replaceWith(host);
}
