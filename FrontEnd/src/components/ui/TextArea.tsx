import { TextAreaProps } from "@/types/TextArea.type";
import React from "react";

const borderRadiusMap: Record<string, string> = {
  none: "0",
  sm: "0.125rem", // 2px
  md: "0.25rem", // 4px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
};

const TextArea: React.FC<TextAreaProps> = ({
  title,
  placeHolder,
  name,
  id,
  hint,
  cols,
  rows,
  resize,
  borderRadius,
  maxLength,
  onInput,
  onChange,
  onFocus,
  isDisable,
  isReadOnly,
  isRequired,
  isValid,
  isInvalid,
  errorMessage,
}) => {
  let borderColor = "";
  if (isValid) {
    borderColor = "#D0D5DD";
  } else if (isInvalid) {
    borderColor = "red";
  }

  return (
    <div
      className="textarea-wrapper"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <h2 className="title" style={{ fontSize: 16, marginBottom: 12 }}>
        {title}
      </h2>
      <textarea
        cols={cols}
        rows={rows}
        placeholder={placeHolder}
        maxLength={maxLength}
        name={name}
        id={id}
        aria-labelledby={`${id}-label`}
        aria-required={isRequired}
        aria-invalid={isInvalid}
        style={{
          resize,
          padding: 11,
          border: "1px solid",
          borderRadius: borderRadiusMap[borderRadius],
          borderColor: borderColor,
        }}
        onInput={onInput}
        onChange={onChange}
        onFocus={onFocus}
        disabled={isDisable}
        readOnly={isReadOnly}
        required={isRequired}
        tabIndex={0}
      ></textarea>
      {isInvalid && errorMessage && (
        <span style={{ color: "red", fontSize: 12,marginTop:4 }}>{errorMessage}</span>
      )}
      <h3 className="hint" style={{ fontSize: 12, marginTop: 10 }}>
        {hint}
      </h3>
    </div>
  );
};

export default TextArea;
