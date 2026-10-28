import React from "react";

export interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  extraLabelAction?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required = false,
  error,
  children,
  className = "",
  extraLabelAction,
}) => {
  return (
    <div className={`form-group ${className}`.trim()}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <label htmlFor={id}>
          {label} {required && <span className="req">*</span>}
        </label>
        {extraLabelAction}
      </div>
      {children}
      <div
        className="form-error"
        id={`${id}-error`}
        role="status"
        aria-live="polite"
      >
        {error}
      </div>
    </div>
  );
};

