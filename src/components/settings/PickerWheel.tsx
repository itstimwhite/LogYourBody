import React, { useState, useEffect, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { tw, settingsTokens } from '@/styles/settings-design';

interface PickerColumn {
  values: string[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  label?: string;
}

interface PickerWheelProps {
  columns: PickerColumn[];
  className?: string;
  itemHeight?: number;
  visibleItems?: number;
}

export const PickerWheel = React.memo<PickerWheelProps>(function PickerWheel({
  columns,
  className,
  itemHeight = 40,
  visibleItems = 6,
}) {
  const containerHeight = itemHeight * visibleItems;
  const centerOffset = (visibleItems - 1) / 2;

  return (
    <div 
      className={cn('flex justify-center gap-4', className)}
      style={{ height: `${containerHeight}px` }}
    >
      {columns.map((column, columnIndex) => (
        <PickerColumn
          key={columnIndex}
          column={column}
          itemHeight={itemHeight}
          visibleItems={visibleItems}
          centerOffset={centerOffset}
        />
      ))}
    </div>
  );
});

const PickerColumn = React.memo<{
  column: PickerColumn;
  itemHeight: number;
  visibleItems: number;
  centerOffset: number;
}>(function PickerColumn({ column, itemHeight, visibleItems, centerOffset }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragOffset(info.offset.y);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    setDragOffset(0);

    // Calculate new index based on drag distance
    const totalOffset = info.offset.y;
    const itemsOffset = Math.round(totalOffset / itemHeight);
    const newIndex = Math.max(0, Math.min(column.values.length - 1, column.selectedIndex - itemsOffset));
    
    if (newIndex !== column.selectedIndex) {
      column.onIndexChange(newIndex);
    }
  };

  const handleItemClick = (index: number) => {
    if (!isDragging) {
      column.onIndexChange(index);
    }
  };

  const getItemOpacity = (index: number) => {
    const distance = Math.abs(index - column.selectedIndex);
    if (distance === 0) return 1;
    if (distance === 1) return 0.6;
    if (distance === 2) return 0.3;
    return 0.1;
  };

  const getItemScale = (index: number) => {
    const distance = Math.abs(index - column.selectedIndex);
    if (distance === 0) return 1;
    if (distance === 1) return 0.9;
    return 0.8;
  };

  return (
    <div className="relative flex-1 max-w-[120px]">
      {/* Label */}
      {column.label && (
        <div className={cn(tw.helperText, 'text-center mb-2')}>
          {column.label}
        </div>
      )}

      {/* Picker container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        style={{ height: `${itemHeight * visibleItems}px` }}
      >
        {/* Selection indicator */}
        <div
          className="absolute left-0 right-0 border-t border-b border-primary/30 bg-primary/5 pointer-events-none z-10"
          style={{
            top: `${itemHeight * centerOffset}px`,
            height: `${itemHeight}px`,
          }}
        />

        {/* Items */}
        <motion.div
          className="relative"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={{
            y: (centerOffset - column.selectedIndex) * itemHeight + dragOffset,
          }}
          transition={isDragging ? { duration: 0 } : settingsTokens.animation.normal}
        >
          {column.values.map((value, index) => (
            <motion.button
              key={index}
              onClick={() => handleItemClick(index)}
              className={cn(
                'w-full flex items-center justify-center text-center transition-all duration-200',
                'focus:outline-none focus:bg-primary/10',
                tw.focus
              )}
              style={{ height: `${itemHeight}px` }}
              animate={{
                opacity: getItemOpacity(index),
                scale: getItemScale(index),
              }}
              transition={settingsTokens.animation.fast}
              whileTap={{ scale: 0.95 }}
              aria-label={`Select ${value}`}
            >
              <span className={cn(
                'font-medium text-[18pt]',
                index === column.selectedIndex ? 'text-white' : 'text-white/60'
              )}>
                {value}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
});

// Date picker specific implementation
export const DatePickerWheel = React.memo<{
  date: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}>(function DatePickerWheel({ date, onDateChange, className }) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  const [selectedMonth, setSelectedMonth] = useState(date.getMonth());
  const [selectedDay, setSelectedDay] = useState(date.getDate() - 1);
  const [selectedYear, setSelectedYear] = useState(years.indexOf(date.getFullYear().toString()));

  // Update date when any component changes
  useEffect(() => {
    const newDate = new Date(
      parseInt(years[selectedYear]),
      selectedMonth,
      parseInt(days[selectedDay])
    );
    
    // Validate date and prevent future dates
    const today = new Date();
    if (newDate <= today && !isNaN(newDate.getTime())) {
      onDateChange(newDate);
    }
  }, [selectedMonth, selectedDay, selectedYear, years, days, onDateChange]);

  const columns: PickerColumn[] = [
    {
      values: months,
      selectedIndex: selectedMonth,
      onIndexChange: setSelectedMonth,
      label: 'Month',
    },
    {
      values: days,
      selectedIndex: selectedDay,
      onIndexChange: setSelectedDay,
      label: 'Day',
    },
    {
      values: years,
      selectedIndex: selectedYear,
      onIndexChange: setSelectedYear,
      label: 'Year',
    },
  ];

  return <PickerWheel columns={columns} className={className} />;
});

// Height picker specific implementation
export const HeightPickerWheel = React.memo<{
  heightInCm: number;
  units: 'imperial' | 'metric';
  onHeightChange: (heightInCm: number) => void;
  className?: string;
}>(function HeightPickerWheel({ heightInCm, units, onHeightChange, className }) {
  if (units === 'metric') {
    // Metric: single column for cm (60-250cm)
    const cmValues = Array.from({ length: 191 }, (_, i) => `${i + 60} cm`);
    const selectedIndex = Math.max(0, Math.min(190, heightInCm - 60));

    const columns: PickerColumn[] = [
      {
        values: cmValues,
        selectedIndex,
        onIndexChange: (index) => {
          const newHeight = index + 60;
          if (newHeight >= 60 && newHeight <= 250) {
            onHeightChange(newHeight);
          }
        },
        label: 'Height',
      },
    ];

    return <PickerWheel columns={columns} className={className} />;
  } else {
    // Imperial: feet and inches
    const feet = Array.from({ length: 6 }, (_, i) => `${i + 2}'`); // 2'-7'
    const inches = Array.from({ length: 12 }, (_, i) => `${i}"`); // 0"-11"

    // Convert cm to feet/inches
    const totalInches = Math.round(heightInCm / 2.54);
    const feetValue = Math.floor(totalInches / 12);
    const inchesValue = totalInches % 12;

    const selectedFeet = Math.max(0, Math.min(5, feetValue - 2));
    const selectedInches = Math.max(0, Math.min(11, inchesValue));

    const handleFeetChange = (index: number) => {
      const newFeet = index + 2;
      const totalInches = newFeet * 12 + selectedInches;
      const newHeightCm = Math.round(totalInches * 2.54);
      
      // Minimum height check (2'0" = 61cm)
      if (newHeightCm >= 61) {
        onHeightChange(newHeightCm);
      }
    };

    const handleInchesChange = (index: number) => {
      const newInches = index;
      const totalInches = (selectedFeet + 2) * 12 + newInches;
      const newHeightCm = Math.round(totalInches * 2.54);
      
      // Minimum height check
      if (newHeightCm >= 61) {
        onHeightChange(newHeightCm);
      }
    };

    const columns: PickerColumn[] = [
      {
        values: feet,
        selectedIndex: selectedFeet,
        onIndexChange: handleFeetChange,
        label: 'Feet',
      },
      {
        values: inches,
        selectedIndex: selectedInches,
        onIndexChange: handleInchesChange,
        label: 'Inches',
      },
    ];

    return <PickerWheel columns={columns} className={className} />;
  }
});