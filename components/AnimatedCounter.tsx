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
  if (!trigger) {
    return <span className={className}>0</span>;
  }

  // If value is null/undefined, show 0 statically
  if (value === null || value === undefined) {
    return <span className={className}>0</span>;
  }

  // When we have a value, render CountUp with a key that includes the value
  // This ensures it remounts and animates when value changes from null to number
  return (
    <CountUp
      start={0}
      end={value}
      duration={duration}
      separator=","
      enableScrollSpy={false}
      key={`animated-${value}`}
    >
      {({ countUpRef }) => (
        <span ref={countUpRef} className={className} />
      )}
    </CountUp>
  );
};

