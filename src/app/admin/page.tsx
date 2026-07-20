'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  Users,
  BookOpen,
  BarChart3,
  Settings,
  Shield,
  Bell,
  TrendingUp,
  Activity,
  Server,
  Database,
  Zap,
  Download,
  RefreshCw,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'ai', label: 'AI Agents', icon: Zap },
    { id: 'system', label: 'System', icon: Server },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const stats = [
    { icon: Users, label: 'Total Users', value: '52,847', change: '+12%', color: 'bg-blue-500/10 text-blue-500' },
    { icon: BookOpen, label: 'Active Courses', value: '486', change: '+8%', color: 'bg-green-500/10 text-green-500' },
    { icon: Activity, label: 'Daily Active', value: '12,483', change: '+15%', color: 'bg-purple-500/10 text-purple-500' },
    { icon: Server, label: 'AI Responses', value: '1.2M', change: '+24%', color: 'bg-cyan-500/10 text-cyan-500' },
  ];

  const recentUsers = [
    { name: 'Alex Thompson', email: 'alex@example.com', status: 'active', date: '2 min ago' },
    { name: 'Sarah Chen', email: 'sarah@example.com', status: 'active', date: '15 min ago' },
    { name: 'James Wilson', email: 'james@example.com', status: 'inactive', date: '1 hour ago' },
    { name: 'Maria Garcia', email: 'maria@example.com', status: 'active', date: '3 hours ago' },
  ];

  const aiAgents = [
    { name: 'Curriculum Agent', status: 'online', tasks: 12, uptime: '99.9%' },
    { name: 'Teacher Agent', status: 'online', tasks: 45, uptime: '99.8%' },
    { name: 'Whiteboard Agent', status: 'online', tasks: 28, uptime: '99.7%' },
    { name: 'Voice Agent', status: 'online', tasks: 156, uptime: '99.9%' },
    { name: 'Coding Agent', status: 'online', tasks: 89, uptime: '99.6%' },
    { name: 'Quiz Agent', status: 'degraded', tasks: 34, uptime: '98.2%' },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Admin Panel</h1>
                <p className="text-muted-foreground">Monitor and manage your platform</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" dot>All Systems Operational</Badge>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-8 p-1 rounded-xl bg-accent/50 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                    activeTab === tab.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="flex items-start justify-between py-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <p className="text-xs text-green-500 mt-1">{stat.change}</p>
                    </div>
                    <div className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Users */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Users</CardTitle>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentUsers.map((user) => (
                      <div key={user.email} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {user.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.status === 'active' ? 'success' : 'secondary'} dot size="sm">
                            {user.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{user.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Agents */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>AI Agents Status</CardTitle>
                  <Badge variant="success" size="sm">All Agents Running</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiAgents.map((agent) => (
                      <div key={agent.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'h-2 w-2 rounded-full',
                            agent.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                          )} />
                          <div>
                            <p className="text-sm font-medium">{agent.name}</p>
                            <p className="text-xs text-muted-foreground">{agent.tasks} active tasks</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{agent.uptime}</p>
                          <p className="text-xs text-muted-foreground">uptime</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
