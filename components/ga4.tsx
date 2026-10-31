/** GA4 로더 (서버 컴포넌트). 프로덕션 + 측정 ID가 있을 때만 layout에서 렌더링 */
export function GA4({ id }: { id: string }) {
  const init = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(id)},{anonymize_ip:true});`;
  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`} />
      <script dangerouslySetInnerHTML={{ __html: init }} />
    </>
  );
}
