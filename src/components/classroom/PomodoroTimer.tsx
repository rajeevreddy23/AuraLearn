'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Play, Pause, RotateCcw, Clock, Coffee, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';

interface PomodoroTimerProps {
  className?: string;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ className }) => {
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const focusTime = 25 * 60;
  const breakTime = 5 * 60;
  const totalDuration = mode === 'focus' ? focusTime : breakTime;

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, audioCtx.currentTime); // high chime
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn("Could not play timer sound chime", e);
    }
  }, [soundEnabled]);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? focusTime : breakTime);
  }, [mode, focusTime, breakTime]);

  const switchMode = useCallback((newMode: 'focus' | 'break') => {
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? focusTime : breakTime);
    setIsRunning(false);
  }, [focusTime, breakTime]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            playNotificationSound();
            if (mode === 'focus') {
              toast.success('Focus session complete! Take a break.');
              setSessions(s => s + 1);
              setMode('break');
              setTimeLeft(breakTime);
              setIsRunning(false);
            } else {
              toast.success('Break over! Ready to focus again?');
              setMode('focus');
              setTimeLeft(focusTime);
              setIsRunning(false);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, focusTime, breakTime, playNotificationSound]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;
  
  // Circle layout configuration
  const radius = 60;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center justify-center p-4 bg-slate-900/60 border border-white/5 rounded-2xl backdrop-blur-md text-white max-w-[240px] mx-auto', className)}>
      <div className="flex items-center justify-between w-full mb-3 px-1 text-slate-400">
        <span className="text-xs font-semibold uppercase tracking-wider">Timer</span>
        <button onClick={() => setSoundEnabled(!soundEnabled)} className="hover:text-white transition-colors">
          {soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4" />}
        </button>
      </div>

      {/* Mode Switches */}
      <div className="flex gap-1.5 p-0.5 rounded-lg bg-white/5 mb-4 select-none">
        <button
          onClick={() => switchMode('focus')}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all duration-300',
            mode === 'focus' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-slate-400 hover:text-white'
          )}
        >
          <Clock className="h-3 w-3" />
          Focus
        </button>
        <button
          onClick={() => switchMode('break')}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all duration-300',
            mode === 'break' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-slate-400 hover:text-white'
          )}
        >
          <Coffee className="h-3 w-3" />
          Break
        </button>
      </div>

      {/* Circular Timer Ring */}
      <div className="relative flex items-center justify-center w-36 h-36 mb-4 select-none">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            className="text-slate-800"
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={60}
            cy={60}
          />
          {/* Progress circle */}
          <circle
            className={cn("transition-all duration-300 ease-out", mode === 'focus' ? "text-primary" : "text-emerald-400")}
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx={60}
            cy={60}
          />
        </svg>

        {/* Center details */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-black tracking-tight tabular-nums">
            {formatTime(timeLeft)}
          </span>
          <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">
            {mode === 'focus' ? 'study' : 'rest'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2.5">
        <Button
          variant={isRunning ? 'outline' : 'primary'}
          size="sm"
          onClick={toggleTimer}
          className="h-8 text-xs px-4"
        >
          {isRunning ? <Pause className="h-3.5 w-3.5 mr-1" /> : <Play className="h-3.5 w-3.5 mr-1" />}
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button variant="ghost" size="icon" onClick={reset} className="h-8 w-8 hover:bg-white/5">
          <RotateCcw className="h-3.5 w-3.5 text-slate-300" />
        </Button>
      </div>

      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-3.5">
        Sessions complete: {sessions}
      </p>
    </div>
  );
};
