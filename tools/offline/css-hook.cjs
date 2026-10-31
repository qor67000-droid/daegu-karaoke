// 오프라인 렌더러 전용: `import "./globals.css"` 를 빈 모듈로 처리한다 (CSS는 별도로 Tailwind 컴파일).
require.extensions[".css"] = (m) => {
  m.exports = {};
};
const mod = require("node:module");
if (typeof mod.registerHooks === "function") {
  mod.registerHooks({
    load(url, ctx, next) {
      if (url.endsWith(".css")) return { format: "commonjs", source: "module.exports = {}", shortCircuit: true };
      return next(url, ctx);
    },
  });
}
