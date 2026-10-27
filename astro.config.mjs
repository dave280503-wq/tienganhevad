import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Địa chỉ web chính thức, dùng cho ảnh chia sẻ (og:image). Đổi khi có tên miền riêng.
  site: 'https://tienganhevad.vercel.app',
  vite: { plugins: [tailwindcss()] },
  // Giới thiệu đã gộp vào trang chủ; giữ link cũ không bị lỗi
  redirects: { '/gioi-thieu': '/#gioi-thieu' },
});
