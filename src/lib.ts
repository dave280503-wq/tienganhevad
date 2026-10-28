import type { CollectionEntry } from 'astro:content';
import site from './content/site.json';

type Course = CollectionEntry<'courses'>['data'];

export const ctaHref = site.zaloUrl || '/lien-he';
export const ctaExternal = Boolean(site.zaloUrl);

export const vnd = (n: number) => n.toLocaleString('vi-VN') + 'đ';

type PriceLabel = { main: string; note?: string; was?: string; off?: number };

/** Giá gốc gạch đi và % giảm, chỉ khi giá gốc cao hơn giá hiện tại. */
function discount(c: Course, unit: string): Pick<PriceLabel, 'was' | 'off'> {
  if (!c.originalPrice || !c.price || c.originalPrice <= c.price) return {};
  return { was: `${vnd(c.originalPrice)}${unit}`, off: Math.round((1 - c.price / c.originalPrice) * 100) };
}

export function priceLabel(c: Course): PriceLabel {
  if (c.priceType === 'session' && c.price) {
    const parts = [
      c.sessionMinutes && `${c.sessionMinutes} phút/buổi`,
      c.sessionsPerWeek && `${c.sessionsPerWeek} buổi/tuần`,
      c.billing && `đóng học phí theo ${c.billing}`,
    ].filter(Boolean);
    return { main: `${vnd(c.price)}/buổi`, note: parts.length ? parts.join(' · ') : undefined, ...discount(c, '/buổi') };
  }
  if (c.priceType === 'week' && c.price) return { main: `${vnd(c.price)}/tuần`, ...discount(c, '/tuần') };
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
