// Tạo bản logo cho nền tối: chữ "English" (navy) đổi thành trắng, giữ nguyên "Evad", nón và tua vàng.
import sharp from 'sharp';

const src = 'src/assets/evad-logo-ngang.png';
const out = 'src/assets/evad-logo-dark.png';

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const hasTransparent = Array.from({ length: info.width * info.height }, (_, i) => data[i * 4 + 3]).some((a) => a < 250);
console.log(`${info.width}x${info.height}, có vùng trong suốt: ${hasTransparent}`);

for (let i = 0; i < data.length; i += 4) {
  const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
  // Pixel nền trắng (nếu logo không có alpha) -> trong suốt
  if (!hasTransparent && r > 245 && g > 245 && b > 245) { data[i + 3] = 0; continue; }
  // Navy đậm của chữ "English" -> trắng
  if (a > 0 && r < 70 && g < 100 && b < 170) { data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; }
}
await sharp(data, { raw: info }).png().toFile(out);
