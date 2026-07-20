'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { cn, getProgressColor } from '@/lib/utils';
import { useAppStore } from '@/contexts/StoreContext';
import {
  Zap, Flame, Trophy, Star, Award, Target,
  TrendingUp, Crown, Medal, Sparkles, Rocket,
  CheckCircle, Lock, Gift
} from 'lucide-react';

export const GamificationEngine: React.FC = () => {
  const { xpPoints, level, dailyStreak, achievements, badges } = useAppStore();

  const levelData = {
    1: { min: 0, max: 500, title: 'Beginner' },
    2: { min: 500, max: 1500, title: 'Learner' },
    3: { min: 1500, max: 3000, title: 'Apprentice' },
    4: { min: 3000, max: 5000, title: 'Scholar' },
    5: { min: 5000, max: 8000, title: 'Expert' },
    6: { min: 8000, max: 12000, title: 'Master' },
    7: { min: 12000, max: 20000, title: 'Genius' },
    8: { min: 20000, max: 35000, title: 'Professor' },
    9: { min: 35000, max: 50000, title: 'Sage' },
    10: { min: 50000, max: Infinity, title: 'Legend' },
  };

  const currentLevelData = levelData[level as keyof typeof levelData] || levelData[1];
  const nextLevelData = levelData[(level + 1) as keyof typeof levelData];
  const xpProgress = ((xpPoints - currentLevelData.min) / (currentLevelData.max - currentLevelData.min)) * 100;

  const statCards = [
    {
      icon: Flame,
      label: 'Daily Streak',
      value: `${dailyStreak} days`,
      color: 'bg-orange-500/10 text-orange-500',
      progress: Math.min((dailyStreak / 30) * 100, 100),
      target: '30 days',
    },
    {
      icon: Zap,
      label: 'XP Points',
      value: xpPoints.toLocaleString(),
      color: 'bg-yellow-500/10 text-yellow-500',
      progress: xpProgress,
      target: `${nextLevelData ? nextLevelData.min.toLocaleString() : 'MAX'} XP`,
    },
    {
      icon: Trophy,
      label: 'Achievements',
      value: `${achievements.filter(a => a.isUnlocked).length}`,
      color: 'bg-purple-500/10 text-purple-500',
      progress: (achievements.filter(a => a.isUnlocked).length / Math.max(achievements.length, 1)) * 100,
      target: `${achievements.length} total`,
    },
    {
      icon: Award,
      label: 'Level',
      value: `${level}`,
      color: 'bg-blue-500/10 text-blue-500',
      progress: xpProgress,
      target: currentLevelData.title,
    },
  ];

  const recentAchievements = achievements.filter(a => a.isUnlocked).slice(0, 3);
  const lockedAchievements = achievements.filter(a => !a.isUnlocked).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <Card className="overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-yellow-500 via-orange-500 to-purple-500" />
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <span className="text-lg font-bold">Level {level}</span>
                <Badge variant="primary" size="sm">{currentLevelData.title}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {xpPoints.toLocaleString()} / {nextLevelData ? nextLevelData.min.toLocaleString() : 'MAX'} XP to Level {level + 1}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{xpPoints.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
          </div>
          <Progress value={xpProgress} size="md" variant="gradient" animated />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between mb-2">
                <div className={`h-8 w-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <span className="text-xs text-muted-foreground">{stat.target}</span>
              </div>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
              <Progress value={stat.progress} size="sm" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Unlocked */}
          {recentAchievements.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">RECENTLY UNLOCKED</p>
              <div className="space-y-2">
                {recentAchievements.map((ach) => (
                  <div key={ach.id} className="flex items-center gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                    <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{ach.title}</p>
                      <p className="text-xs text-muted-foreground">{ach.description}</p>
                    </div>
                    <Badge variant="success" size="sm">+{ach.xpReward} XP</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">UP NEXT</p>
            <div className="space-y-2">
              {lockedAchievements.map((ach) => (
                <div key={ach.id} className="flex items-center gap-3 p-3 rounded-xl bg-accent/50 opacity-60">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{ach.title}</p>
                    <p className="text-xs text-muted-foreground">{ach.description}</p>
                  </div>
                  <Badge variant="outline" size="sm">{ach.xpReward} XP</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak Celebration */}
      {dailyStreak > 0 && dailyStreak % 7 === 0 && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-6 rounded-2xl bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 text-center"
        >
          <Rocket className="h-8 w-8 text-orange-500 mx-auto mb-2" />
          <p className="font-bold text-lg">{dailyStreak}-Day Streak!</p>
          <p className="text-sm text-muted-foreground">You're on fire! Keep learning daily!</p>
        </motion.div>
      )}
    </div>
  );
};
