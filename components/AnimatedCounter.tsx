import React from 'react';
import CountUp from 'react-countup';

interface AnimatedCounterProps {
  value: number | null;
  className?: string;
  duration?: number;
  trigger?: boolean;
}

/**
 * Animated counter component that counts up from 0 to the target value
 * Uses react-countup library for smooth, tested animations
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  className = '',
  duration = 1.5,
  trigger = true
}) => {
  if (!trigger || value === null || value === undefined) {
    return <span className={className}>0</span>;
  }

  return (
    <CountUp
      start={0}
      end={value}
      duration={duration}
      separator=","
      key={`${trigger}-${value}`}
    >
      {({ countUpRef }) => (
        <span ref={countUpRef} className={className} />
      )}
    </CountUp>
  );
};

