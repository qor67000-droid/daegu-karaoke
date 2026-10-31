// 오프라인 검증용 클라이언트 번들: 실제 components/analytics.tsx 의 ClickTracker를 브라우저에서 실행
import { createRoot } from "react-dom/client";
import { ClickTracker } from "@/components/analytics";

const el = document.createElement("div");
el.hidden = true;
document.body.appendChild(el);
createRoot(el).render(<ClickTracker />);
