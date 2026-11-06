// 오프라인 검증용 next/navigation 대체: 렌더러가 페이지마다 globalThis.__OFFLINE_PATHNAME__ 을 설정한다.
// 실제 Next 와 같이 basePath 를 뺀 경로를 돌려준다. 브라우저에서는 location.pathname 에서 basePath 를 제거한다.
function usePathname() {
  if (typeof window !== "undefined") {
    const raw = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/^\/+|\/+$/g, "");
    const bp = raw ? "/" + raw : "";
    const p = window.location.pathname;
    return bp && p.startsWith(bp) ? p.slice(bp.length) || "/" : p;
  }
  return globalThis.__OFFLINE_PATHNAME__ || "/";
}
function notFound() {
  throw new Error("NEXT_NOT_FOUND");
}
module.exports = { usePathname, notFound };
