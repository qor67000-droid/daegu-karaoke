import type { NextConfig } from "next";

/**
 * GitHub Pages 정적 export 설정
 * - basePath/assetPrefix: 프로젝트 사이트(https://<user>.github.io/<repo>)면 "/<repo>", 커스텀 도메인이면 "".
 *   deploy.yml이 actions/configure-pages 출력(base_path)을 NEXT_PUBLIC_BASE_PATH로 전달한다.
 * - trailingSlash: /guide/ → out/guide/index.html. GitHub Pages가 /guide 요청을 /guide/로 301 처리하므로
 *   canonical·sitemap·내부 링크를 모두 끝 슬래시 형태로 통일한다.
 * - images.unoptimized: Pages에는 이미지 최적화 서버가 없으므로 scripts/optimize-images.ts로 AVIF/WebP를 미리 만든다.
 */
const raw = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim().replace(/^\/+|\/+$/g, "");
const basePath = raw ? `/${raw}` : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;
