"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { LoginFormSchema } from "@/lib/validators";
import { loginUser } from "@/lib/api";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"error" | "success" | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setPassword("");
      setErrors({});
      setStatusMessage("");
      setStatusType("");
      setIsSubmitting(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  const handleForgotPassword = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setErrors({ email: "Enter your email above, then click Forgot password." });
      return;
    }
    setErrors({});
    setStatusType("success");
    setStatusMessage(`Password reset instructions have been sent to ${trimmed}.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setStatusMessage("");
    setStatusType("");

    const formData = {
      email: email.trim(),
      password,
    };

    const parsed = LoginFormSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await loginUser(parsed.data);
      if (response.status === "success") {
        setIsSuccess(true);
      } else {
        setStatusType("error");
        setStatusMessage(response.message || "Invalid credentials. Please try again.");
      }
    } catch {
      setStatusType("error");
      setStatusMessage("Invalid credentials or server error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    onClose();
    router.push("/dashboard");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId="login-modal-title" maxWidth="400px">
      {!isSuccess ? (
        <div id="login-form-view">
          <div className="logo" style={{ marginBottom: "14px" }}>
            <i></i>STAP
          </div>
          <h3
            id="login-modal-title"
            className="px"
            style={{ fontSize: "22px", margin: "0 0 6px" }}
          >
            Welcome Back
          </h3>
          <p
            style={{ color: "var(--mute)", fontSize: "13px", margin: "0 0 20px" }}
          >
            Log in to your STAP recruitment command center.
          </p>

          <form id="login-form" noValidate onSubmit={handleSubmit}>
            <FormField
              id="login-email"
              label="Email Address"
              required
              error={errors.email}
            >
              <input
                type="email"
                id="login-email"
                name="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                aria-invalid={errors.email ? "true" : undefined}
              />
            </FormField>

            <FormField
              id="login-password"
              label="Password"
              required
              error={errors.password}
              extraLabelAction={
                <button
                  type="button"
                  id="forgot-password-btn"
                  className="link-btn"
                  style={{
                    fontSize: "11.5px",
                    color: "var(--p)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              }
            >
              <input
                type="password"
                id="login-password"
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                aria-invalid={errors.password ? "true" : undefined}
              />
            </FormField>

            {statusMessage && (
              <div
                className={`form-status ${statusType}`}
                role="status"
                aria-live="polite"
              >
                {statusMessage}
              </div>
            )}

            <button
              type="submit"
              id="login-submit-btn"
              className="btn dark"
              style={{ width: "100%", marginTop: "12px" }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>
      ) : (
        <div
          id="login-success-view"
          style={{ textAlign: "center", padding: "20px 8px" }}
        >
          <div
            className="ic"
            style={{ margin: "0 auto 16px", width: "52px", height: "52px", fontSize: "24px" }}
          >
            ✔
          </div>
          <h3
            className="px"
            style={{ fontSize: "22px", margin: "0 0 8px" }}
          >
            Welcome Back!
          </h3>
          <p
            style={{ color: "var(--mute)", fontSize: "13.5px", margin: "0 0 20px" }}
          >
            Redirecting to your command center...
          </p>
          <button
            type="button"
            className="btn dark js-login-done-btn"
            style={{ minWidth: "140px" }}
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      )}
    </Modal>
  );
};

