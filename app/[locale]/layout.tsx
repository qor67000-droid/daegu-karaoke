import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { SiteDocument } from "@/components/document";
import { localeFromSegment, publishedIntlLocales } from "@/lib/i18n/locales";

/**
 * 외국어 문서 틀: /ja/ /en/ /zh-cn/ /zh-tw/ /zh-hk/
 * published 인 언어만 정적 생성한다 (draft 언어·미정의 세그먼트는 생성하지 않음 → 404).
 */
export const dynamicParams = false;
export function generateStaticParams() {
  return publishedIntlLocales().map((l) => ({ locale: l.segment }));
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const key = localeFromSegment((await params).locale);
  if (!key) notFound();
  return <SiteDocument locale={key}>{children}</SiteDocument>;
}
