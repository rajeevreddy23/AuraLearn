'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, GraduationCap, Globe, Clock, Award } from 'lucide-react';

const stats = [
  { icon: Users, value: '50K+', label: 'Active Students' },
  { icon: BookOpen, value: '500+', label: 'Courses' },
  { icon: GraduationCap, value: '10K+', label: 'Certificates Issued' },
  { icon: Globe, value: '12+', label: 'Languages' },
  { icon: Clock, value: '2M+', label: 'Learning Hours' },
  { icon: Award, value: '25K+', label: 'Projects Completed' },
];

export const StatsSection: React.FC = () => {
  return (
    <section className="relative py-20 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
