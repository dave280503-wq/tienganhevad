import type { CollectionEntry } from 'astro:content';
import site from './content/site.json';

type Course = CollectionEntry<'courses'>['data'];

export const ctaHref = site.zaloUrl || '/lien-he';
export const ctaExternal = Boolean(site.zaloUrl);

export const vnd = (n: number) => n.toLocaleString('vi-VN') + 'đ';

export function priceLabel(c: Course): { main: string; note?: string } {
  if (c.priceType === 'session' && c.price) {
    const parts = [
      c.sessionMinutes && `${c.sessionMinutes} phút/buổi`,
      c.sessionsPerWeek && `${c.sessionsPerWeek} buổi/tuần`,
      c.billing && `đóng học phí theo ${c.billing}`,
    ].filter(Boolean);
    return { main: `${vnd(c.price)}/buổi`, note: parts.length ? parts.join(' · ') : undefined };
  }
  if (c.priceType === 'week' && c.price) return { main: `${vnd(c.price)}/tuần` };
  return {
    main: 'Liên hệ để biết giá',
    note: c.budgetMin && c.budgetMax ? `Tham khảo ${c.budgetMin / 1000}–${c.budgetMax / 1000}k/buổi` : undefined,
  };
}

/** Khoảng giá dùng để xếp khóa vào mức ngân sách ở tab 5. */
export function priceRange(c: Course): [number, number] {
  if (c.priceType === 'contact') return [c.budgetMin ?? 0, c.budgetMax ?? 0];
  return [c.price ?? 0, c.price ?? 0];
}

export type Tier = (typeof site.budgetTiers)[number];
export const inTier = (c: Course, t: Tier) => {
  const [lo, hi] = priceRange(c);
  return lo <= t.max && hi >= t.min;
};

export const nav = [
  { href: '/#gioi-thieu', label: 'Giới thiệu' },
  { href: '/khoa-hoc', label: 'Các khóa học' },
  { href: '/doi-ngu-giao-vien', label: 'Đội ngũ giáo viên' },
  { href: '/danh-gia', label: 'Đánh giá' },
  { href: '/tim-khoa-hoc', label: 'Tìm khóa theo ngân sách' },
  { href: '/coaching-giao-vien', label: 'Coaching giáo viên' },
];
