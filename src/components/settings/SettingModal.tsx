import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { tw, settingsTokens } from "@/styles/settings-design";

interface SettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const SettingModal = React.memo<SettingModalProps>(
  function SettingModal({
    isOpen,
    onClose,
    title,
    children,
    actions,
    className,
  }) {
    // Handle escape key
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape" && isOpen) {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }

      return () => {
        document.body.style.overflow = "unset";
      };
    }, [isOpen]);

    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={settingsTokens.animation.normal}
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              className={cn(
                "relative mx-4 w-full max-w-md rounded-t-3xl border border-border bg-background shadow-2xl sm:rounded-3xl",
                "flex max-h-[90vh] flex-col",
                className,
              )}
              initial={settingsTokens.animation.modalSlideIn.initial}
              animate={settingsTokens.animation.modalSlideIn.animate}
              exit={settingsTokens.animation.modalSlideIn.exit}
              transition={settingsTokens.animation.modalSlideIn.transition}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border p-6">
                <h2 className={tw.modalTitle}>{title}</h2>

                <button
                  onClick={onClose}
                  className={cn(
                    "rounded-full p-2 transition-colors hover:bg-secondary/20",
                    tw.focus,
                  )}
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">{children}</div>

              {/* Actions */}
              {actions && (
                <div className="border-t border-border p-6">{actions}</div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  },
);

// Modal actions helper component
export const ModalActions = React.memo<{
  onCancel: () => void;
  onSave: () => void;
  saveDisabled?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
}>(function ModalActions({
  onCancel,
  onSave,
  saveDisabled = false,
  saveLabel = "Save",
  cancelLabel = "Cancel",
}) {
  return (
    <div className="flex gap-3">
      <motion.button
        onClick={onCancel}
        className={cn(
          tw.button,
          "flex-1 border border-border bg-secondary/20 text-foreground hover:bg-secondary/30",
        )}
        whileTap={{ scale: 0.98 }}
        transition={settingsTokens.animation.fast}
      >
        {cancelLabel}
      </motion.button>

      <motion.button
        onClick={onSave}
        disabled={saveDisabled}
        className={cn(
          tw.button,
          "flex-1 bg-primary text-primary-foreground hover:bg-primary/90",
          saveDisabled && tw.disabled,
        )}
        whileTap={{ scale: 0.98 }}
        transition={settingsTokens.animation.fast}
      >
        {saveLabel}
      </motion.button>
    </div>
  );
});
