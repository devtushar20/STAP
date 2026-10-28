"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { DemoFormSchema } from "@/lib/validators";
import { submitDemoRequest } from "@/lib/api";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "demo" | "sales";
  presetPlan?: string;
}

export const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  initialMode = "demo",
  presetPlan = "",
}) => {
  const [mode, setMode] = useState<"demo" | "sales">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setName("");
      setEmail("");
      setCompany("");
      setTeamSize("");
      setErrors({});
      setStatusMessage("");
      setIsSubmitting(false);
      setIsSuccess(false);

      if (presetPlan) {
        if (initialMode === "sales") {
          setMessage(`Interested in the ${presetPlan} plan.`);
        } else {
          setMessage(`Interested in exploring the ${presetPlan} tier.`);
        }
      } else {
        setMessage("");
      }
    }
  }, [isOpen, initialMode, presetPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setStatusMessage("");

    const formData = {
      mode,
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      team_size: teamSize,
      message: message.trim(),
    };

    const parsed = DemoFormSchema.safeParse(formData);
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
      const response = await submitDemoRequest(parsed.data);
      if (response.status === "success") {
        setIsSuccess(true);
      } else {
        setStatusMessage(
          response.message || "Unable to submit request. Please try again."
        );
      }
    } catch {
      setStatusMessage(
        "Unable to submit your request. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSales = mode === "sales";
  const title = isSales ? "Talk to Sales" : "Book a Demo";
  const subtitle = isSales
    ? "Speak with our AI hiring specialists to configure STAP for your organization."
    : "Experience STAP's AI recruitment platform in action.";
  const submitText = isSubmitting
    ? isSales
      ? "Sending..."
      : "Booking..."
    : isSales
    ? "Talk to Sales"
    : "Book a Demo";

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId="demo-modal-title">
      {!isSuccess ? (
        <div id="demo-form-view">
          <div className="tag" id="demo-modal-tag" style={{ marginBottom: "8px" }}>
            Get started
          </div>
          <h3
            id="demo-modal-title"
            className="px"
            style={{ fontSize: "24px", margin: "0 0 8px" }}
          >
            {title}
          </h3>
          <p
            id="demo-modal-desc"
            style={{ color: "var(--mute)", fontSize: "13.5px", margin: "0 0 20px" }}
          >
            {subtitle}
          </p>

          <form id="demo-form" noValidate onSubmit={handleSubmit}>
            <FormField
              id="demo-name"
              label="Full Name"
              required
              error={errors.name}
            >
              <input
                type="text"
                id="demo-name"
                name="name"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                aria-invalid={errors.name ? "true" : undefined}
              />
            </FormField>

            <FormField
              id="demo-email"
              label="Work Email"
              required
              error={errors.email}
            >
              <input
                type="email"
                id="demo-email"
                name="email"
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                aria-invalid={errors.email ? "true" : undefined}
              />
            </FormField>

            <div className="form-row">
              <FormField
                id="demo-company"
                label="Company"
                required
                error={errors.company}
                className="flex-1"
              >
                <input
                  type="text"
                  id="demo-company"
                  name="company"
                  placeholder="Acme Inc."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  autoComplete="organization"
                  aria-invalid={errors.company ? "true" : undefined}
                />
              </FormField>

              <FormField
                id="demo-teamsize"
                label="Team Size"
                required
                error={errors.team_size}
                className="flex-1"
              >
                <select
                  id="demo-teamsize"
                  name="team_size"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  aria-invalid={errors.team_size ? "true" : undefined}
                >
                  <option value="" disabled>
                    Select size
                  </option>
                  <option value="1-10">1–10 employees</option>
                  <option value="11-50">11–50 employees</option>
                  <option value="51-200">51–200 employees</option>
                  <option value="201-500">201–500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </FormField>
            </div>

            <FormField
              id="demo-message"
              label={isSales ? "How can we help?" : "How can we help? (Optional)"}
              required={isSales}
              error={errors.message}
            >
              <textarea
                id="demo-message"
                name="message"
                rows={3}
                placeholder={
                  isSales
                    ? "Describe your team size, hiring goals, or custom requirements..."
                    : "Tell us about your current hiring challenges or goals..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                aria-invalid={errors.message ? "true" : undefined}
              />
            </FormField>

            {statusMessage && (
              <div
                className="form-status error"
                role="status"
                aria-live="polite"
              >
                {statusMessage}
              </div>
            )}

            <button
              type="submit"
              id="demo-submit-btn"
              className="btn dark"
              style={{ width: "100%", marginTop: "8px" }}
              disabled={isSubmitting}
            >
              {submitText}
            </button>
          </form>
        </div>
      ) : (
        <div
          id="demo-success-view"
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
            style={{ fontSize: "24px", margin: "0 0 10px" }}
          >
            You&apos;re All Set!
          </h3>
          <p
            style={{ color: "var(--mute)", fontSize: "14px", margin: "0 0 24px" }}
          >
            Thanks! We&apos;ll email you within one business day.
          </p>
          <button
            type="button"
            className="btn dark js-done-btn"
            style={{ minWidth: "140px" }}
            onClick={onClose}
          >
            Done
          </button>
        </div>
      )}
    </Modal>
  );
};

