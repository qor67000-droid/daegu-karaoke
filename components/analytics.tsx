"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * [data-track] 요소 클릭을 GA4 이벤트로 보낸다.
 * 이벤트: click_call, click_kakao, click_sms, click_directions, click_reservation
 * 주의: 이것은 "클릭"이며 실제 예약 성사가 아니다. 성사 건수는 매장 예약 장부와 별도 대조한다.
 */
export function ClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      if (!el) return;
      const name = el.dataset.track!;
      // page_language: 한국어/외국어 페이지 성과를 GA4에서 나눠 보기 위한 값 (<html lang>)
      const params = { link_url: el.getAttribute("href") ?? "", page_path: location.pathname, page_language: document.documentElement.lang };
      if (typeof window.gtag === "function") window.gtag("event", name, params);
      else (window.dataLayer ||= []).push({ event: name, ...params });
    };
    document.addEventListener("click", onClick);
    (window as unknown as { __clickTrackerReady?: boolean }).__clickTrackerReady = true;
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
