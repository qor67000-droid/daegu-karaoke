import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { site, operator, baseUrl, brand, isProduction } from "@/lib/site";
import { Header, Footer } from "@/components/layout-parts";
import { MobileCtaBar } from "@/components/contact";
import { ClickTracker } from "@/components/analytics";
import { GA4 } from "@/components/ga4";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl() + "/"),
  applicationName: brand() || operator.serviceName,
  formatDetection: { telephone: false },
  referrer: "strict-origin-when-cross-origin",
  verification: {
    ...(site.verification.google ? { google: site.verification.google } : {}),
    ...(site.verification.naver ? { other: { "naver-site-verification": site.verification.naver } } : {}),
  },
  // 파비콘은 파일 규칙(app/icon.svg)으로 제공 → Next가 basePath를 포함한 <link rel="icon">을 생성
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0a0d",
  colorScheme: "dark",
};

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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>{isProduction && <meta httpEquiv="Content-Security-Policy" content={CSP} />}</head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-ink"
        >
          본문 바로가기
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <MobileCtaBar />
        <ClickTracker />
        {isProduction && gaId && <GA4 id={gaId} />}
      </body>
    </html>
  );
}
