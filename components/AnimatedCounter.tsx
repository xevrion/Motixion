import React, { useEffect, useRef } from 'react';
import CountUp from 'react-countup';

interface AnimatedCounterProps {
  value: number | null;
  className?: string;
  duration?: number;
}

/**
 * Animated counter component that counts up from 0 to the target value.
 * Production-safe: uses update() method instead of key-based remounting.
 * This ensures the animation triggers when async data arrives.
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  className = '',
  duration = 1.5,
}) => {
  const countUpRef = useRef<any>(null);
  const prevValueRef = useRef<number | null>(null);

  useEffect(() => {
    // When value changes from null to number, trigger animation
    if (value !== null && value !== prevValueRef.current && countUpRef.current) {
      countUpRef.current.update(value);
    }
    prevValueRef.current = value;
  }, [value]);

  // Always render CountUp, even when value is null
  // This prevents remounting issues in production
  return (
    <CountUp
      start={0}
      end={value ?? 0}
      duration={duration}
      separator=","
      ref={countUpRef}
    >
      {({ countUpRef: innerRef }) => (
        <span ref={innerRef} className={className} />
      )}
    </CountUp>
  );
};

