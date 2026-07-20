'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { MOCK_COURSES } from '@/lib/constants';
import { formatDuration, formatNumber } from '@/lib/utils';
import {
  Play,
  Clock,
  Users,
  Star,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Download,
  Share2,
  Award,
  ChevronDown,
  FileText,
  Code2,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

const modules = [
  {
    title: 'Getting Started',
    lessons: [
      { title: 'Introduction to Programming', duration: '15 min', type: 'video', completed: true },
      { title: 'Setting Up Your Environment', duration: '20 min', type: 'video', completed: true },
      { title: 'Your First Program', duration: '25 min', type: 'coding', completed: false },
    ],
  },
  {
    title: 'Variables & Data Types',
    lessons: [
      { title: 'Understanding Variables', duration: '20 min', type: 'video', completed: false },
      { title: 'Numbers & Strings', duration: '25 min', type: 'coding', completed: false },
      { title: 'Type Conversion', duration: '15 min', type: 'quiz', completed: false },
    ],
  },
  {
    title: 'Control Flow',
    lessons: [
      { title: 'If Statements', duration: '20 min', type: 'video', completed: false },
      { title: 'Loops', duration: '30 min', type: 'coding', completed: false },
    ],
  },
];

export default function CourseDetailPage() {
  const params = useParams();
  const course = MOCK_COURSES.find((c) => c.id === params.courseId) || MOCK_COURSES[0];

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-10">
        {/* Course Header */}
        <div className="bg-gradient-to-b from-primary/5 via-purple-500/5 to-cyan-500/5 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="md">{course.category}</Badge>
                  <Badge variant="default" size="md">{course.level}</Badge>
                  <Badge variant="success" size="sm" dot>Updated 2024</Badge>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">{course.title}</h1>
                <p className="text-lg text-muted-foreground">{course.description}</p>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold">{course.rating}</span>
                    <span className="text-muted-foreground">(12K+ reviews)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold">{formatNumber(course.enrolledStudents)}</span>
                    <span className="text-muted-foreground">enrolled</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span className="font-semibold">{formatDuration(course.totalDuration)}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-semibold">{course.totalLessons}</span>
                    <span className="text-muted-foreground">lessons</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {course.instructor.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{course.instructor.name}</p>
                    <p className="text-xs text-muted-foreground">{course.instructor.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold">
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </span>
                  <Link href={`/select-teacher?course=${course.id}`}>
                    <Button variant="primary" size="lg" className="group">
                      <Play className="h-5 w-5 mr-2" />
                      Start Learning
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Preview Card */}
              <div className="hidden lg:block">
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/20 via-purple-500/20 to-cyan-500/20 relative overflow-hidden border border-border shadow-2xl">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 transition-transform">
                      <Play className="h-8 w-8 text-primary ml-1" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-sm font-medium">Course Preview</span>
                      <span className="text-xs opacity-75">Watch intro</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main */}
            <div className="lg:col-span-2 space-y-8">
              {/* Learning Outcomes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    What You'll Learn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      'Master Python programming from scratch',
                      'Build real-world applications',
                      'Understand data structures & algorithms',
                      'Work with databases and APIs',
                      'Deploy applications to the cloud',
                      'Write clean, maintainable code',
                    ].map((outcome) => (
                      <div key={outcome} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        {outcome}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Curriculum */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Curriculum</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {modules.map((mod, mi) => (
                    <div key={mi} className="border border-border rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between p-4 bg-accent/30">
                        <div>
                          <h4 className="font-medium">{mod.title}</h4>
                          <p className="text-xs text-muted-foreground">{mod.lessons.length} lessons</p>
                        </div>
                      </div>
                      <div className="divide-y divide-border">
                        {mod.lessons.map((lesson, li) => (
                          <div key={li} className="flex items-center justify-between p-4 hover:bg-accent/30 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                              {lesson.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Play className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm">{lesson.title}</span>
                              <Badge variant="default" size="sm">{lesson.type}</Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardContent className="py-6 text-center space-y-4">
                  <div className="text-3xl font-bold">{course.price === 0 ? 'Free' : `$${course.price}`}</div>
                  <Link href={`/select-teacher?course=${course.id}`}>
                    <Button variant="primary" className="w-full" size="lg">
                      <Play className="h-5 w-5 mr-2" />
                      Enroll Now
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground">30-day money-back guarantee</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>This Course Includes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: Play, label: `${course.totalLessons} on-demand lessons` },
                    { icon: Clock, label: `${formatDuration(course.totalDuration)} total length` },
                    { icon: FileText, label: 'Auto-generated notes' },
                    { icon: Code2, label: 'Interactive coding exercises' },
                    { icon: Award, label: 'Certificate of completion' },
                    { icon: MessageSquare, label: 'AI doubt resolution' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 text-sm">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      {item.label}
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
