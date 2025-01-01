export type IconSize = 'sm' | 'md' | 'lg';

export type IconColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

export interface IconProps {
  iconName: string; 
  size?: IconSize;  
  color?: IconColor; 
}
