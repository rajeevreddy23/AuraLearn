'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  Bell,
  BookOpen,
  Award,
  Flame,
  MessageSquare,
  Zap,
  CheckCheck,
  Settings,
  Trash2,
  Star,
  Calendar,
  Clock,
} from 'lucide-react';

const notifications = [
  { icon: BookOpen, title: 'New lesson available', desc: 'Module 3: Functions & Modules is now available', time: '5 min ago', read: false, color: 'bg-blue-500/10 text-blue-500' },
  { icon: Flame, title: '7-day streak achieved!', desc: 'Keep it up! You have been learning for 7 days straight.', time: '1 hour ago', read: false, color: 'bg-orange-500/10 text-orange-500' },
  { icon: Award, title: 'Certificate earned', desc: 'Your Python Programming certificate is ready to download.', time: '3 hours ago', read: false, color: 'bg-yellow-500/10 text-yellow-500' },
  { icon: MessageSquare, title: 'New reply to your discussion', desc: 'Alex replied to your question about variables.', time: '1 day ago', read: true, color: 'bg-green-500/10 text-green-500' },
  { icon: Star, title: 'Course recommendation', desc: 'Based on your progress, try Deep Learning next.', time: '2 days ago', read: true, color: 'bg-purple-500/10 text-purple-500' },
  { icon: Calendar, title: 'Study reminder', desc: 'You have a study session scheduled in 1 hour.', time: '3 days ago', read: true, color: 'bg-cyan-500/10 text-cyan-500' },
];

export default function NotificationsPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Notifications</h1>
                <p className="text-muted-foreground">Stay updated with your learning journey</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {notifications.map((notif, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={cn('transition-colors', !notif.read && 'bg-primary/[0.02] border-primary/20')}>
                    <CardContent className="flex items-start gap-4 py-4">
                      <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', notif.color)}>
                        <notif.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-medium text-sm">{notif.title}</h4>
                            <p className="text-sm text-muted-foreground">{notif.desc}</p>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">{notif.time}</span>
                        </div>
                      </div>
                      {!notif.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
