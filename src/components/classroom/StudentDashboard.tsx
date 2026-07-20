'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import { 
  Award, TrendingUp, AlertTriangle, CheckCircle, 
  Clock, BookOpen, ChevronRight, BarChart2 
} from 'lucide-react';

interface StudentDashboardProps {
  level: 'beginner' | 'intermediate' | 'advanced';
  xpPoints: number;
  weakTopics: string[];
  quizHistory: { topic: string; correct: number; total: number; timestamp: Date }[];
  className?: string;
  onClose?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  level,
  xpPoints,
  weakTopics,
  quizHistory,
  className,
  onClose
}) => {
  // Compute metrics
  const totalQuizzes = quizHistory.length;
  const totalCorrect = quizHistory.reduce((sum, item) => sum + item.correct, 0);
  const totalQuestions = quizHistory.reduce((sum, item) => sum + item.total, 0);
  const accuracyRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  
  // XP level calculation (e.g., Level 1 is 0-500 XP, Level 2 is 501-1000 XP, etc.)
  const currentXpLevel = Math.floor(xpPoints / 250) + 1;
  const xpInCurrentLevel = xpPoints % 250;
  const xpProgressPercent = (xpInCurrentLevel / 250) * 100;

  return (
    <Card className={cn("border border-white/10 bg-slate-900/90 text-white backdrop-blur-xl shadow-2xl overflow-hidden max-w-md w-full", className)}>
      <CardHeader className="border-b border-white/5 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <Award className="h-5 w-5 text-indigo-400" />
          Learning Profile
        </CardTitle>
        {onClose && (
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            Close
          </button>
        )}
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6 max-h-[500px] overflow-y-auto scrollbar-thin">
        {/* Level & XP Gauge */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Current Progress</span>
            <Badge variant="default" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/35">
              Level {currentXpLevel}
            </Badge>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black tracking-tight">{xpPoints} <span className="text-xs font-normal text-slate-400">total XP</span></span>
            <span className="text-xs text-slate-400">{xpInCurrentLevel} / 250 XP</span>
          </div>
          <div className="relative pt-1">
            <Progress value={xpProgressPercent} className="h-2 bg-slate-800" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-4">
          {/* Estimated Skill Level */}
          <div className="space-y-1 text-center py-1">
            <TrendingUp className="h-5 w-5 mx-auto text-cyan-400" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimated Level</p>
            <p className="text-base font-bold capitalize text-cyan-300">{level}</p>
          </div>
          {/* Quiz Accuracy */}
          <div className="space-y-1 text-center py-1 border-l border-white/5">
            <BarChart2 className="h-5 w-5 mx-auto text-emerald-400" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quiz Accuracy</p>
            <p className="text-base font-bold text-emerald-400">{accuracyRate}%</p>
          </div>
        </div>

        {/* Weak Topics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Focus Areas
            </span>
            <Badge variant="default" className="bg-amber-500/10 text-amber-300 border-amber-500/25">
              {weakTopics.length} logged
            </Badge>
          </div>
          {weakTopics.length === 0 ? (
            <div className="text-center p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/5">
              <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">All concepts cleared! Great job.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {weakTopics.map((topic, i) => (
                <Badge 
                  key={i} 
                  variant="default" 
                  className="bg-slate-800 text-slate-300 hover:bg-slate-700/80 border border-slate-700 transition-colors capitalize px-2 py-1 text-[11px]"
                >
                  {topic}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Quiz Checkpoint History */}
        <div className="space-y-3">
          <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
            Checkpoint Logs
          </span>
          
          {quizHistory.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No checkpoint quizzes taken yet this session.
            </div>
          ) : (
            <div className="space-y-2">
              {quizHistory.slice(-4).reverse().map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 capitalize truncate">{item.topic}</p>
                    <p className="text-[10px] text-slate-500">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">
                      {item.correct} / {item.total}
                    </span>
                    <Badge 
                      variant="default" 
                      className={cn(
                        "text-[10px] px-1.5 py-0.5",
                        item.correct === item.total 
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" 
                          : "bg-indigo-500/10 text-indigo-400 border-indigo-500/25"
                      )}
                    >
                      {Math.round((item.correct / item.total) * 100)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
