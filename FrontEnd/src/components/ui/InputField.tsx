import React from 'react';
import { InputFieldProps } from '@/types/InputField.type';

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = 'text',
  name,
  value,
  placeholder = '',
  size = 'medium',
  disabled = false,
  readOnly = false,
  required = false,
  error = '',
  isValid = null,
  onChange,
  onFocus,
  onBlur,
}) => {
  const validationClass = isValid === true ? 'valid' : isValid === false ? 'invalid' : '';

  return (
    <div className={`input-field ${size}`}>
      {label && (
        <label htmlFor={name} className={required ? 'required' : ''}>
          {label}
        </label>
      )}
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        className={`input ${validationClass}`}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        aria-invalid={isValid === false}
        aria-required={required}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default InputField;
