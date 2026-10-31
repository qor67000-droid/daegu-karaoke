import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "페이지를 찾을 수 없습니다" },
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="wrap grain flex min-h-[70vh] flex-col items-start justify-center pt-28">
      <p className="eyebrow mb-4">404</p>
      <h1 className="h-display text-4xl sm:text-5xl">페이지를 찾을 수 없습니다</h1>
      <p className="mt-5 text-mute">주소가 바뀌었거나 삭제된 페이지입니다.</p>
      <Link href="/" className="btn-gold mt-8">
        홈으로
      </Link>
    </section>
  );
}
