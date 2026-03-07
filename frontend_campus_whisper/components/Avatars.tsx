import React from 'react';
// @ts-ignore - boring-avatars doesn't have perfect types
import Avatar from 'boring-avatars';

interface UserAvatarProps {
  name: string;
  size?: number;
  className?: string;
  variant?: 'marble' | 'beam' | 'pixel' | 'sunset' | 'ring' | 'bauhaus';
}

const PALETTE = ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560'];

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 40,
  className = '',
  variant = 'beam',
}) => {
  return (
    <div
      className={`rounded-full overflow-hidden flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <Avatar
        size={size}
        name={name}
        variant={variant}
        colors={PALETTE}
      />
    </div>
  );
};

// Pre-defined room cover images (royalty-free from Unsplash)
const ROOM_IMAGES: Record<string, string> = {
  tech: 'https://images.unsplash.com/photo-1504384308090-c54be3852f33?auto=format&fit=crop&w=800&q=80',
  social: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&w=800&q=80',
  confessions: 'https://images.unsplash.com/photo-1505322022379-7c3353ee6291?auto=format&fit=crop&w=800&q=80',
  gaming: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
  study: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
  academic: 'https://images.unsplash.com/photo-1523050854058-8df90110c7f1?auto=format&fit=crop&w=800&q=80',
  clubs: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80',
};

export function getRoomImage(category?: string): string {
  if (!category) return ROOM_IMAGES.default;
  return ROOM_IMAGES[category.toLowerCase()] || ROOM_IMAGES.default;
}

// Get initials for fallback
export function getInitials(name: string): string {
  return name
    .split(/[\s_]+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
