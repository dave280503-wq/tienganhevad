// Hiệu ứng và tương tác dùng chung. Chạy lại sau mỗi lần chuyển trang (ClientRouter).
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Gắn một lần, dùng event delegation ---------- */
document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;

  const tier = t.closest<HTMLElement>('[data-tier]');
  if (tier) selectTier(tier.dataset.tier!);

  const go = t.closest<HTMLElement>('[data-go]');
  const rotator = go?.closest<HTMLElement>('[data-rotator]');
  if (go && rotator) {
    showSlide(rotator, Number(go.dataset.go));
    startRotator(); // bấm chọn thì đếm lại từ đầu
  }

  const zoom = t.closest<HTMLElement>('[data-zoom]');
  if (zoom) {
    const box = document.getElementById('lightbox') as HTMLDialogElement | null;
    const img = box?.querySelector('img');
    if (box && img) {
      img.src = zoom.dataset.zoom!;
      img.alt = zoom.dataset.alt ?? '';
      box.showModal();
    }
  }
  if (t.id === 'lightbox' || t.closest('[data-close]')) (document.getElementById('lightbox') as HTMLDialogElement | null)?.close();

  const btn = t.closest<HTMLElement>('.btn');
  if (btn && !reduce) {
    const r = btn.getBoundingClientRect();
    const size = Math.max(r.width, r.height);
    const dot = document.createElement('span');
    dot.className = 'ripple';
    dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    btn.append(dot);
    dot.addEventListener('animationend', () => dot.remove());
  }
});

document.addEventListener('pointermove', (e) => {
  const card = (e.target as HTMLElement).closest?.<HTMLElement>('.card');
  if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty('--mx', `${e.clientX - r.left}px`);
  card.style.setProperty('--my', `${e.clientY - r.top}px`);
}, { passive: true });

function updateProgress() {
  const bar = document.getElementById('progress');
  if (!bar) return;
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
}
addEventListener('scroll', updateProgress, { passive: true });

function selectTier(id: string) {
  document.querySelectorAll<HTMLElement>('[data-tier]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tier === id)));
  document.querySelectorAll<HTMLElement>('[data-panel]').forEach((p) => {
    const show = p.dataset.panel === id;
    p.hidden = !show;
    p.classList.remove('panel-in');
    if (show && !reduce) {
      void p.offsetWidth; // chạy lại animation
      p.classList.add('panel-in');
    }
  });
}

/* Lời nhắn học viên tự chuyển */
const hiddenSlide = ['pointer-events-none', 'translate-y-3', 'opacity-0'];
let rotTimers: ReturnType<typeof setInterval>[] = [];

function showSlide(root: HTMLElement, index: number) {
  const slides = root.querySelectorAll<HTMLElement>('[data-slide]');
  const i = (index + slides.length) % slides.length;
  slides.forEach((s, n) => {
    s.classList.toggle('on', n === i);
    hiddenSlide.forEach((c) => s.classList.toggle(c, n !== i));
    if (n === i) s.removeAttribute('aria-hidden');
    else s.setAttribute('aria-hidden', 'true');
  });
  root.querySelectorAll<HTMLElement>('[data-go]').forEach((b) => b.setAttribute('aria-current', String(Number(b.dataset.go) === i)));
}

// Mỗi khối [data-rotator] tự chuyển theo data-interval (mặc định 6,5 giây), dừng khi rê chuột vào
function startRotator() {
  rotTimers.forEach(clearInterval);
  rotTimers = [];
  if (reduce) return;
  document.querySelectorAll<HTMLElement>('[data-rotator]').forEach((root) => {
    rotTimers.push(setInterval(() => {
      if (root.matches(':hover, :focus-within') || !root.isConnected) return;
      const slides = [...root.querySelectorAll('[data-slide]')];
      showSlide(root, slides.findIndex((s) => s.classList.contains('on')) + 1);
    }, Number(root.dataset.interval) || 6500));
  });

  // Đồng hồ buổi học chạy từng giây
  const clock = document.querySelector<HTMLElement>('[data-call-timer]');
  if (clock) {
    let [m, s] = clock.textContent!.split(':').map(Number);
    rotTimers.push(setInterval(() => {
      s = (s + 1) % 60;
      if (s === 0) m++;
      clock.textContent = `${m}:${String(s).padStart(2, '0')}`;
    }, 1000));
  }
}

/* ---------- Chạy mỗi lần vào trang ---------- */
function init() {
  document.documentElement.classList.add('js');
  updateProgress();
  startRotator();

  // Gạch giá gốc khi khối giá cuộn vào màn hình
  document.querySelectorAll<HTMLElement>('[data-strike]').forEach((el) => {
    if (reduce || !('IntersectionObserver' in window)) return el.classList.add('struck');
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      el.classList.add('struck');
      io.disconnect();
    }, { threshold: 0.6 });
    io.observe(el);
  });

  const first = document.querySelector<HTMLElement>('[data-tier]');
  if (first) selectTier(first.dataset.tier!);

  if (reduce || !('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal], main h2, main figure, main .card, main .placeholder');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target as HTMLElement;
      el.classList.add('in');
      io.unobserve(el);
      // Bỏ lớp reveal sau khi xong để hover của phần tử không bị trễ theo delay
      setTimeout(() => el.classList.remove('reveal', 'in'), 900 + parseInt(el.style.getPropertyValue('--d') || '0'));
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  targets.forEach((el) => {
    if (el.closest('[data-panel], .ticker, [data-rotator]')) return; // đã có hiệu ứng riêng
    const i = [...(el.parentElement?.children ?? [])].indexOf(el);
    el.style.setProperty('--d', `${Math.min(i, 5) * 80}ms`);
    el.classList.add('reveal');
    io.observe(el);
  });
}

