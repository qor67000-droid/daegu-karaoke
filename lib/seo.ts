import type { Metadata } from "next";
import { site, absoluteUrl, brand, fullAddress, SCHEMA_DAY, baseUrl, businessReady } from "@/lib/site";
import { getRoute, isIndexable, routes, type RouteDef } from "@/lib/routes";
import type { FaqItem } from "@/lib/types";

/**
 * 모든 URL은 절대 URL로 만든다.
 * (metadataBase 상대 해석은 /repo 하위 경로를 잃을 수 있어 GitHub Pages 프로젝트 사이트에서 위험)
 */
export function buildMetadata(path: string): Metadata {
  const r = getRoute(path);
  const url = absoluteUrl(path);
  const index = isIndexable(r);
  const ogImage = site.heroPhoto && businessReady() ? absoluteUrl(`/images/${site.heroPhoto.file}.jpg`) : absoluteUrl("/og-default.png");
  return {
    title: { absolute: r.title() },
    description: r.description(),
    alternates: { canonical: url },
    robots: index ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      url,
      siteName: brand() || "대구 가라오케·노래방 가이드",
      title: r.title(),
      description: r.description(),
      images: [{ url: ogImage, width: 1200, height: 630, alt: brand() || "대구 가라오케·노래방 가이드" }],
    },
    twitter: { card: "summary_large_image", title: r.title(), description: r.description() },
  };
}

/* ───────────── JSON-LD ───────────── */

type Json = Record<string, unknown>;

export function websiteLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl()}/#website`,
    url: absoluteUrl("/"),
    name: brand() || "대구 가라오케·노래방 가이드",
    inLanguage: "ko-KR",
  };
}

/** 정보 페이지용 Article (작성자는 사이트 자체, 날짜는 빌드 기준이 아닌 콘텐츠 수정일) */
export function articleLd(path: string, modified: string): Json {
  const r = getRoute(path);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: r.h1(),
    description: r.description(),
    inLanguage: "ko-KR",
    mainEntityOfPage: absoluteUrl(path),
    dateModified: modified,
    publisher: { "@id": `${baseUrl()}/#website` },
  };
}

/**
 * 업체 구조화 데이터.
 * 필수 업체 정보가 모두 확인됐을 때만 생성한다 (부분 정보로 허위 업체를 만들지 않음).
 * 리뷰·별점(aggregateRating/review)은 절대 넣지 않는다.
 */
export function businessLd(): Json | null {
  const addr = fullAddress();
  if (!businessReady() || !site.name || !addr || !site.phone) return null;
  const ld: Json = {
    "@context": "https://schema.org",
    "@type": ["BarOrPub", "EntertainmentBusiness"],
    "@id": `${baseUrl()}/#business`,
    name: site.name,
    url: absoluteUrl("/"),
    telephone: site.phone,
    address: {
      "@type": "PostalAddress",
      addressCountry: "KR",
      addressRegion: site.address.region,
      addressLocality: site.address.district,
      streetAddress: [site.address.street, site.address.detail].filter(Boolean).join(" "),
      ...(site.address.postalCode ? { postalCode: site.address.postalCode } : {}),
    },
  };
  if (site.nameEn) ld.alternateName = site.nameEn;
  if (site.geo) ld.geo = { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng };
  if (site.mapUrl) ld.hasMap = site.mapUrl;
  if (site.hours.length)
    ld.openingHoursSpecification = site.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days.map((d) => SCHEMA_DAY[d]),
      opens: h.opens,
      closes: h.closes,
    }));
  if (site.payment.length) ld.paymentAccepted = site.payment.join(", ");
  if (site.photos.length) ld.image = site.photos.map((p) => absoluteUrl(`/images/${p.file}.jpg`));
  return ld;
}

/** 경로 계층을 따라 breadcrumb 생성: / → /guide/ → /guide/first-visit/ */
export function breadcrumbTrail(r: RouteDef): RouteDef[] {
  const trail: RouteDef[] = [getRoute("/")];
  const parts = r.path.split("/").filter(Boolean);
  let acc = "/";
  for (const p of parts) {
    acc += `${p}/`;
    const hit = routes.find((x) => x.path === acc);
    if (hit) trail.push(hit);
  }
  return trail;
}

export function breadcrumbLd(r: RouteDef): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbTrail(r).map((x, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: x.path === "/" ? "홈" : x.nav,
      item: absoluteUrl(x.path),
    })),
  };
}

/** 화면에 실제로 보이는 FAQ와 동일한 내용만 마크업한다 */
export function faqLd(items: FaqItem[]): Json | null {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}
