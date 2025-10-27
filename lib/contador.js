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

  useEffect(() => {
    const startTime = performance.now();
    const range = target - start;

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = (start + progress * range).toFixed(decimals);
      setCount(value);
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }, [start, target, duration, decimals]);

  return (
    <p className="text-sm md:text-2xl font-bold text-white">
      {prefix} {count}
    </p>
  );
}
