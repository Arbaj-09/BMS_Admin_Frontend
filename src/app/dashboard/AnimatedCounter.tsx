"use client";

import { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
}

const AnimatedCounter = ({ value }: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    const animationDuration = 1000; // 1 second
    const frameDuration = 1000 / 60; // 60 fps
    const totalFrames = Math.round(animationDuration / frameDuration);
    const step = (endValue - startValue) / totalFrames;
    let currentFrame = 0;

    const counter = setInterval(() => {
      currentFrame++;
      const newCount = Math.round(startValue + (step * currentFrame));

      if (currentFrame === totalFrames) {
        setCount(endValue);
        clearInterval(counter);
      } else {
        setCount(newCount);
      }
    }, frameDuration);

    // Update ref for next change
    prevValueRef.current = value;

    return () => clearInterval(counter);
  }, [value]);

  return <div className="text-3xl font-bold">{count}</div>;
};

export default AnimatedCounter;
