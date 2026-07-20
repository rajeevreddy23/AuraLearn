'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { MOCK_COURSES, TEACHER_STYLES } from '@/lib/constants';
import {
  GraduationCap, Sparkles, Brain, Heart, Zap, BookOpen,
  ChevronRight, ArrowLeft, Bot, Quote, Volume2
} from 'lucide-react';

export default function SelectTeacherPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('course');
  const topic = searchParams.get('topic');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const course = courseId ? MOCK_COURSES.find(c => c.id === courseId) : null;

  const handleStart = () => {
    if (!selectedStyle) return;
    const params = new URLSearchParams();
    if (courseId) params.set('course', courseId);
    if (topic) params.set('topic', topic);
    params.set('teacher', selectedStyle);
    router.push(`/classroom?${params.toString()}`);
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      'GraduationCap': <GraduationCap className="h-8 w-8" />,
      'Brain': <Brain className="h-8 w-8" />,
      'Heart': <Heart className="h-8 w-8" />,
      'Zap': <Zap className="h-8 w-8" />,
      'BookOpen': <BookOpen className="h-8 w-8" />,
    };
    return icons[iconName] || <Bot className="h-8 w-8" />;
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <Badge variant="primary" size="md" className="mb-3">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Choose Your AI Teacher
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              How would you like to learn?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {course
                ? `You're learning "${course.title}". Pick a teaching style that matches your learning preference.`
                : topic
                  ? `You want to learn about "${topic}". Pick a teaching style that matches your learning preference.`
                  : 'Each AI teacher has a unique style. Pick the one that clicks with you.'}
            </p>
          </motion.div>

          {/* Teacher Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {TEACHER_STYLES.map((style, index) => (
              <motion.div
                key={style.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedStyle(style.id)}
                className={cn(
                  'relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200',
                  selectedStyle === style.id
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
                )}
              >
                {selectedStyle === style.id && (
                  <div className="absolute top-3 right-3">
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <ChevronRight className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
                <div className="space-y-4">
                  <div
                    className="h-14 w-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: style.color + '20', color: style.color }}
                  >
                    {getIcon(style.icon)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{style.name}</h3>
                    <p className="text-sm text-muted-foreground">{style.title}</p>
                  </div>
                  <p className="text-sm">{style.tagline}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="default" size="sm">{style.teachingApproach}</Badge>
                    <Badge variant="default" size="sm">{style.pace} pace</Badge>
                    {style.useHumor && <Badge variant="default" size="sm">Fun</Badge>}
                    {style.useAnalogies && <Badge variant="default" size="sm">Analogies</Badge>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Volume2 className="h-3 w-3" />
                    {style.voiceStyle}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Preview of selected */}
          {selectedStyle && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-accent/30 rounded-2xl p-6 mb-8 border border-border"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Quote className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="font-medium">
                    {TEACHER_STYLES.find(s => s.id === selectedStyle)?.description}
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span>✦ Explanation: {TEACHER_STYLES.find(s => s.id === selectedStyle)?.explanationDepth}</span>
                    {TEACHER_STYLES.find(s => s.id === selectedStyle)?.useAnalogies && <span>✦ Uses real-life analogies</span>}
                    {TEACHER_STYLES.find(s => s.id === selectedStyle)?.useExamples && <span>✦ Lots of examples</span>}
                    {TEACHER_STYLES.find(s => s.id === selectedStyle)?.encourageQuestions && <span>✦ Encourages questions</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Start Button */}
          <div className="text-center">
            <Button
              variant="primary"
              size="xl"
              onClick={handleStart}
              disabled={!selectedStyle}
              className="group text-lg px-10"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Start Learning with {TEACHER_STYLES.find(s => s.id === selectedStyle)?.name || 'AI Teacher'}
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}