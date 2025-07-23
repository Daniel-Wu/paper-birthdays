'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  selectedDate?: Date;
  onDateChange: (date: Date) => void;
  availableDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  disabled?: boolean;
  showQuickRanges?: boolean;
}

interface QuickRange {
  label: string;
  getValue: () => Date;
}

const QUICK_RANGES: QuickRange[] = [
  {
    label: 'Today',
    getValue: () => new Date()
  },
  {
    label: 'Yesterday',
    getValue: () => {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      return date;
    }
  },
  {
    label: 'Last week',
    getValue: () => {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      return date;
    }
  },
  {
    label: 'Last month',
    getValue: () => {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      return date;
    }
  },
  {
    label: 'Last year',
    getValue: () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 1);
      return date;
    }
  }
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function DatePicker({
  selectedDate,
  onDateChange,
  availableDates = [],
  minDate,
  maxDate = new Date(),
  className,
  disabled = false,
  showQuickRanges = true
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(selectedDate || new Date());

  // Create set of available dates for quick lookup
  const availableDateStrings = useMemo(() => {
    return new Set(availableDates.map(date => date.toDateString()));
  }, [availableDates]);

  // Get calendar data for current view
  const calendarData = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);
    
    // Start from Sunday of the week containing the first day
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // End at Saturday of the week containing the last day
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const weeks: Date[][] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }
    
    return {
      year,
      month,
      weeks,
      monthName: MONTHS[month]
    };
  }, [viewDate]);

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return;
    
    onDateChange(date);
    setIsOpen(false);
  };

  const handleQuickRangeSelect = (range: QuickRange) => {
    const date = range.getValue();
    if (!isDateDisabled(date)) {
      onDateChange(date);
      setViewDate(date);
      setIsOpen(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    if (disabled) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isDateAvailable = (date: Date) => {
    return availableDateStrings.has(date.toDateString());
  };

  const isDateSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  const isDateToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setViewDate(newDate);
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
    setViewDate(newDate);
  };

  const formatSelectedDate = (date?: Date) => {
    if (!date) return 'Select date...';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'w-full justify-between text-left font-normal',
          !selectedDate && 'text-gray-500',
          isOpen && 'ring-2 ring-blue-500'
        )}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Select date"
      >
        <div className="flex items-center gap-2">
          <Icon name="calendar" className="h-4 w-4" />
          <span className="truncate">{formatSelectedDate(selectedDate)}</span>
        </div>
        <Icon
          name="chevron-down"
          className={cn(
            'h-4 w-4 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </Button>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 w-auto min-w-[300px] rounded-lg border bg-white shadow-lg',
            'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2'
          )}
          role="dialog"
          aria-label="Date picker"
        >
          {showQuickRanges && (
            <div className="p-3 border-b">
              <div className="text-sm font-medium text-gray-700 mb-2">Quick select</div>
              <div className="flex flex-wrap gap-1">
                {QUICK_RANGES.map((range) => {
                  const date = range.getValue();
                  const isDisabled = isDateDisabled(date);
                  return (
                    <Button
                      key={range.label}
                      variant="ghost"
                      size="sm"
                      disabled={isDisabled}
                      onClick={() => handleQuickRangeSelect(range)}
                      className={cn(
                        'h-7 px-2 text-xs',
                        isDateSelected(date) && 'bg-blue-100 text-blue-900'
                      )}
                    >
                      {range.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="p-3">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateYear('prev')}
                  className="h-8 w-8 p-0"
                  aria-label="Previous year"
                >
                  <Icon name="chevron-left" className="h-4 w-4" />
                  <Icon name="chevron-left" className="h-4 w-4 -ml-2" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="h-8 w-8 p-0"
                  aria-label="Previous month"
                >
                  <Icon name="chevron-left" className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">
                  {calendarData.monthName} {calendarData.year}
                </h2>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  className="h-8 w-8 p-0"
                  aria-label="Next month"
                >
                  <Icon name="chevron-right" className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateYear('next')}
                  className="h-8 w-8 p-0"
                  aria-label="Next year"
                >
                  <Icon name="chevron-right" className="h-4 w-4" />
                  <Icon name="chevron-right" className="h-4 w-4 -ml-2" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-1">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="h-8 flex items-center justify-center text-xs font-medium text-gray-500"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Weeks */}
              {calendarData.weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-1">
                  {week.map((date, dayIndex) => {
                    const isCurrentMonth = date.getMonth() === calendarData.month;
                    const isDisabled = isDateDisabled(date);
                    const isAvailable = isDateAvailable(date);
                    const isSelected = isDateSelected(date);
                    const isToday = isDateToday(date);

                    return (
                      <button
                        key={dayIndex}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleDateSelect(date)}
                        className={cn(
                          'h-8 w-8 rounded-md text-xs font-medium transition-colors',
                          'flex items-center justify-center relative',
                          'hover:bg-gray-100 disabled:cursor-not-allowed',
                          !isCurrentMonth && 'text-gray-400',
                          isCurrentMonth && 'text-gray-900',
                          isSelected && 'bg-blue-600 text-white hover:bg-blue-700',
                          isToday && !isSelected && 'bg-blue-100 text-blue-900',
                          isDisabled && 'opacity-50',
                          isAvailable && !isSelected && 'ring-1 ring-green-200'
                        )}
                        aria-label={date.toLocaleDateString()}
                        title={isAvailable ? 'Papers available on this date' : undefined}
                      >
                        {date.getDate()}
                        {isAvailable && !isSelected && (
                          <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-green-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            {availableDates.length > 0 && (
              <div className="mt-4 pt-3 border-t">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Has papers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      <span>Selected</span>
                    </div>
                  </div>
                  <Badge variant="outline" size="sm">
                    {availableDates.length} days available
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="p-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;