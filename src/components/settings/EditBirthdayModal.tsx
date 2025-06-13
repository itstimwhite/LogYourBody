import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { tw, settingsTokens } from '@/styles/settings-design';
import { SettingModal, ModalActions } from './SettingModal';
import { DatePickerWheel } from './PickerWheel';

interface EditBirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBirthday: Date | null;
  onSave: (birthday: Date) => void;
}

export const EditBirthdayModal = React.memo<EditBirthdayModalProps>(function EditBirthdayModal({
  isOpen,
  onClose,
  currentBirthday,
  onSave,
}) {
  const [selectedDate, setSelectedDate] = useState(
    currentBirthday || new Date(2000, 0, 1)
  );
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(currentBirthday || new Date(2000, 0, 1));
      setError(null);
    }
  }, [isOpen, currentBirthday]);

  // Validate date
  useEffect(() => {
    const today = new Date();
    const hundredYearsAgo = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
    
    if (selectedDate > today) {
      setError('Birthday cannot be in the future');
    } else if (selectedDate < hundredYearsAgo) {
      setError('Please enter a valid birth year');
    } else {
      setError(null);
    }
  }, [selectedDate]);

  const handleSave = () => {
    if (!error) {
      // Emit analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'setting_changed', {
          event_category: 'Settings',
          event_label: 'Birthday',
          custom_parameters: {
            key: 'birthday',
            oldValue: currentBirthday?.toISOString(),
            newValue: selectedDate.toISOString(),
          },
        });
      }
      
      onSave(selectedDate);
      onClose();
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isValid = !error && selectedDate !== currentBirthday;

  return (
    <SettingModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Birthday"
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
          <div className={tw.itemTitle}>
            Selected Date
          </div>
          <div className={cn(tw.itemSubtitle, 'mt-1')}>
            {formatDate(selectedDate)}
          </div>
        </div>

        {/* Date picker */}
        <div className="space-y-4">
          <DatePickerWheel
            date={selectedDate}
            onDateChange={setSelectedDate}
            className="h-60"
          />
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            className="text-destructive text-sm text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            role="alert"
          >
            {error}
          </motion.div>
        )}

        {/* Helper text */}
        <div className={cn(tw.helperText, 'text-center space-y-1')}>
          <p>• Swipe or tap to change values</p>
          <p>• Birthday cannot be in the future</p>
          <p>• This helps calculate your age accurately</p>
        </div>
      </div>
    </SettingModal>
  );
});