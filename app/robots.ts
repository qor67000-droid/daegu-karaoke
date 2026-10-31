import type { MetadataRoute } from "next";
import { absoluteUrl, isProduction } from "@/lib/site";

export const dynamic = "force-static";

/**
 * - 프로덕션: 전체 크롤링 허용 + 사이트맵 선언. 업체 미공개 페이지는 Disallow가 아니라 meta noindex로 제외한다
 *   (Disallow하면 크롤러가 noindex를 읽지 못해 URL만 색인될 수 있음).
 * - 미리보기: 전체 차단.
 * 참고: https://<user>.github.io/<repo>/robots.txt 는 호스트 루트가 아니어서 크롤러가 읽지 않는다.
 *       프로젝트 사이트에서는 meta robots가 실제 색인 제어 수단이며, 커스텀 도메인 연결 시 robots.txt가 유효해진다.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isProduction) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
