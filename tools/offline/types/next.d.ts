// 오프라인 타입검사 전용 최소 선언. 실제 CI는 next 패키지의 정식 타입을 사용한다.
declare module "next" {
  export type Metadata = {
    title?: string | { absolute: string } | { default: string; template: string };
    description?: string;
    metadataBase?: URL;
    applicationName?: string;
    alternates?: { canonical?: string; languages?: Record<string, string> };
    robots?: { index?: boolean; follow?: boolean };
    openGraph?: { type?: "website"; locale?: string; alternateLocale?: string[]; url?: string; siteName?: string; title?: string; description?: string; images?: { url: string; width?: number; height?: number; alt?: string }[] };
    twitter?: { card?: "summary" | "summary_large_image"; title?: string; description?: string };
    verification?: { google?: string; other?: Record<string, string> };
    formatDetection?: { telephone?: boolean };
    referrer?: string;
    icons?: { icon?: string };
  };
  export type Viewport = { width?: string; initialScale?: number; themeColor?: string; colorScheme?: "dark" | "light" };
  export type NextConfig = { output?: "export"; basePath?: string; assetPrefix?: string; trailingSlash?: boolean; poweredByHeader?: boolean; reactStrictMode?: boolean; images?: { unoptimized?: boolean } };
  export namespace MetadataRoute {
    type Sitemap = { url: string; lastModified?: Date | string; changeFrequency?: "monthly" | "weekly" | "daily"; priority?: number }[];
    type Robots = { rules: { userAgent?: string | string[]; allow?: string | string[]; disallow?: string | string[] } | { userAgent?: string | string[]; allow?: string | string[]; disallow?: string | string[] }[]; sitemap?: string | string[]; host?: string };
  }
}
declare module "next/link" {
  const Link: (p: { href: string; className?: string; children?: any; [k: string]: any }) => any;
  export default Link;
}
declare module "next/navigation" {
  export function usePathname(): string;
  export function notFound(): never;
}
