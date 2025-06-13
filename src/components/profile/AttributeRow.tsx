import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { tw, getAnimation } from '@/styles/design-tokens';
import { UserProfile } from '@/types/bodymetrics';

interface AttributeItem {
  label: string;
  value: string;
  accessibilityLabel: string;
  hidden?: boolean;
}

interface AttributeRowProps {
  user: UserProfile;
  userAge: number;
  formattedHeight: string;
  className?: string;
}

// Utility function to calculate age properly
export const calculateAge = (birthDate: Date | string | null): number => {
  if (!birthDate) return 0;
  
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  
  // Calculate age using floor((today - birthDate) / 365.25 days)
  const diffInMilliseconds = today.getTime() - birth.getTime();
  const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);
  const age = Math.floor(diffInDays / 365.25);
  
  return age;
};

export const AttributeRow = React.memo<AttributeRowProps>(function AttributeRow({
  user,
  userAge,
  formattedHeight,
  className,
}) {
  const fadeIn = getAnimation('fadeIn');
  
  // Calculate age properly and handle missing birthDate
  const calculatedAge = user.birthDate ? calculateAge(user.birthDate) : 0;
  const displayAge = calculatedAge > 0 ? calculatedAge : userAge;
  const shouldShowAge = displayAge > 0;

  const attributes: AttributeItem[] = [
    {
      label: 'Age',
      value: shouldShowAge ? displayAge.toString() : '',
      accessibilityLabel: shouldShowAge ? `Age: ${displayAge} years old` : 'Age not available',
      hidden: !shouldShowAge,
    },
    {
      label: 'Height',
      value: formattedHeight,
      accessibilityLabel: `Height: ${formattedHeight}`,
    },
    {
      label: 'Sex',
      value: user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not specified',
      accessibilityLabel: `Sex: ${user.gender || 'Not specified'}`,
    },
  ];

  return (
    <motion.div
      className={cn(tw.attributeRow, 'pt-3 md:pt-6', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...fadeIn, delay: 0.3 }}
    >
      {attributes.map((attr, index) => (
        <motion.div
          key={attr.label}
          className={cn(
            'text-center md:text-left flex flex-col justify-center',
            attr.hidden && 'opacity-0 pointer-events-none'
          )}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: attr.hidden ? 0 : 1, scale: 1 }}
          transition={{ 
            ...fadeIn,
            delay: 0.4 + (index * 0.05),
          }}
          aria-hidden={attr.hidden}
        >
          {/* Label */}
          <div className={cn(tw.attributeLabel, 'mb-1')}>
            {attr.label}
          </div>
          
          {/* Value */}
          <div 
            className={tw.attributeValue}
            aria-label={attr.accessibilityLabel}
          >
            {attr.value || '-'}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
});

// Hook for accessibility improvements
export const useAttributeAnnouncement = (user: UserProfile, age: number, height: string) => {
  React.useEffect(() => {
    // Announce user info for screen readers when it changes
    const parts = [];
    
    if (age > 0) parts.push(`${age} years old`);
    if (height) parts.push(`Height ${height}`);
    if (user.gender) parts.push(`${user.gender}`);
    
    if (parts.length > 0) {
      const announcement = `User profile: ${parts.join(', ')}`;
      
      // Use ARIA live region for announcement
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      
      document.body.appendChild(liveRegion);
      
      setTimeout(() => {
        liveRegion.textContent = announcement;
        
        setTimeout(() => {
          document.body.removeChild(liveRegion);
        }, 1000);
      }, 100);
    }
  }, [user.gender, age, height]);
};