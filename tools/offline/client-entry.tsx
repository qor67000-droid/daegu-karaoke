// 오프라인 검증용 클라이언트 번들: 실제 components 의 클라이언트 컴포넌트를 브라우저에서 실행
// (실제 Next 빌드에서는 React hydration이 자동으로 처리한다)
import { createRoot } from "react-dom/client";
import { ClickTracker } from "@/components/analytics";
import { ReservationForm } from "@/components/reservation-form";
import { operator } from "@/config/site";

const el = document.createElement("div");
el.hidden = true;
document.body.appendChild(el);
createRoot(el).render(<ClickTracker />);

const form = document.querySelector('[data-testid="rsv-submit"]')?.closest("form");
if (form?.parentElement && operator.smsNumber) {
  const host = document.createElement("div");
  form.replaceWith(host);
  createRoot(host).render(
    <ReservationForm smsNumber={operator.smsNumber} phone={operator.phone} kakaoUrl={operator.kakaoUrl} lineUrl={operator.lineUrl} telegramUrl={operator.telegramUrl} />,
  );
}
