import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, className = '', size }) => {
  const style = size ? { fontSize: `${size}px` } : {};
  return (
    <span className={`material-icons-round ${className}`} style={style}>
      {name}
    </span>
  );
};