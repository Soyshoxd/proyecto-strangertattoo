'use client';

import { useEffect, useState } from "react";

export default function Counter({
  start = 0,
  target,
  duration = 1800,
  prefix = "+",
  suffix = "",
  decimals = 0
}) {
  const [count, setCount] = useState(start);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    let animationId;
    const startTime = Date.now();
    const range = target - start;

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = start + (progress * range);
      
      setCount(current.toFixed(decimals));
      
      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    }

    const timeoutId = setTimeout(() => {
      animationId = requestAnimationFrame(animate);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [start, target, duration, decimals]);

  return (
    <p className="text-sm md:text-2xl font-bold text-white">
      {prefix}{count}{suffix}
    </p>
  );
}
