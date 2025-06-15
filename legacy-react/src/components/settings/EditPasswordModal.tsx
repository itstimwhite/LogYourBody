import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { tw, settingsTokens } from "@/styles/settings-design";
import { SettingModal, ModalActions } from "./SettingModal";

// Password validation schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

interface EditPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const EditPasswordModal = React.memo<EditPasswordModalProps>(
  function EditPasswordModal({ isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState<PasswordFormData>({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    const [errors, setErrors] = useState<
      Partial<Record<keyof PasswordFormData, string>>
    >({});
    const [showPasswords, setShowPasswords] = useState({
      current: false,
      new: false,
      confirm: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    // Reset form when modal opens
    useEffect(() => {
      if (isOpen) {
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setErrors({});
        setShowPasswords({ current: false, new: false, confirm: false });
        setIsLoading(false);
        setServerError(null);
      }
    }, [isOpen]);

    // Real-time validation
    useEffect(() => {
      const result = passwordSchema.safeParse(formData);
      if (!result.success) {
        const fieldErrors: Partial<Record<keyof PasswordFormData, string>> = {};
        result.error.errors.forEach((error) => {
          const field = error.path[0] as keyof PasswordFormData;
          if (!fieldErrors[field]) {
            fieldErrors[field] = error.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({});
      }
    }, [formData]);

    const handleInputChange = (
      field: keyof PasswordFormData,
      value: string,
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setServerError(null); // Clear server error on input change
    };

    const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
      setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSave = async () => {
      const result = passwordSchema.safeParse(formData);
      if (!result.success) return;

      setIsLoading(true);
      setServerError(null);

      try {
        await onSave(formData.currentPassword, formData.newPassword);

        // Emit analytics
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "setting_changed", {
            event_category: "Security",
            event_label: "Password Updated",
            custom_parameters: {
              key: "password",
            },
          });
        }

        onClose();
      } catch (error) {
        setServerError(
          error instanceof Error ? error.message : "Failed to update password",
        );
      } finally {
        setIsLoading(false);
      }
    };

    const isValid =
      Object.keys(errors).length === 0 &&
      formData.currentPassword &&
      formData.newPassword &&
      formData.confirmPassword;

    const PasswordInput = ({
      field,
      label,
      placeholder,
    }: {
      field: keyof PasswordFormData;
      label: string;
      placeholder: string;
    }) => {
      const showField =
        field === "current"
          ? "current"
          : field === "newPassword"
            ? "new"
            : "confirm";

      return (
        <div className="space-y-2">
          <label className={tw.inputLabel}>{label}</label>
          <div className="relative">
            <input
              type={showPasswords[showField] ? "text" : "password"}
              value={formData[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder={placeholder}
              className={cn(
                tw.input,
                "pr-12",
                errors[field] &&
                  "border-destructive focus:border-destructive focus:ring-destructive",
              )}
              disabled={isLoading}
              autoComplete={
                field === "currentPassword"
                  ? "current-password"
                  : "new-password"
              }
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility(showField)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              disabled={isLoading}
              aria-label={`${showPasswords[showField] ? "Hide" : "Show"} ${label.toLowerCase()}`}
            >
              {showPasswords[showField] ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          {errors[field] && (
            <motion.p
              className="text-sm text-destructive"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
            >
              {errors[field]}
            </motion.p>
          )}
        </div>
      );
    };

    return (
      <SettingModal
        isOpen={isOpen}
        onClose={onClose}
        title="Change Password"
        actions={
          <ModalActions
            onCancel={onClose}
            onSave={handleSave}
            saveDisabled={!isValid || isLoading}
            saveText={isLoading ? "Updating..." : "Update Password"}
          />
        }
      >
        <div className="space-y-6">
          {/* Server error */}
          {serverError && (
            <motion.div
              className="rounded-lg border border-destructive/20 bg-destructive/10 p-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
            >
              <p className="text-sm text-destructive">{serverError}</p>
            </motion.div>
          )}

          {/* Current password */}
          <PasswordInput
            field="currentPassword"
            label="Current Password"
            placeholder="Enter your current password"
          />

          {/* New password */}
          <PasswordInput
            field="newPassword"
            label="New Password"
            placeholder="Enter your new password"
          />

          {/* Confirm password */}
          <PasswordInput
            field="confirmPassword"
            label="Confirm New Password"
            placeholder="Confirm your new password"
          />

          {/* Password requirements */}
          <div className={cn(tw.helperText, "space-y-1")}>
            <p className="font-medium">Password Requirements:</p>
            <div className="space-y-1 text-xs">
              <div
                className={cn(
                  "flex items-center gap-2",
                  formData.newPassword.length >= 8
                    ? "text-green-400"
                    : "text-muted-foreground",
                )}
              >
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    formData.newPassword.length >= 8
                      ? "bg-green-400"
                      : "bg-muted-foreground",
                  )}
                />
                At least 8 characters
              </div>
              <div
                className={cn(
                  "flex items-center gap-2",
                  /[A-Z]/.test(formData.newPassword)
                    ? "text-green-400"
                    : "text-muted-foreground",
                )}
              >
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    /[A-Z]/.test(formData.newPassword)
                      ? "bg-green-400"
                      : "bg-muted-foreground",
                  )}
                />
                One uppercase letter
              </div>
              <div
                className={cn(
                  "flex items-center gap-2",
                  /[a-z]/.test(formData.newPassword)
                    ? "text-green-400"
                    : "text-muted-foreground",
                )}
              >
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    /[a-z]/.test(formData.newPassword)
                      ? "bg-green-400"
                      : "bg-muted-foreground",
                  )}
                />
                One lowercase letter
              </div>
              <div
                className={cn(
                  "flex items-center gap-2",
                  /\d/.test(formData.newPassword)
                    ? "text-green-400"
                    : "text-muted-foreground",
                )}
              >
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    /\d/.test(formData.newPassword)
                      ? "bg-green-400"
                      : "bg-muted-foreground",
                  )}
                />
                One number
              </div>
            </div>
          </div>
        </div>
      </SettingModal>
    );
  },
);
