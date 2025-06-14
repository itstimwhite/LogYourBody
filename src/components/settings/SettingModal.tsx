import React, { Fragment } from "react";
import { motion } from "framer-motion";
import { Dialog, Transition } from "@headlessui/react";
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
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 scale-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 scale-95 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel
                  as={motion.div}
                  className={cn(
                    "relative w-full max-w-md transform overflow-hidden rounded-t-3xl border border-border bg-background shadow-2xl transition-all sm:rounded-3xl",
                    "flex max-h-[90vh] flex-col",
                    className,
                  )}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-border p-6">
                    <Dialog.Title as="h2" className={tw.modalTitle}>
                      {title}
                    </Dialog.Title>

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
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
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
