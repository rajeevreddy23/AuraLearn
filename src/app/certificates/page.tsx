'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  Award,
  Download,
  Share2,
  Linkedin,
  Search,
  GraduationCap,
  CheckCircle,
  Clock,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function CertificatesPage() {
  const certificates = [
    {
      title: 'Complete Python Programming',
      issuer: 'AURA Learn',
      date: '2024-01-15',
      id: 'AURA-CERT-001-2024',
      grade: 'A',
      skills: ['Python', 'OOP', 'Data Structures'],
      verified: true,
    },
    {
      title: 'Deep Learning Fundamentals',
      issuer: 'AURA Learn',
      date: '2024-03-20',
      id: 'AURA-CERT-002-2024',
      grade: 'A+',
      skills: ['Neural Networks', 'PyTorch', 'CNN'],
      verified: true,
    },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Your Certificates</h1>
                <p className="text-muted-foreground">Showcase your achievements and skills</p>
              </div>
              <Badge variant="primary" size="md">
                <Award className="h-3.5 w-3.5 mr-1" />
                {certificates.length} Earned
              </Badge>
            </div>

            <div className="space-y-6">
              {certificates.map((cert, i) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-primary via-purple-500 to-cyan-500" />
                    <CardContent className="py-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center shrink-0">
                            <Award className="h-7 w-7 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{cert.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Issued by {cert.issuer} • {new Date(cert.date).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant="success" size="sm">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                              <span className="text-sm font-medium">Grade: {cert.grade}</span>
                              <span className="text-xs text-muted-foreground">ID: {cert.id}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {cert.skills.map((skill) => (
                                <Badge key={skill} variant="default" size="sm">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                          <Button variant="outline" size="sm">
                            <Linkedin className="h-4 w-4 mr-2" />
                            LinkedIn
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
