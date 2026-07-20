'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/contexts/StoreContext';
import {
  BookOpen,
  Clock,
  Flame,
  Trophy,
  Zap,
  TrendingUp,
  Target,
  Play,
  ArrowRight,
  Calendar,
  Bell,
  GraduationCap,
  Code2,
  Award,
  Star,
} from 'lucide-react';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { xpPoints, level, dailyStreak, studyTime } = useAppStore();

  const quickStats = [
    { icon: BookOpen, label: 'Enrolled', value: '4', color: 'bg-blue-500/10 text-blue-500' },
    { icon: Play, label: 'In Progress', value: '2', color: 'bg-yellow-500/10 text-yellow-500' },
    { icon: Trophy, label: 'Completed', value: '1', color: 'bg-green-500/10 text-green-500' },
    { icon: Clock, label: 'Study Hours', value: `${Math.floor(studyTime / 60)}h`, color: 'bg-purple-500/10 text-purple-500' },
  ];

  const recentCourses = [
    { title: 'Python Programming', progress: 65, nextLesson: 'Functions & Modules', instructor: 'Dr. Sarah Chen' },
    { title: 'Deep Learning', progress: 30, nextLesson: 'Convolutional Neural Networks', instructor: 'Prof. Alex Kumar' },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10"
          >
            <div className="flex items-center gap-4">
              <Avatar src={profile?.photoURL} fallback={profile?.displayName} size="xl" />
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">
                  Welcome back, {profile?.displayName || 'Learner'}
                </h1>
                <p className="text-muted-foreground">Ready to continue your learning journey?</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{xpPoints.toLocaleString()} XP</p>
                  <p className="text-xs text-muted-foreground">Level {level}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10">
                <Flame className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-semibold">{dailyStreak} Days</p>
                  <p className="text-xs text-muted-foreground">Streak</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className={`h-12 w-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Continue Learning */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Continue Learning</CardTitle>
                  <Link href="/courses">
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentCourses.map((course, index) => (
                    <motion.div
                      key={course.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={`/courses/${course.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        <div className="group flex items-start gap-4 p-4 rounded-xl hover:bg-accent/50 transition-colors">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center shrink-0">
                            <BookOpen className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium group-hover:text-primary transition-colors">{course.title}</h4>
                            <p className="text-sm text-muted-foreground">{course.instructor}</p>
                            <div className="mt-2">
                              <Progress value={course.progress} size="sm" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Next: {course.nextLesson}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost" className="shrink-0">
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Learning Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-48 text-muted-foreground">
                    <p>Activity chart coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Daily Goal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Daily Goal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Study Time</span>
                    <span className="font-medium">{studyTime} min / 60 min</span>
                  </div>
                  <Progress value={(studyTime / 60) * 100} />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lessons</span>
                    <span className="font-medium">0 / 3</span>
                  </div>
                  <Progress value={0} />
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: Star, label: 'Quick Learner', desc: 'Complete 3 lessons in a day' },
                    { icon: Flame, label: 'On Fire', desc: '3-day streak' },
                  ].map((achievement, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-accent/50">
                      <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                        <achievement.icon className="h-4 w-4 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{achievement.label}</p>
                        <p className="text-xs text-muted-foreground">{achievement.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Upcoming */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Upcoming
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: Code2, label: 'Coding Challenge', time: 'Today, 6:00 PM' },
                    { icon: GraduationCap, label: 'Quiz: Python Basics', time: 'Tomorrow, 10:00 AM' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                      <Bell className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
