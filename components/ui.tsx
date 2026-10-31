import Link from "next/link";
import type { ReactNode } from "react";
import { asset, isDev } from "@/lib/site";
import { breadcrumbTrail } from "@/lib/seo";
import type { RouteDef } from "@/lib/routes";

/** 개발 서버에서만 보이는 미정 표시. 미리보기·프로덕션에서는 아무것도 렌더링하지 않는다. */
export function Pending({ label }: { label: string }) {
  if (!isDev) return null;
  return <span className="pending" data-pending="true">[미정: {label}]</span>;
}

export function JsonLd({ data }: { data: object | null }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      // JSON.stringify 결과에서 </script> 주입을 막는다
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  id,
  as: Tag = "h2",
  children,
}: {
  eyebrow?: string;
  title: string;
  id?: string;
  as?: "h1" | "h2";
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 sm:mb-10">
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <Tag id={id} className="h-display text-[1.65rem] leading-snug sm:text-4xl">
        {title}
      </Tag>
      <div className="gold-rule mt-5" />
      {children && <div className="mt-5 max-w-2xl text-mute">{children}</div>}
    </div>
  );
}

export function MoreLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="link-more mt-6">
      {children}
      <span aria-hidden="true">→</span>
    </Link>
  );
}

export function Breadcrumbs({ route }: { route: RouteDef }) {
  const trail = breadcrumbTrail(route);
  return (
    <nav aria-label="현재 위치" className="wrap pt-28 text-xs text-mute sm:pt-32">
      <ol className="flex flex-wrap items-center gap-2">
        {trail.map((r, i) => (
          <li key={r.path} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {i < trail.length - 1 ? (
              <Link href={r.path} className="hover:text-ivory">
                {r.path === "/" ? "홈" : r.nav}
              </Link>
            ) : (
              <span aria-current="page" className="text-ivory">
                {r.path === "/" ? "홈" : r.nav}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** 사진이 없을 때 쓰는 브랜드 분위기 그래픽 (실제 시설 사진처럼 보이지 않는 추상 패턴) */
export function AmbientArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 600"
      className={className}
      role="img"
      aria-label="음파를 형상화한 금색 장식 그래픽"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#e3c992" stopOpacity="0.9" />
          <stop offset="1" stopColor="#c9a96b" stopOpacity="0.05" />
        </linearGradient>
        <radialGradient id="g2" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#4b1626" stopOpacity="0.7" />
          <stop offset="1" stopColor="#0b0a0d" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="600" height="600" fill="url(#g2)" />
      {Array.from({ length: 9 }).map((_, i) => (
        <circle
          key={i}
          cx="300"
          cy="300"
          r={40 + i * 30}
          fill="none"
          stroke="url(#g1)"
          strokeWidth={i % 3 === 0 ? 1.4 : 0.6}
          opacity={1 - i * 0.09}
        />
      ))}
      {Array.from({ length: 23 }).map((_, i) => {
        const h = 18 + Math.abs(Math.sin(i * 0.9)) * 120;
        return <rect key={`b${i}`} x={130 + i * 15} y={300 - h / 2} width="4" height={h} rx="2" fill="#c9a96b" opacity="0.55" />;
      })}
    </svg>
  );
}

export function Picture({
  file,
  alt,
  width,
  height,
  priority = false,
  className = "",
}: {
  file: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}) {
  const sizes = "(min-width: 1024px) 50vw, 100vw";
  return (
    <picture>
      <source type="image/avif" srcSet={`${asset(`/images/${file}-800.avif`)} 800w, ${asset(`/images/${file}.avif`)} 1600w`} sizes={sizes} />
      <source type="image/webp" srcSet={`${asset(`/images/${file}-800.webp`)} 800w, ${asset(`/images/${file}.webp`)} 1600w`} sizes={sizes} />
      <img
        src={asset(`/images/${file}.jpg`)}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={className}
      />
    </picture>
  );
}
