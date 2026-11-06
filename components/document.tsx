import type { ReactNode } from "react";
import { site, isProduction } from "@/lib/site";
import { Header, Footer, LocaleHeader, LocaleFooter } from "@/components/layout-parts";
import { MobileCtaBar } from "@/components/contact";
import { ClickTracker } from "@/components/analytics";
import { GA4 } from "@/components/ga4";
import { CONTENT } from "@/lib/i18n";
import { getLocale, type LocaleKey } from "@/lib/i18n/locales";

const gaId = process.env.NEXT_PUBLIC_GA4_ID || site.ga4Id;

/**
 * GitHub Pages는 응답 헤더를 설정할 수 없으므로 meta로 가능한 보안 정책만 적용한다.
 * (X-Frame-Options, HSTS 헤더 등은 불가 → reports/compliance.md 참고)
 * Next 정적 export는 인라인 스크립트를 쓰므로 script-src에 'unsafe-inline'이 필요하다.
 */
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${gaId ? " https://www.googletagmanager.com" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data:${gaId ? " https://www.google-analytics.com https://www.googletagmanager.com" : ""}`,
  "font-src 'self'",
  `connect-src 'self'${gaId ? " https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

/**
 * 언어별 HTML 문서 틀. 한국어(app/(ko)/layout.tsx)·외국어(app/[locale]/layout.tsx)·404 가 공유한다.
 * <html lang> 은 언어마다 다르므로 언어별 루트 레이아웃에서 이 컴포넌트를 렌더링한다.
 */
export function SiteDocument({ locale, children }: { locale: LocaleKey; children: ReactNode }) {
  const l = getLocale(locale);
  return (
    <html lang={l.htmlLang}>
      <head>{isProduction && <meta httpEquiv="Content-Security-Policy" content={CSP} />}</head>
      <body data-locale={locale}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-ink"
        >
          {locale === "ko" ? "본문 바로가기" : CONTENT[locale].ui.skipToContent}
        </a>
        {locale === "ko" ? <Header /> : <LocaleHeader locale={locale} />}
        <main id="main">{children}</main>
        {locale === "ko" ? <Footer /> : <LocaleFooter locale={locale} />}
        <MobileCtaBar locale={locale} />
        <ClickTracker />
        {isProduction && gaId && <GA4 id={gaId} />}
      </body>
    </html>
  );
}
