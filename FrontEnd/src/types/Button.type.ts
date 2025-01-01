export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "link" | "primary" | "secondary" | "tertiary"; // Sửa lỗi chính tả từ "teriary" thành "tertiary"
  size: "small" | "medium" | "large";
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  block?: boolean;
  rounded: "none" | "sm" | "md" | "lg" | "full";
  hover?: string;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
  border?: string;
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  iconSpacing?: string;
  width?: string;
  height?: string;
  type?: "button" | "submit" | "reset";

  justifyContent?:
    | "center"
    | "flex-start"
    | "flex-end"
    | "space-between"
    | "space-around";
  alignItems?: "center" | "flex-start" | "flex-end" | "baseline" | "stretch"; // căn chỉnh theo trục dọc
  display?: string; // Sửa từ "dispaly" thành "display"
  accessibleLabel?: string;
  onHover?: React.MouseEventHandler<HTMLButtonElement>;
}
