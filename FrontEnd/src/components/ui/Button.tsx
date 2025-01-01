import React from "react";
import cn from "classnames";
import { ButtonProps } from "@/types/Button.type";
import "../../scss/_variables.scss";

const borderRadiusMap: Record<string, string> = {
  none: "0",
  sm: "0.125rem", // 2px
  md: "0.25rem", // 4px
  lg: "0.5rem", // 8px
  full: "9999px", // Fully rounded
};

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  fullWidth = false,
  loading = false,
  icon,
  block = false,
  rounded = "md",
  hover,
  onFocus,
  onClick,
  onHover,
  disabled = false,
  className,
  border,
  backgroundColor,
  textColor,
  padding,
  iconSpacing = "0.5rem",
  width = "auto",
  height = "auto",
  type = "button",
  justifyContent = "center",
  alignItems = "center",
  display = "flex",
  accessibleLabel,
  ...props
}) => {
  const isDisabled = loading || disabled;

  const buttonStyles = {
    display: display,
    justifyContent: justifyContent,
    alignItems: alignItems,
    width: width,
    height: height,
    opacity: isDisabled ? 0.7 : 1,
    cursor: isDisabled ? "not-allowed" : "pointer",
    padding: padding || "10px 20px",
    border: border || "1px solid transparent",
    backgroundColor: backgroundColor || "#3461FF",
    color: textColor || "#fff",
    borderRadius: rounded === "full" ? "9999px" : borderRadiusMap[rounded],
    transition: "opacity 0.2s ease, background-color 0.2s ease",
  };

  return (
    <button
      type={type}
      className={cn(className, `btn-${variant}`, `btn-${size}`, { block })}
      disabled={isDisabled}
      aria-label={accessibleLabel}
      onClick={onClick}
      onFocus={onFocus}
      onMouseEnter={onHover}
      style={buttonStyles}
      {...props}
    >
      {loading ? (
        <span>Loading...</span>
      ) : (
        <>
          {icon && <span style={{ marginRight: iconSpacing }}>{icon}</span>}
          {props.children}
        </>
      )}
    </button>
  );
};

export default Button;
