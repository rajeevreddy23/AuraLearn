'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Brain,
  Bot,
  Code2,
  Languages,
  Notebook,
  GraduationCap,
  MessageSquare,
  Sparkles,
  BarChart3,
  Shield,
  Zap,
  Globe,
} from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'AI Professor',
    description: 'Learn from an intelligent AI teacher that explains concepts step by step like a real instructor.',
    color: 'from-primary to-purple-500',
  },
  {
    icon: Brain,
    title: 'Adaptive Learning',
    description: 'AI remembers your strengths, weaknesses, and preferences to personalize every lesson.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Code2,
    title: 'Live Coding Lab',
    description: 'Write, execute, and debug code in real-time with AI guidance and line-by-line explanations.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: MessageSquare,
    title: 'Instant Doubt Resolution',
    description: 'Ask questions anytime. AI answers on a side panel and resumes teaching seamlessly.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Languages,
    title: '12+ Languages',
    description: 'Learn in your preferred language. All content, quizzes, and AI conversations adapt instantly.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Notebook,
    title: 'Auto-Generated Notes',
    description: 'AI creates structured notes, flashcards, cheat sheets, and summaries automatically.',
    color: 'from-red-500 to-rose-500',
  },
  {
    icon: GraduationCap,
    title: 'Smart Certificates',
    description: 'Earn verifiable certificates with unique IDs that employers can validate instantly.',
    color: 'from-indigo-500 to-violet-500',
  },
  {
    icon: BarChart3,
    title: 'Learning Analytics',
    description: 'Track progress, study time, streaks, and performance with beautiful visualizations.',
    color: 'from-teal-500 to-green-500',
  },
  {
    icon: Shield,
    title: 'Career Mentorship',
    description: 'Get personalized career roadmaps, interview prep, and project recommendations.',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: Zap,
    title: 'Gamification',
    description: 'Earn XP, achievements, badges, and compete on leaderboards while learning.',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    icon: Globe,
    title: 'Global Community',
    description: 'Join a worldwide community of learners. Share, discuss, and collaborate.',
    color: 'from-sky-500 to-cyan-500',
  },
  {
    icon: Sparkles,
    title: 'AI Project Builder',
    description: 'Get practical projects with milestones, guidance, and portfolio suggestions.',
    color: 'from-fuchsia-500 to-pink-500',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Everything You Need to{' '}
            <span className="text-gradient">Master Any Subject</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A complete AI-powered learning ecosystem that adapts to your style, pace, and goals.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Card hover className="h-full group">
                <CardContent className="space-y-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
