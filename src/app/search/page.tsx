'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { Search, BookOpen, Code2, FileText, MessageSquare, Projector, Filter, SlidersHorizontal } from 'lucide-react';

const searchFilters = [
  { id: 'all', label: 'All Results' },
  { id: 'courses', label: 'Courses' },
  { id: 'lessons', label: 'Lessons' },
  { id: 'code', label: 'Code Snippets' },
  { id: 'notes', label: 'Notes' },
  { id: 'doubts', label: 'Doubts' },
  { id: 'projects', label: 'Projects' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Search Input */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courses, lessons, code, notes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-2xl border border-border bg-card text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
              {searchFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors border',
                    activeFilter === filter.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Results */}
            {query ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i} hover className="cursor-pointer">
                    <CardContent className="flex items-start gap-4 py-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        {i % 2 === 0 ? <Code2 className="h-5 w-5 text-primary" /> : <BookOpen className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium">Python Variable Assignment</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          Learn how to assign values to variables in Python. Variables are containers for storing data values.
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="default" size="sm">Lesson</Badge>
                          <span className="text-xs text-muted-foreground">Python Programming • Module 2</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">Search across all your learning content</p>
                <p className="text-sm text-muted-foreground mt-1">Courses, lessons, code, notes, doubts, and more</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
