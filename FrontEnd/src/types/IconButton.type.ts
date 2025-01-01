export interface IconButtonProps {
  icon: string; //
  text?: string; //
  size?: "small" | "medium" | "large"; //
  color?: "primary" | "secondary" | "success" | "warning" | "danger"; //
  hoverColor?: string; //
  activeColor?: string; //
  disabledColor?: string; //
  isDisabled?: boolean; //
  ariaLabel?: string; //
  tabIndex?: number; //
  tooltip?: string; //
  borderRadius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  onHover?: React.MouseEventHandler<HTMLButtonElement>; //
  onFocus?: React.FocusEventHandler<HTMLButtonElement>; //
  onClick?: React.MouseEventHandler<HTMLButtonElement>; //
  isIconOnly?: boolean; //
  iconColor?: string;
  textColor?: string;
}
