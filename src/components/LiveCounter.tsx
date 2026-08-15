"use client";

import { useEffect, useRef, useState } from "react";

/**
 * LiveCounter
 *
 * Menampilkan angka download yang di-animate dari nilai awal ke nilai baru.
 * Mendukung dua mode update:
 *  1. `liveCount` prop  — dikontrol dari luar (misalnya setelah POST /api/downloads selesai)
 *  2. Fallback ke `initialCount` bila `liveCount` belum tersedia
 */
interface LiveCounterProps {
  initialCount: number;
  liveCount?: number | null;
  className?: string;
  /** Durasi animasi dalam ms. Default 1200 */
  duration?: number;
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export default function LiveCounter({
  initialCount,
  liveCount,
  className,
  duration = 1200,
}: LiveCounterProps) {
  const [displayed, setDisplayed] = useState(initialCount);
  const animFrameRef = useRef<number | null>(null);
  const prevTargetRef = useRef<number>(initialCount);

  useEffect(() => {
    const target = liveCount ?? initialCount;
    const start = prevTargetRef.current;

    if (start === target) return;

    prevTargetRef.current = target;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const current = Math.round(start + (target - start) * eased);
      setDisplayed(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
    }
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [liveCount, initialCount, duration]);

  return (
    <span className={className}>
      {displayed.toLocaleString("id-ID")}
    </span>
  );
}
