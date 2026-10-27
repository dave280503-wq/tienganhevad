import { getCollection } from 'astro:content';
import { getImage } from 'astro:assets';

/** Đánh giá theo thứ tự, kèm link ảnh lớn để phóng to và chữ cái đầu làm avatar. */
export async function loadReviews() {
  const all = (await getCollection('reviews')).sort((a, b) => a.data.order - b.data.order);
  return Promise.all(
    all.map(async (r) => ({
      ...r.data,
      id: r.id,
      full: (await getImage({ src: r.data.screenshot, width: 1100 })).src,
      initial: r.data.author.trim().charAt(0).toUpperCase(),
      wide: r.data.screenshot.width / r.data.screenshot.height > 1.4,
    })),
  );
}

export type Review = Awaited<ReturnType<typeof loadReviews>>[number];
