import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { tw, settingsTokens } from "@/styles/settings-design";
import { SettingModal, ModalActions } from "./SettingModal";
import { HeightWheelPicker } from "@/components/ui/wheel-picker";

interface EditHeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHeight: number; // in cm
  units: "imperial" | "metric";
  onSave: (heightInCm: number) => void;
}

export const EditHeightModal = React.memo<EditHeightModalProps>(
  function EditHeightModal({ isOpen, onClose, currentHeight, units, onSave }) {
    const [selectedHeight, setSelectedHeight] = useState(currentHeight);
    const [error, setError] = useState<string | null>(null);

    // Reset state when modal opens
    useEffect(() => {
      if (isOpen) {
        setSelectedHeight(currentHeight);
        setError(null);
      }
    }, [isOpen, currentHeight]);

    // Validate height
    useEffect(() => {
      const minHeightCm = 61; // 2'0"
      const maxHeightCm = 250; // ~8'2"

      if (selectedHeight < minHeightCm) {
        setError(
          `Height must be at least ${units === "imperial" ? "2'0\"" : "61 cm"}`,
        );
      } else if (selectedHeight > maxHeightCm) {
        setError(
          `Height must be less than ${units === "imperial" ? "8'2\"" : "250 cm"}`,
        );
      } else {
        setError(null);
      }
    }, [selectedHeight, units]);

    const handleSave = () => {
      if (!error) {
        // Emit analytics
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "setting_changed", {
            event_category: "Settings",
            event_label: "Height",
            custom_parameters: {
              key: "height",
              oldValue: currentHeight,
              newValue: selectedHeight,
              units: units,
            },
          });
        }

        onSave(selectedHeight);
        onClose();
      }
    };

    const formatHeight = (heightCm: number) => {
      if (units === "metric") {
        return `${heightCm} cm`;
      } else {
        const totalInches = Math.round(heightCm / 2.54);
        const feet = Math.floor(totalInches / 12);
        const inches = totalInches % 12;
        return `${feet}'${inches}"`;
      }
    };

    const isValid = !error && selectedHeight !== currentHeight;

    return (
      <SettingModal
        isOpen={isOpen}
        onClose={onClose}
        title="Edit Height"
        actions={
          <ModalActions
            onCancel={onClose}
            onSave={handleSave}
            saveDisabled={!isValid}
          />
        }
      >
        <div className="space-y-6">
          {/* Current selection display */}
          <div className="text-center">
            <div className={tw.itemTitle}>Selected Height</div>
            <div className={cn(tw.itemSubtitle, "mt-1")}>
              {formatHeight(selectedHeight)}
            </div>
          </div>

          {/* Height picker */}
          <div className="space-y-4">
            <HeightWheelPicker
              heightInCm={selectedHeight}
              units={units}
              onHeightChange={setSelectedHeight}
              className="h-60"
            />
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              className="text-center text-sm text-destructive"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              role="alert"
            >
              {error}
            </motion.div>
          )}

          {/* Helper text */}
          <div className={cn(tw.helperText, "space-y-1 text-center")}>
            <p>• Swipe or tap to change values</p>
            <p>
              •{" "}
              {units === "imperial"
                ? "Minimum height: 2'0\""
                : "Minimum height: 61 cm"}
            </p>
            <p>• Used for accurate body composition calculations</p>
          </div>
        </div>
      </SettingModal>
    );
  },
);
