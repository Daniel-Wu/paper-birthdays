'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Paper, FeaturedPaperEntry } from '@/lib/api/types';

interface HistoryTimelineProps {
  papers: FeaturedPaperEntry[];
  onDateSelect?: (date: string) => void;
  onPaperClick?: (paper: Paper) => void;
  selectedDate?: string;
  className?: string;
  showZoomControls?: boolean;
  groupBy?: 'day' | 'week' | 'month';
}

interface TimelineGroup {
  date: string;
  displayDate: string;
  papers: FeaturedPaperEntry[];
  position: number;
}

interface HoverPreview {
  paper: Paper;
  position: { x: number; y: number };
  visible: boolean;
}

const ZOOM_LEVELS = [
  { level: 1, label: 'Day', groupBy: 'day' as const, width: 80 },
  { level: 2, label: 'Week', groupBy: 'week' as const, width: 120 },
  { level: 3, label: 'Month', groupBy: 'month' as const, width: 200 }
];

export function HistoryTimeline({
  papers,
  onDateSelect,
  onPaperClick,
  selectedDate,
  className,
  showZoomControls = true,
  groupBy = 'day'
}: HistoryTimelineProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [hoverPreview, setHoverPreview] = useState<HoverPreview>({
    paper: {} as Paper,
    position: { x: 0, y: 0 },
    visible: false
  });
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Group papers by time period
  const timelineGroups = useMemo(() => {
    const groups = new Map<string, FeaturedPaperEntry[]>();
    const currentZoom = ZOOM_LEVELS.find(z => z.level === zoomLevel);
    const currentGroupBy = currentZoom?.groupBy || groupBy;

    papers.forEach(entry => {
      const date = new Date(entry.featuredDate);
      let groupKey: string;

      switch (currentGroupBy) {
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          groupKey = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          groupKey = entry.featuredDate;
      }

      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(entry);
    });

    // Convert to array and sort by date
    const sortedGroups: TimelineGroup[] = Array.from(groups.entries())
      .map(([date, papers], index) => ({
        date,
        displayDate: groups.get(date) ? 
          (currentGroupBy === 'month' ? 
            new Date(date + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) :
            currentGroupBy === 'week' ?
              `Week of ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` :
              new Date(date).toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short', 
                day: 'numeric',
                year: new Date(date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
              })
          ) : date,
        papers,
        position: index
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return sortedGroups;
  }, [papers, zoomLevel, groupBy]);

  // Handle paper hover
  const handlePaperHover = (paper: Paper, event: React.MouseEvent, visible: boolean) => {
    if (visible) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setHoverPreview({
        paper,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        },
        visible: true
      });
    } else {
      setHoverPreview(prev => ({ ...prev, visible: false }));
    }
  };

  // Handle zoom change
  const handleZoomChange = (newLevel: number) => {
    setZoomLevel(newLevel);
  };

  // Handle scroll
  const handleScroll = (direction: 'left' | 'right') => {
    if (!timelineRef.current) return;

    const scrollAmount = 200;
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount;

    timelineRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  // Update scroll position on scroll
  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const handleScrollUpdate = () => {
      setScrollPosition(timeline.scrollLeft);
    };

    timeline.addEventListener('scroll', handleScrollUpdate);
    return () => timeline.removeEventListener('scroll', handleScrollUpdate);
  }, []);

  const currentZoom = ZOOM_LEVELS.find(z => z.level === zoomLevel);
  const itemWidth = currentZoom?.width || 80;

  return (
    <div className={cn('w-full', className)}>
      {/* Controls */}
      {showZoomControls && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">View:</span>
            {ZOOM_LEVELS.map((zoom) => (
              <Button
                key={zoom.level}
                variant={zoomLevel === zoom.level ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleZoomChange(zoom.level)}
                className="h-8"
              >
                {zoom.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleScroll('left')}
              disabled={scrollPosition <= 0}
              className="h-8 w-8 p-0"
              aria-label="Scroll left"
            >
              <Icon name="chevron-left" className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleScroll('right')}
              className="h-8 w-8 p-0"
              aria-label="Scroll right"
            >
              <Icon name="chevron-right" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Timeline Container */}
      <div
        ref={containerRef}
        className="relative bg-gray-50 rounded-lg p-4 overflow-hidden"
      >
        {/* Timeline */}
        <div
          ref={timelineRef}
          className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-2"
          style={{ scrollbarWidth: 'thin' }}
        >
          {timelineGroups.map((group) => (
            <TimelineItem
              key={group.date}
              group={group}
              isSelected={selectedDate === group.date}
              width={itemWidth}
              onDateSelect={onDateSelect}
              onPaperClick={onPaperClick}
              onPaperHover={handlePaperHover}
            />
          ))}
        </div>

        {/* Timeline Line */}
        <div className="absolute bottom-16 left-4 right-4 h-0.5 bg-gray-300" />

        {/* Today Marker */}
        {timelineGroups.length > 0 && (
          <div className="absolute bottom-14 left-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <div className="text-xs text-blue-600 font-medium mt-1 whitespace-nowrap">
              Today
            </div>
          </div>
        )}
      </div>

      {/* Hover Preview */}
      {hoverPreview.visible && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: hoverPreview.position.x,
            top: hoverPreview.position.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <Card className="p-3 max-w-sm shadow-lg border bg-white animate-in fade-in-0 zoom-in-95">
            <h4 className="font-medium text-sm mb-1 line-clamp-2">
              {hoverPreview.paper.title}
            </h4>
            <p className="text-xs text-gray-600 mb-2">
              {hoverPreview.paper.authors?.slice(0, 2).map(a => a.name).join(', ')}
              {hoverPreview.paper.authors?.length > 2 && ` +${hoverPreview.paper.authors.length - 2} more`}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" size="sm">
                {hoverPreview.paper.citationCount?.toLocaleString()} citations
              </Badge>
              <Badge variant="outline" size="sm">
                {hoverPreview.paper.primaryCategory}
              </Badge>
            </div>
          </Card>
        </div>
      )}

      {/* Summary */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {timelineGroups.length} {currentZoom?.label.toLowerCase()}s with{' '}
          {papers.length} papers
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Has papers</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TimelineItemProps {
  group: TimelineGroup;
  isSelected: boolean;
  width: number;
  onDateSelect?: (date: string) => void;
  onPaperClick?: (paper: Paper) => void;
  onPaperHover?: (paper: Paper, event: React.MouseEvent, visible: boolean) => void;
}

function TimelineItem({
  group,
  isSelected,
  width,
  onDateSelect,
  onPaperClick,
  onPaperHover
}: TimelineItemProps) {
  const handleClick = () => {
    onDateSelect?.(group.date);
  };

  const handlePaperClick = (paper: Paper, event: React.MouseEvent) => {
    event.stopPropagation();
    onPaperClick?.(paper);
  };

  return (
    <div
      className="flex-shrink-0 cursor-pointer"
      style={{ width }}
      onClick={handleClick}
    >
      {/* Papers */}
      <div className="space-y-1 mb-4">
        {group.papers.slice(0, 3).map((entry) => (
          <div
            key={entry.paper.id}
            className={cn(
              'h-6 rounded text-xs flex items-center justify-center font-medium',
              'transition-all duration-200 cursor-pointer',
              'bg-green-100 text-green-800 hover:bg-green-200',
              isSelected && 'ring-2 ring-blue-500 bg-blue-100 text-blue-800'
            )}
            onClick={(e) => handlePaperClick(entry.paper, e)}
            onMouseEnter={(e) => onPaperHover?.(entry.paper, e, true)}
            onMouseLeave={(e) => onPaperHover?.(entry.paper, e, false)}
            title={entry.paper.title}
          >
            {entry.paper.citationCount > 999 
              ? `${Math.round(entry.paper.citationCount / 1000)}k`
              : entry.paper.citationCount
            }
          </div>
        ))}
        {group.papers.length > 3 && (
          <div className="h-4 text-xs text-gray-500 text-center">
            +{group.papers.length - 3} more
          </div>
        )}
      </div>

      {/* Date Marker */}
      <div className="relative">
        <div
          className={cn(
            'w-3 h-3 rounded-full mx-auto transition-all duration-200',
            isSelected 
              ? 'bg-blue-500 ring-4 ring-blue-200' 
              : 'bg-gray-400 hover:bg-gray-500'
          )}
        />
        
        {/* Date Label */}
        <div
          className={cn(
            'absolute top-6 left-1/2 transform -translate-x-1/2',
            'text-xs font-medium whitespace-nowrap transition-colors duration-200',
            isSelected ? 'text-blue-700' : 'text-gray-600'
          )}
        >
          {group.displayDate}
        </div>
      </div>
    </div>
  );
}

export default HistoryTimeline;