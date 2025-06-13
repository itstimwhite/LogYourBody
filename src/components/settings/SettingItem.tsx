import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tw, settingsTokens } from '@/styles/settings-design';

interface SettingItemProps {
  title: string;
  subtitle?: string;
  value?: string | React.ReactNode;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const SettingItem = React.memo<SettingItemProps>(function SettingItem({
  title,
  subtitle,
  value,
  icon,
  rightElement,
  showChevron = false,
  onPress,
  disabled = false,
  className,
  accessibilityLabel,
  accessibilityHint,
}) {
  const isInteractive = !!onPress && !disabled;

  const content = (
    <div className={cn(
      tw.settingItem,
      isInteractive && tw.hover,
      isInteractive && tw.pressed,
      disabled && tw.disabled,
      'cursor-pointer' if isInteractive else 'cursor-default',
      className
    )}>
      {/* Left side */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {icon && (
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            {icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className={tw.itemTitle}>
            {title}
          </div>
          {subtitle && (
            <div className={tw.itemSubtitle}>
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {value && (
          <div className={cn(
            tw.itemValue,
            typeof value === 'string' ? 'text-right' : ''
          )}>
            {value}
          </div>
        )}
        
        {rightElement && (
          <div className="flex-shrink-0">
            {rightElement}
          </div>
        )}
        
        {showChevron && (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );

  if (!isInteractive) {
    return (
      <div
        aria-label={accessibilityLabel}
        aria-describedby={accessibilityHint ? `${title}-hint` : undefined}
      >
        {content}
        {accessibilityHint && (
          <div id={`${title}-hint`} className="sr-only">
            {accessibilityHint}
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.button
      onClick={onPress}
      disabled={disabled}
      className="w-full text-left"
      whileTap={{ scale: 0.98 }}
      transition={settingsTokens.animation.fast}
      aria-label={accessibilityLabel || `${title}${value ? `: ${value}` : ''}`}
      aria-describedby={accessibilityHint ? `${title}-hint` : undefined}
    >
      {content}
      {accessibilityHint && (
        <div id={`${title}-hint`} className="sr-only">
          {accessibilityHint}
        </div>
      )}
    </motion.button>
  );
});

// Specialized variants
export const SettingItemToggle = React.memo<{
  title: string;
  subtitle?: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}>(function SettingItemToggle({
  title,
  subtitle,
  checked,
  onToggle,
  disabled = false,
  icon,
}) {
  return (
    <SettingItem
      title={title}
      subtitle={subtitle}
      icon={icon}
      rightElement={
        <motion.button
          onClick={() => onToggle(!checked)}
          disabled={disabled}
          className={cn(
            'relative inline-flex h-8 w-14 items-center rounded-full transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            checked ? 'bg-primary' : 'bg-secondary',
            disabled && 'opacity-40 pointer-events-none'
          )}
          whileTap={{ scale: 0.95 }}
          aria-label={`${title}: ${checked ? 'enabled' : 'disabled'}`}
          role="switch"
          aria-checked={checked}
        >
          <motion.span
            className={cn(
              'inline-block h-7 w-7 transform rounded-full bg-white shadow-sm transition-transform',
              checked ? 'translate-x-6' : 'translate-x-0.5'
            )}
            animate={{ x: checked ? 24 : 2 }}
            transition={settingsTokens.animation.fast}
          />
        </motion.button>
      }
      disabled={disabled}
    />
  );
});