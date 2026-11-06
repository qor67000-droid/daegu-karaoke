import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { localeFromSegment, localePath, publishedIntlLocales } from "@/lib/i18n/locales";
import { LocaleReservation } from "@/components/locale-pages";

export const dynamicParams = false;
export function generateStaticParams() {
  return publishedIntlLocales().map((l) => ({ locale: l.segment }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const key = localeFromSegment((await params).locale);
  return key ? buildMetadata(localePath(key, "reservation")) : {};
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const key = localeFromSegment((await params).locale);
  if (!key) notFound();
  return <LocaleReservation locale={key} />;
}
