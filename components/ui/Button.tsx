import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "dark" | "outline" | "text";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "outline", className = "", children, ...props }, ref) => {
    let baseClass = "btn";

    if (variant === "text") {
      baseClass = "btn-text";
    } else if (variant === "dark") {
      baseClass = "btn dark";
    } else {
      baseClass = "btn";
    }

    return (
      <button
        ref={ref}
        className={`${baseClass} ${className}`.trim()}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

