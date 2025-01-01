export interface TextAreaProps {
    title: string;
    placeHolder: string;
    id?: string;
    name?: string;
    hint?: string;
    cols?: number;
    rows?: number;
    resizeOption?: string;
    maxLength?: number;
    resize?: "none" | "both" | "horizontal" | "vertical";
    borderRadius: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
    onInput?: React.FormEventHandler<HTMLTextAreaElement>;
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
    onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
    isDisable?: boolean;
    isReadOnly?: boolean;
    isRequired?: boolean;
    isValid: boolean;
    isInvalid: boolean;
    errorMessage?: string;
  }