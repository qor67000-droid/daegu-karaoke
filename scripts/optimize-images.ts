/**
 * npm run images
 * photos/ 폴더의 실제 매장 사진(jpg/png/heic 변환본)을 public/images/ 로 최적화한다.
 *   <name>.avif / .webp / .jpg (1600w) + <name>-800.avif / .webp (800w)
 * 사진 원본은 저장소에 커밋하지 않아도 된다(photos/는 .gitignore 권장).
 * 실제 사진만 사용하고, 생성형/스톡 이미지를 실제 시설처럼 쓰지 않는다.
 */
import { readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, parse } from "node:path";
import sharp from "sharp";

const SRC = process.argv[2] || "photos";
const DEST = "public/images";

async function main() {
  if (!existsSync(SRC)) {
    console.log(`[images] ${SRC}/ 폴더가 없습니다. 실제 사진을 넣은 뒤 다시 실행하세요.`);
    return;
  }
  mkdirSync(DEST, { recursive: true });
  for (const f of readdirSync(SRC).filter((x) => /\.(jpe?g|png|webp)$/i.test(x))) {
    const name = parse(f).name.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    const img = sharp(join(SRC, f)).rotate();
    const meta = await img.metadata();
    for (const [w, suffix] of [
      [1600, ""],
      [800, "-800"],
    ] as const) {
      const base = img.clone().resize({ width: w, withoutEnlargement: true });
      await base.clone().avif({ quality: 55 }).toFile(join(DEST, `${name}${suffix}.avif`));
      await base.clone().webp({ quality: 72 }).toFile(join(DEST, `${name}${suffix}.webp`));
      if (!suffix) await base.clone().jpeg({ quality: 78, mozjpeg: true }).toFile(join(DEST, `${name}.jpg`));
    }
    const h = Math.round(((meta.height ?? 1) / (meta.width ?? 1)) * Math.min(1600, meta.width ?? 1600));
    console.log(`[images] ${f} → ${name}  (config 입력: { file: "${name}", width: ${Math.min(1600, meta.width ?? 1600)}, height: ${h}, alt: "…" })`);
  }
}
main();
