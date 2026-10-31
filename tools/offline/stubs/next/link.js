// 오프라인 검증용 next/link 대체: 실제 Next와 같이 basePath를 앞에 붙인 <a href> 를 렌더링한다.
const React = require("react");
function withBase(href) {
  const raw = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/^\/+|\/+$/g, "");
  const bp = raw ? "/" + raw : "";
  return typeof href === "string" && href.startsWith("/") && !href.startsWith("//") ? bp + href : href;
}
module.exports = function Link({ href, prefetch, replace, scroll, ...rest }) {
  return React.createElement("a", { href: withBase(typeof href === "string" ? href : String(href)), ...rest });
};
module.exports.default = module.exports;
