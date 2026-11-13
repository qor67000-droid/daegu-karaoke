import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { site, operator, baseUrl, brand } from "@/lib/site";

/**
 * 루트 레이아웃은 children 만 넘긴다.
 * <html lang> 이 언어마다 달라야 하므로 실제 문서 틀은 언어별 레이아웃이 렌더링한다.
 *  - app/(ko)/layout.tsx       : 한국어 (기존 URL 그대로: /, /guide/…, /reservation/)
 *  - app/[locale]/layout.tsx   : /ja/ /en/ /zh-cn/ /zh-tw/ /zh-hk/
 *  - app/not-found.tsx         : 404 (한국어 문서 틀을 직접 렌더링)
 */
export const metadata: Metadata = {
  metadataBase: new URL(baseUrl() + "/"),
  applicationName: brand() || operator.serviceName,
  formatDetection: { telephone: false },
  referrer: "strict-origin-when-cross-origin",
  verification: {
    ...(site.verification.google ? { google: site.verification.google } : {}),
    ...(site.verification.naver ? { other: { "naver-site-verification": site.verification.naver } } : {}),
  },
  // 파비콘은 파일 규칙(app/favicon.ico, app/icon.png, app/apple-icon.png — DK 로고)으로 제공
  // → Next가 basePath를 포함한 <link rel="icon">·<link rel="apple-touch-icon">을 모든 페이지(모든 언어)에 생성
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0a0d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
