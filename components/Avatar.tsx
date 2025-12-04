import React, { useState } from 'react';

interface AvatarProps {
  avatarUrl?: string | null;
  username: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
  borderColor?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-2xl',
  xl: 'w-24 h-24 text-4xl sm:w-32 sm:h-32 sm:text-5xl',
};

/**
 * Reusable Avatar component that displays user profile picture or initial
 * Falls back to showing the first letter of username if no avatar URL is provided
 */
export const Avatar: React.FC<AvatarProps> = ({
  avatarUrl,
  username,
  size = 'md',
  className = '',
  showBorder = false,
  borderColor = 'border-emerald-500',
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const sizeClass = sizeClasses[size];
  const initial = username.charAt(0).toUpperCase();
  const hasImage = avatarUrl && !imageError;

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold flex-shrink-0 relative ${
        hasImage ? 'bg-transparent' : 'bg-zinc-200 dark:bg-zinc-800 text-emerald-500'
      } ${showBorder ? `border-4 ${borderColor}` : ''} ${className}`}
    >
      {hasImage ? (
        <>
          {imageLoading && (
            <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center">
              <span className="text-zinc-400">{initial}</span>
            </div>
          )}
          <img
            src={avatarUrl}
            alt={username}
            className={`${sizeClass} rounded-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        </>
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
};

