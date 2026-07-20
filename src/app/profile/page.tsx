'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/contexts/StoreContext';
import { User, Mail, Calendar, MapPin, Github, Globe, Edit2, Save, X, Award, BookOpen, Clock, Flame, Trophy } from 'lucide-react';

export default function ProfilePage() {
  const { profile } = useAuth();
  const { xpPoints, level, dailyStreak, studyTime } = useAppStore();
  const [isEditing, setIsEditing] = React.useState(false);

  const stats = [
    { icon: BookOpen, label: 'Courses Completed', value: '3' },
    { icon: Clock, label: 'Study Hours', value: `${Math.floor(studyTime / 60)}h` },
    { icon: Flame, label: 'Day Streak', value: `${dailyStreak}` },
    { icon: Trophy, label: 'Achievements', value: '8' },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Profile Header */}
            <Card className="mb-8 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary via-purple-500 to-cyan-500" />
              <CardContent className="relative -mt-16">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                  <Avatar src={profile?.photoURL} fallback={profile?.displayName} size="2xl" className="border-4 border-background" />
                  <div className="flex-1 pt-4 sm:pt-0">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold">{profile?.displayName || 'Learner'}</h1>
                      <Badge variant="primary" size="sm">Student</Badge>
                    </div>
                    <p className="text-muted-foreground">{profile?.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Recently'}</span>
                      <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {profile?.emailVerified ? 'Verified' : 'Unverified'}</span>
                    </div>
                  </div>
                  <Button
                    variant={isEditing ? 'primary' : 'outline'}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
                    {isEditing ? 'Save' : 'Edit Profile'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left - Details */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <Input label="Display Name" defaultValue={profile?.displayName} />
                        <Input label="Bio" defaultValue="Passionate learner exploring AI and programming" />
                        <Input label="Location" defaultValue="San Francisco, CA" />
                        <Input label="Website" defaultValue="https://example.com" leftIcon={<Globe className="h-4 w-4" />} />
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">Passionate learner exploring AI and programming. Always eager to learn new technologies and build cool projects.</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" /> San Francisco, CA
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="h-4 w-4" /> example.com
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Learning Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-48 text-muted-foreground">
                      <p>Activity chart loaded from backend</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right - Stats & Achievements */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stats.map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <stat.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{stat.label}</span>
                        </div>
                        <span className="font-semibold">{stat.value}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">XP Points</span>
                        <span className="font-bold text-primary">{xpPoints.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Level</span>
                        <span className="font-bold text-primary">{level}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      Badges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-accent/50">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Award className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-[10px] text-muted-foreground text-center">Badge {i}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
