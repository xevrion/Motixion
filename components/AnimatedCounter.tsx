import React from 'react';
import CountUp from 'react-countup';

interface AnimatedCounterProps {
  value: number;
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
  // Show 0 until trigger is true and we have a non-null value
  if (!trigger || value === 0 || value === null || value === undefined) {
    return <span className={className}>0</span>;
  }

  // CountUp will automatically animate when mounted
  return (
    <CountUp
      end={value}
      start={0}
      duration={duration}
      separator=","
      enableScrollSpy={false}
      key={`${trigger}-${value}`}
    >
      {({ countUpRef }) => (
        <span ref={countUpRef} className={className} />
      )}
    </CountUp>
  );
};

