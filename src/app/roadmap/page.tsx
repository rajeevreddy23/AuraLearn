'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { ROADMAPS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ArrowRight, CheckCircle, Target, Clock, Sparkles, GraduationCap, Briefcase } from 'lucide-react';

export default function RoadmapPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant="primary" size="md" className="mb-4">
                <Target className="h-3.5 w-3.5 mr-1" />
                Career Roadmaps
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                Plan Your <span className="text-gradient">Career Journey</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Follow structured learning paths designed to take you from beginner to job-ready professional
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-6">
            {ROADMAPS.map((roadmap, i) => (
              <motion.div
                key={roadmap.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card hover className="overflow-hidden">
                  <CardContent className="py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center shrink-0">
                          <Briefcase className="h-7 w-7 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold">{roadmap.title}</h3>
                            <Badge variant="default" size="sm">{roadmap.level}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{roadmap.description}</p>

                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {roadmap.duration}
                            </span>
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <GraduationCap className="h-4 w-4" />
                              {roadmap.courses.length} courses
                            </span>
                          </div>

                          <div className="mt-4 space-y-2">
                            {roadmap.courses.map((course, ci) => (
                              <div key={ci} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                <span className="text-muted-foreground">{course}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button variant="primary" className="shrink-0">
                        Start Path
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
