import { ChangeEvent, FocusEvent } from 'react';

export interface InputFieldProps {
  label?: string;
  type?: 'text' | 'password' | 'email' | 'number';
  name: string;
  value: string | number;
  placeholder?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: string;
  isValid?: boolean | null;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}
