import React from 'react';
import { IconProps, IconSize, IconColor } from '@/types/Icons.type';

// Mapping size và color
const sizeMap: Record<IconSize, string> = {
  sm: '16px',
  md: '24px',
  lg: '32px',
};

const colorMap: Record<IconColor, string> = {
  primary: '#007BFF',
  secondary: '#6C757D',
  success: '#28A745',
  warning: '#FFC107',
  danger: '#DC3545',
};

// Sử dụng require để lấy đường dẫn SVG
const importIconUrl = (iconName: string) => require(`@/assets/Icons/${iconName}.svg?url`);

const Icon: React.FC<IconProps> = ({ iconName, size = 'md', color = 'primary' }) => {
  const [iconUrl, setIconUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const url = importIconUrl(iconName);
      setIconUrl(url);
    } catch (error) {
      console.warn(`Icon "${iconName}" không tồn tại.`);
      setIconUrl(null);
    }
  }, [iconName]);

  if (!iconUrl) {
    return null;
  }

  return (
    <img
      src={iconUrl}
      alt={`${iconName} icon`}
      width={sizeMap[size]}
      height={sizeMap[size]}
      style={{ fill: colorMap[color] }}
    />
  );
};

export default Icon;
