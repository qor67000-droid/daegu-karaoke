// GitHub Pages 응답 규칙 모의 서버: node tools/offline/pages-serve.mjs <outDir> <basePath> <port>
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
const [out = "out", bp = "", port = "4173"] = process.argv.slice(2);
const T = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".xml": "application/xml", ".txt": "text/plain" };
createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  const nf = () => { res.writeHead(404, { "content-type": T[".html"] }); res.end(readFileSync(join(out, "404.html"))); };
  if (bp && url !== bp && !url.startsWith(bp + "/")) return nf();
  const rel = (bp ? url.slice(bp.length) : url) || "/";
  const t = join(out, rel);
  if (rel.endsWith("/")) return existsSync(join(t, "index.html")) ? (res.writeHead(200, { "content-type": T[".html"] }), res.end(readFileSync(join(t, "index.html")))) : nf();
  if (existsSync(t) && statSync(t).isFile()) { res.writeHead(200, { "content-type": T[extname(t)] ?? "application/octet-stream" }); return res.end(readFileSync(t)); }
  if (existsSync(join(t, "index.html"))) { res.writeHead(301, { location: url + "/" }); return res.end(); }
  nf();
}).listen(Number(port), "127.0.0.1", () => console.log(`pages-serve ${out} at http://127.0.0.1:${port}${bp}/`));
