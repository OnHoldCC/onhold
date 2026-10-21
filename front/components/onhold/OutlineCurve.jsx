import tokenIcon from '../../src/assets/claude-token-108.webp';
import { useEffect, useId, useRef } from 'react';
// Reused from SingleSparkFront/front/features/docs/OutlineCurve.tsx.


const curve = 'M 16 12 C 56 69, -24 69, 16 126 C 56 183, -24 183, 16 240 C 56 297, -24 297, 16 354 C 56 411, -24 411, 16 468';

export function OutlineCurve({ content }) {
  const gradient = useId();
  const beam = useRef(null);
  const spark = useRef(null);
  useEffect(() => {
    const article = content.current, path = beam.current, tip = spark.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const paint = () => {
      frame = 0;
      if (motion.matches) { tip.style.visibility='hidden';return; }
      const box = article.getBoundingClientRect();
      if (!box.height) return;
      const body=article.closest('.app-body');
      const viewport=body&&/auto|scroll/.test(getComputedStyle(body).overflowY)?body:null;
      const top=(viewport?.getBoundingClientRect().top||0)+96;
      const height=viewport?.clientHeight||window.innerHeight;
      const progress = Math.max(0, Math.min(1, (top - box.top) / Math.max(1, box.height - height + 96)));
      const length = path.getTotalLength(), point = path.getPointAtLength(progress * length);
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = String(length * (1 - progress));
      tip.style.left = `${point.x / 32 * 100}%`;
      tip.style.top = `${point.y / 480 * 100}%`;
      tip.style.visibility = 'visible';
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
    observer?.observe(article);
    window.addEventListener('scroll', schedule, { passive: true, capture: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    schedule();
    return () => {
      observer?.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
    };
  }, [content]);
  return <div className="how-scroll-curve" aria-hidden="true">
    <svg viewBox="0 0 32 480" preserveAspectRatio="none" focusable="false">
      <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f97316" /><stop offset="100%" stopColor="#fbbf24" />
      </linearGradient></defs>
      <path className="how-scroll-track" d={curve} />
      <path ref={beam} className="how-scroll-beam" d={curve} stroke={`url(#${gradient})`} />
    </svg>
    <span ref={spark} className="how-scroll-spark"><img src={tokenIcon} width="24" height="24" alt=""/></span>
  </div>;
}
