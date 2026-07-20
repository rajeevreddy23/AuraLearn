'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  ThumbsUp,
  Share2,
  Users,
  Globe,
  TrendingUp,
  Sparkles,
  MessageCircle,
  Send,
  Plus,
} from 'lucide-react';

const discussions = [
  { title: 'Best approach for learning Python?', author: 'Alex T.', replies: 24, likes: 56, category: 'Programming', time: '2 hours ago' },
  { title: 'Help with neural network architecture', author: 'Sarah C.', replies: 18, likes: 42, category: 'AI', time: '5 hours ago' },
  { title: 'Tips for passing certification exams', author: 'Mike R.', replies: 31, likes: 89, category: 'General', time: '1 day ago' },
  { title: 'Building a portfolio as a self-taught dev', author: 'Emma W.', replies: 45, likes: 120, category: 'Career', time: '2 days ago' },
];

export default function CommunityPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant="primary" size="md" className="mb-4">
                <Users className="h-3.5 w-3.5 mr-1" />
                50,000+ Members
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                Join the <span className="text-gradient">Community</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Connect with fellow learners, share knowledge, and grow together
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button variant="primary" size="lg">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Join Discussion
                </Button>
                <Button variant="outline" size="lg">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Trending
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-3">
            {discussions.map((discussion, i) => (
              <motion.div
                key={discussion.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card hover className="cursor-pointer">
                  <CardContent className="flex items-start gap-4 py-4">
                    <Avatar fallback={discussion.author} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-medium">{discussion.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Posted by {discussion.author} • {discussion.time}
                          </p>
                        </div>
                        <Badge variant="default" size="sm">{discussion.category}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {discussion.replies} replies
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          {discussion.likes} likes
                        </span>
                        <Share2 className="h-3.5 w-3.5" />
                      </div>
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
