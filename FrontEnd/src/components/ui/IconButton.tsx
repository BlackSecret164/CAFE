import { useEffect, useState } from "react";
import { IconButtonProps } from "@/types/IconButton.type";
import React from "react";
import { Icon } from "@iconify/react";

const colorMap: Record<string, string> = {
  primary: "#007BFF",
  secondary: "#6C757D",
  success: "#28A745",
  warning: "#FFC107",
  danger: "#DC3545",
};

const borderRadiusMap: Record<string, string> = {
  none: "0",
  sm: "0.125rem",
  md: "0.25rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  "3xl": "1.5rem",
};

const responsiveSizeMap: Record<string, Record<string, string>> = {
  small: {
    mobile: "10px",
    tablet: "12px",
    desktop: "12px",
  },
  medium: {
    mobile: "14px",
    tablet: "16px",
    desktop: "16px",
  },
  large: {
    mobile: "18px",
    tablet: "20px",
    desktop: "20px",
  },
};

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  text,
  size = "medium",
  color = "primary",
  hoverColor,
  activeColor,
  disabledColor,
  borderRadius = "md",
  onClick,
  onHover,
  onFocus,
  isDisabled = false,
  ariaLabel,
  tabIndex = 0,
  tooltip,
  isIconOnly = false,
  iconColor,
  textColor,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [windowSize, setWindowSize] = useState(window.innerWidth);

  const getBackgroundColor = () => {
    if (isDisabled) return disabledColor;
    if (isActive && activeColor) return activeColor;
    if (isHovered) return hoverColor;
    return colorMap[color];
  };

  const getResponsiveSize = (size: string) => {
    if (windowSize < 600) return responsiveSizeMap[size].mobile; // Mobile
    if (windowSize < 1024) return responsiveSizeMap[size].tablet; // Tablet
    return responsiveSizeMap[size].desktop; // Desktop
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowSize(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (isDisabled) return;
    setIsActive((prev) => !prev);
    if (onClick) onClick(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick(
        event as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>
      );
    }
  };

  return (
    <button
      className={`icon-button ${isActive ? "active" : ""}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isIconOnly ? "8px" : "8px 16px",
        fontSize: getResponsiveSize(size),
        backgroundColor: getBackgroundColor(),
        border: "none",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.6 : 1,
        borderRadius: borderRadiusMap[borderRadius],
        transition: "background-color 0.3s ease",
        width: "auto",
        minWidth: isIconOnly ? "32px" : "auto",
        height: "auto",
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        setIsHovered(true);
        if (onHover) onHover(e);
      }}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={(event) => onFocus?.(event)}
      disabled={isDisabled}
      aria-label={ariaLabel || text}
      aria-disabled={isDisabled}
      aria-pressed={isActive}
      tabIndex={tabIndex}
      onKeyDown={handleKeyDown}
      title={tooltip || (isIconOnly ? ariaLabel : "")}
    >
      <Icon
        icon={icon}
        className="icon"
        style={{ fontSize: getResponsiveSize(size), color: iconColor }}
      />
      {text && !isIconOnly && (
        <span
          style={{
            marginLeft: 8,
            fontSize: getResponsiveSize(size),
            color: textColor,
          }}
        >
          {text}
        </span>
      )}
    </button>
  );
};

export default IconButton;
