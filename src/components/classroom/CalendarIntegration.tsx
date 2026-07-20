'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Clock, BookOpen, Plus, Bell, MoreHorizontal
} from 'lucide-react';

interface StudyEvent {
  id: string;
  title: string;
  time: string;
  duration: string;
  type: 'lesson' | 'quiz' | 'project' | 'review';
  course: string;
}

interface CalendarIntegrationProps {
  className?: string;
}

export const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({ className }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const events: StudyEvent[] = [
    { id: '1', title: 'Python Variables', time: '10:00 AM', duration: '30 min', type: 'lesson', course: 'Python Programming' },
    { id: '2', title: 'Quiz: Data Types', time: '2:00 PM', duration: '20 min', type: 'quiz', course: 'Python Programming' },
    { id: '3', title: 'Project: Calculator', time: '4:00 PM', duration: '1h', type: 'project', course: 'Python Programming' },
  ];

  const studyDays = [5, 7, 8, 12, 14, 15, 19, 21, 22];
  const hasEvent = (day: number) => studyDays.includes(day);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const typeColors = {
    lesson: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    quiz: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    project: 'bg-green-500/10 text-green-500 border-green-500/20',
    review: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  };

  return (
    <div className={cn("flex flex-col p-4 bg-slate-900/60 border border-white/5 rounded-2xl backdrop-blur-md text-white max-w-[280px] mx-auto space-y-4", className)}>
      <div className="flex items-center justify-between w-full border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5 text-slate-200">
          <CalendarIcon className="h-4.5 w-4.5 text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Calendar</span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 hover:bg-white/5 text-indigo-400">
          <Plus className="h-3 w-3 mr-0.5" /> Add
        </Button>
      </div>
      <div className="pt-0">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {monthNames[month]} {year}
          </span>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div key={day} className="text-center text-xs text-muted-foreground font-medium py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isSelected = day === selectedDate;
            const hasStudy = hasEvent(day);

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  'h-8 rounded-lg text-sm relative transition-colors',
                  isToday && 'font-bold text-primary',
                  isSelected && 'bg-primary text-primary-foreground',
                  !isSelected && 'hover:bg-accent',
                )}
              >
                {day}
                {hasStudy && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Today's Events */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className={cn('h-2 w-2 rounded-full shrink-0', typeColors[event.type].split(' ')[0].replace('bg-', 'bg-'))} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{event.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {event.time} • {event.duration}
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent">
                    {event.course}
                  </span>
                </div>
              </div>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
