import React from "react";
import { TypographyProps } from "@/types/Typography.type";

const Typography: React.FC<TypographyProps> = ({
  variant,
  children,
  className = "",
  fontFamily,
  fontWeight = "normal",
  textAlign = "left",
  color = "textPrimary",
  textDecoration = "none",
  textTransform = "none",
  letterSpacing = "normal",
  lineHeight,
  size,
  style
}) => {
  const getTag = (
    variant: TypographyProps["variant"]
  ): keyof JSX.IntrinsicElements => {
    switch (variant) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        return variant;
      case "paragraph":
        return "p";
      case "caption":
      case "overline":
      case "subtitle1":
      case "subtitle2":
        return "span";
      default:
        return "span";
    }
  };

  const Tag = getTag(variant);

  const defaultStyle: React.CSSProperties = {
    fontFamily,
    fontWeight,
    textAlign,
    color: `var(--color-${color})`,
    textDecoration,
    textTransform,
    letterSpacing,
    lineHeight,
    fontSize: size,
    margin: 0
  };

  return (
    <Tag className={className} style={{ ...defaultStyle, ...style }}>
      {children}
    </Tag>
  );
};

export default Typography;
