'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  BellOff,
  Globe,
  Volume2,
  Eye,
  Keyboard,
  Download,
  Shield,
  Palette,
  Languages,
  Type,
  Sparkles,
} from 'lucide-react';

const settingsSections = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'language', label: 'Language & Region', icon: Languages },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'accessibility', label: 'Accessibility', icon: Eye },
  { id: 'audio', label: 'Audio & Voice', icon: Volume2 },
  { id: 'keyboard', label: 'Keyboard Shortcuts', icon: Keyboard },
  { id: 'storage', label: 'Storage & Downloads', icon: Download },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('appearance');
  const [fontSize, setFontSize] = useState('medium');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    courseUpdates: true,
    reminders: true,
    achievements: true,
  });

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <Card className="lg:col-span-1 h-fit">
                <CardContent className="p-2 space-y-1">
                  {settingsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        activeSection === section.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                    >
                      <section.icon className="h-4 w-4" />
                      {section.label}
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Content */}
              <div className="lg:col-span-3 space-y-6">
                {activeSection === 'appearance' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Theme</CardTitle>
                        <CardDescription>Choose your preferred color scheme</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { id: 'light', icon: Sun, label: 'Light' },
                            { id: 'dark', icon: Moon, label: 'Dark' },
                            { id: 'system', icon: Monitor, label: 'System' },
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() => setTheme(t.id as 'light' | 'dark' | 'system')}
                              className={cn(
                                'flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all',
                                theme === t.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              )}
                            >
                              <t.icon className={cn('h-6 w-6', theme === t.id ? 'text-primary' : 'text-muted-foreground')} />
                              <span className={cn('text-sm font-medium', theme === t.id && 'text-primary')}>{t.label}</span>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Font Size</CardTitle>
                        <CardDescription>Adjust text size across the platform</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          {['small', 'medium', 'large'].map((size) => (
                            <button
                              key={size}
                              onClick={() => setFontSize(size)}
                              className={cn(
                                'px-6 py-3 rounded-xl border-2 text-sm font-medium transition-all',
                                fontSize === size
                                  ? 'border-primary bg-primary/5 text-primary'
                                  : 'border-border hover:border-primary/50'
                              )}
                            >
                              {size.charAt(0).toUpperCase() + size.slice(1)}
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {activeSection === 'notifications' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>Control how you receive updates</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {Object.entries(notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="text-xs text-muted-foreground">Receive {key.replace(/([A-Z])/g, ' $1').toLowerCase()} notifications</p>
                          </div>
                          <button
                            onClick={() => setNotifications({ ...notifications, [key]: !value })}
                            className={cn(
                              'h-7 w-12 rounded-full transition-colors relative',
                              value ? 'bg-primary' : 'bg-muted'
                            )}
                          >
                            <div className={cn(
                              'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
                              value ? 'translate-x-6' : 'translate-x-0.5'
                            )} />
                          </button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {activeSection === 'language' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Language</CardTitle>
                      <CardDescription>Select your preferred language for the platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-border bg-background"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="zh">中文</option>
                        <option value="ja">日本語</option>
                        <option value="ko">한국어</option>
                        <option value="ar">العربية</option>
                        <option value="hi">हिन्दी</option>
                        <option value="pt">Português</option>
                      </select>
                    </CardContent>
                  </Card>
                )}

                {activeSection === 'accessibility' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Accessibility</CardTitle>
                      <CardDescription>Customize your experience for better accessibility</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {[
                        { label: 'High Contrast Mode', desc: 'Increase contrast for better readability' },
                        { label: 'Reduced Motion', desc: 'Minimize animations and transitions' },
                        { label: 'Screen Reader Support', desc: 'Optimize for screen readers' },
                        { label: 'Auto Captions', desc: 'Show captions for AI voice narration' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                          <button className="h-7 w-12 rounded-full bg-muted transition-colors relative">
                            <div className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow translate-x-0.5" />
                          </button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Placeholder for other sections */}
                {['audio', 'keyboard', 'storage', 'privacy'].includes(activeSection) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace(/-/g, ' ')}</CardTitle>
                      <CardDescription>Settings coming soon</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center h-32 text-muted-foreground">
                        <p>This section is under development</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
