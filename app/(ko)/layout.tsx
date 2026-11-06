import type { ReactNode } from "react";
import { SiteDocument } from "@/components/document";

/** 한국어 페이지 문서 틀 (URL에 영향 없는 route group) */
export default function KoLayout({ children }: { children: ReactNode }) {
  return <SiteDocument locale="ko">{children}</SiteDocument>;
}
