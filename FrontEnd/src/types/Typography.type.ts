export type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "paragraph"
  | "caption"
  | "overline"
  | "subtitle1"
  | "subtitle2";

export type FontWeight = "light" | "normal" | "medium" | "bold" | "bolder";
export type TextAlign = "left" | "center" | "right" | "justify";
export type TextColor =
  | "primary"
  | "secondary"
  | "error"
  | "warning"
  | "info"
  | "success"
  | "textPrimary"
  | "textSecondary"
  | "inherit";
export type TextDecoration = "none" | "underline" | "line-through";
export type TextTransform = "none" | "capitalize" | "uppercase" | "lowercase";
export type LetterSpacing = "normal" | "tight" | "wide";

export interface TypographyProps {
  variant: TypographyVariant;
  children: React.ReactNode;
  className?: string;
  fontFamily?: string;
  fontWeight?: FontWeight;
  textAlign?: TextAlign;
  color?: TextColor;
  textDecoration?: TextDecoration;
  textTransform?: TextTransform;
  letterSpacing?: LetterSpacing;
  lineHeight?: number | string;
  size?: string | number;
  style?: React.CSSProperties;
}

export interface Theme {
  typography: {
    h1: TypographyProps;
    h2: TypographyProps;
    h3: TypographyProps;
    h4: TypographyProps;
    h5: TypographyProps;
    h6: TypographyProps;
    paragraph: TypographyProps;
    caption: TypographyProps;
    subtitle1: TypographyProps;
    subtitle2: TypographyProps;
    overline: TypographyProps;
  };
}
