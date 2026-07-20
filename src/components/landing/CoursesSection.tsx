'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MOCK_COURSES } from '@/lib/constants';
import { formatDuration, formatNumber } from '@/lib/utils';
import { Star, Clock, Users, ArrowRight } from 'lucide-react';

const categoryColors: Record<string, string> = {
  programming: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'artificial-intelligence': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'data-science': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  cybersecurity: 'bg-green-500/10 text-green-500 border-green-500/20',
  business: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

const levelColors: Record<string, string> = {
  beginner: 'bg-green-500/10 text-green-500',
  intermediate: 'bg-yellow-500/10 text-yellow-500',
  advanced: 'bg-red-500/10 text-red-500',
};

export const CoursesSection: React.FC = () => {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
              Popular <span className="text-gradient">Courses</span>
            </h2>
            <p className="text-muted-foreground">
              Start your learning journey with our top-rated courses
            </p>
          </div>
          <Link href="/courses">
            <Button variant="ghost" rightIcon={<ArrowRight className="h-4 w-4" />}>
              View All Courses
            </Button>
          </Link>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_COURSES.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/courses/${course.id}`}>
                <Card hover className="h-full overflow-hidden group">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-primary/20 via-purple-500/20 to-cyan-500/20 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-4xl font-bold text-primary/30">{course.title[0]}</div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge variant="default" size="sm" className={categoryColors[course.category]}>
                        {course.category.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
                      </Badge>
                      <Badge variant="default" size="sm" className={levelColors[course.level]}>
                        {course.level}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="space-y-3">
                    <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
                        {course.instructor.name[0]}
                      </div>
                      <span className="text-xs text-muted-foreground">{course.instructor.name}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                        {course.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDuration(course.totalDuration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {formatNumber(course.enrolledStudents)}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="border-t border-border pt-4">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">
                        {course.price === 0 ? (
                          <span className="text-green-500 font-semibold">Free</span>
                        ) : (
                          <span className="font-semibold">${course.price}</span>
                        )}
                      </span>
                      <span className="text-xs text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Enroll Now <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