document.addEventListener('astro:page-load', init);

/* ---------- Hiệu ứng nâng cao (chỉ máy có chuột, bỏ qua khi giảm chuyển động) ---------- */
if (!reduce) {
  // Nghiêng 3D theo con trỏ
  document.addEventListener('pointermove', (e) => {
    const el = (e.target as HTMLElement).closest?.<HTMLElement>('[data-tilt]');
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-py * 7).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(px * 9).toFixed(2)}deg`);
  }, { passive: true });
  document.addEventListener('pointerout', (e) => {
    const el = (e.target as HTMLElement).closest?.<HTMLElement>('[data-tilt], [data-magnetic]');
    if (!el || el.contains(e.relatedTarget as Node)) return;
    el.style.removeProperty('--rx');
    el.style.removeProperty('--ry');
    el.style.transform = '';
  });

  // Nút hút về phía con trỏ
  document.addEventListener('pointermove', (e) => {
    const el = (e.target as HTMLElement).closest?.<HTMLElement>('[data-magnetic]');
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
  }, { passive: true });

  // Vệt sáng bám theo chuột
  let cx = 0, cy = 0, tx = 0, ty = 0;
  addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  if (matchMedia('(pointer: fine)').matches) {
    const loop = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      const el = document.getElementById('cursor');
      if (el) el.style.transform = `translate(${cx - 200}px, ${cy - 200}px)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  // Ảnh trôi chậm hơn nội dung khi cuộn
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
        const r = el.getBoundingClientRect();
        const offset = (r.top + r.height / 2 - innerHeight / 2) * Number(el.dataset.parallax);
        el.style.translate = `0 ${offset.toFixed(1)}px`;
      });
      ticking = false;
    });
  }, { passive: true });
}

// Đếm số khi cuộn tới
document.addEventListener('astro:page-load', () => {
  if (reduce) return;
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const suffix = el.dataset.suffix ?? '';
    el.textContent = `0${suffix}`;
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min((t - t0) / 1400, 1);
        el.textContent = `${Math.round(end * (1 - (1 - p) ** 3))}${suffix}`;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(el);
  });
});
