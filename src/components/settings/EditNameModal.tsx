import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { tw, settingsTokens } from "@/styles/settings-design";
import { SettingModal, ModalActions } from "./SettingModal";

const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(50, "Name must be 50 characters or less")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "Name can only contain letters, spaces, apostrophes, and hyphens",
  );

interface EditNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onSave: (name: string) => void;
}

export const EditNameModal = React.memo<EditNameModalProps>(
  function EditNameModal({ isOpen, onClose, currentName, onSave }) {
    const [value, setValue] = useState(currentName);
    const [error, setError] = useState<string | null>(null);
    const [isShaking, setIsShaking] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset state when modal opens
    useEffect(() => {
      if (isOpen) {
        setValue(currentName);
        setError(null);
        setIsShaking(false);

        // Auto-focus input after animation
        setTimeout(() => {
          inputRef.current?.focus();
        }, 300);
      }
    }, [isOpen, currentName]);

    // Validate on change
    useEffect(() => {
      if (value !== currentName) {
        try {
          nameSchema.parse(value);
          setError(null);
        } catch (err) {
          if (err instanceof z.ZodError) {
            setError(err.errors[0].message);
          }
        }
      } else {
        setError(null);
      }
    }, [value, currentName]);

    const handleSave = () => {
      try {
        const validatedName = nameSchema.parse(value);

        // Emit analytics
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "setting_changed", {
            event_category: "Settings",
            event_label: "Name",
            custom_parameters: {
              key: "name",
              oldValue: currentName,
              newValue: validatedName,
            },
          });
        }

        onSave(validatedName);
        onClose();
      } catch (err) {
        // Show validation error with shake animation
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);

        if (err instanceof z.ZodError) {
          setError(err.errors[0].message);
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !error && value.trim() !== "") {
        e.preventDefault();
        handleSave();
      }
    };

    const isValid = !error && value.trim() !== "" && value !== currentName;

    return (
      <SettingModal
        isOpen={isOpen}
        onClose={onClose}
        title="Edit Name"
        actions={
          <ModalActions
            onCancel={onClose}
            onSave={handleSave}
            saveDisabled={!isValid}
          />
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name-input" className={tw.inputLabel}>
              Name
            </label>

            <motion.input
              ref={inputRef}
              id="name-input"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                tw.input,
                error &&
                  "border-destructive focus:border-destructive focus:ring-destructive/20",
              )}
              placeholder="Enter your name"
              maxLength={50}
              inputMode="text"
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
              aria-invalid={!!error}
              aria-describedby={error ? "name-error" : undefined}
              animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.5 }}
            />

            {/* Character count */}
            <div className="flex justify-between">
              <div className={tw.helperText}>{value.length}/50 characters</div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              id="name-error"
              className="text-sm text-destructive"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              role="alert"
            >
              {error}
            </motion.div>
          )}

          {/* Validation hints */}
          <div className={cn(tw.helperText, "space-y-1")}>
            <p>• Only letters, spaces, apostrophes, and hyphens allowed</p>
            <p>• Must be between 1 and 50 characters</p>
          </div>
        </div>
      </SettingModal>
    );
  },
);
