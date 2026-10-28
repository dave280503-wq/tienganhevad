import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const courses = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/courses' }),
  schema: ({ image }) => z.object({
    order: z.number(),
    title: z.string(),
    summary: z.string(),
    audience: z.string(),
    // Ảnh chìm ở phần tiêu đề trang chi tiết; coverPosition chỉnh phần ảnh được giữ lại (CSS object-position)
    cover: image().optional(),
    coverPosition: z.string().default('center 30%'),
    // Vài điểm nổi bật hiện dưới tiêu đề (không ghi giá ở đây)
    highlights: z.array(z.string()).default([]),
    // session: giá/buổi · week: giá/tuần · contact: liên hệ để biết giá
    priceType: z.enum(['session', 'week', 'contact']),
    price: z.number().optional(),
    // Giá gốc (cùng đơn vị với price): có thì hiện gạch đi và nhãn % giảm
    originalPrice: z.number().optional(),
    sessionsPerWeek: z.number().optional(),
    // chỉ dùng khi priceType = contact, để tab 5 xếp vào đúng mức ngân sách
    budgetMin: z.number().optional(),
    budgetMax: z.number().optional(),
    billing: z.string().optional(),
    sessionMinutes: z.number().optional(),
    // Nội dung trang chi tiết. Để trống thì trang hiện "đang cập nhật".
    // 1. Đầu vào: entryLevel là dòng tóm tắt (vd. trình độ), entry là các ý chi tiết
    entryLevel: z.string().default(''),
    entry: z.array(z.string()).default([]),
    // 2. Đầu ra
    outcome: z.array(z.string()).default([]),
    // 3. Lộ trình: mỗi giai đoạn có tên, mô tả ngắn (tùy chọn) và các ý
    roadmap: z
      .array(z.object({ title: z.string(), text: z.string().default(''), items: z.array(z.string()).default([]) }))
      .default([]),
    // 4. Học phí: các ý đi kèm giá
    feeNotes: z.array(z.string()).default([]),
  }),
});

const reviews = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/reviews' }),
  schema: ({ image }) =>
    z.object({
      order: z.number(),
      quote: z.string(),
      author: z.string(),
      screenshot: image(),
    }),
});

export const collections = { courses, reviews };
