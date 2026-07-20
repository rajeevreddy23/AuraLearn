'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Check, X, Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const plans = [
  { id: 'free', name: 'Free', price: 0, priceYearly: 0, description: 'Get started with basic courses', popular: false, features: ['Access to free courses', 'Basic AI teaching', 'Community access', '1 project per month'], limitations: ['Limited quizzes', 'No certificates', 'No voice narration'] },
  { id: 'premium', name: 'Premium', price: 19.99, priceYearly: 191.90, description: 'Unlock unlimited learning', popular: true, features: ['All courses included', 'Advanced AI teaching', 'Voice narration', 'Unlimited projects', 'Certificates', 'Priority support'], limitations: [] },
  { id: 'pro', name: 'Pro', price: 39.99, priceYearly: 383.90, description: 'For serious learners', popular: false, features: ['Everything in Premium', 'Career mentorship', 'Interview preparation', 'Resume review', '1-on-1 AI sessions', 'Early access features'], limitations: [] },
  { id: 'enterprise', name: 'Enterprise', price: 99.99, priceYearly: 959.90, description: 'For teams and organizations', popular: false, features: ['Everything in Pro', 'Team management', 'Custom curriculum', 'API access', 'Dedicated support', 'Analytics dashboard', 'SSO integration'], limitations: [] },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const handleSubscribe = async (planId: string, priceId: string) => {
    if (!user) {
      router.push('/auth/register');
      return;
    }
    if (planId === 'free') {
      toast.success('Free plan activated!');
      router.push('/dashboard');
      return;
    }
    setLoadingPlan(planId);
    try {
      const res = await fetch('/api/v1/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_id: priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Payment setup not configured. Contact support.');
      }
    } catch {
      toast.error('Failed to initiate payment');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant="primary" size="md" className="mb-4">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Pricing
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Simple, Transparent <span className="text-gradient">Pricing</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Choose the plan that fits your learning goals. All plans include AI-powered teaching.
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className={`text-sm ${!isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>Monthly</span>
                <button onClick={() => setIsAnnual(!isAnnual)} className="relative h-7 w-12 rounded-full bg-primary/20 border border-primary/30 transition-colors">
                  <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-primary shadow transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
                <span className={`text-sm ${isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>Annual <span className="text-green-500">Save 20%</span></span>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => {
              const price = isAnnual ? plan.priceYearly : plan.price;
              const priceLabel = isAnnual ? '/year' : '/month';
              const priceId = isAnnual ? `${plan.id}_yearly` : `${plan.id}_monthly`;
              return (
                <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card variant={plan.popular ? 'elevated' : 'default'} className={`h-full flex flex-col relative ${plan.popular ? 'border-primary ring-1 ring-primary' : ''}`}>
                    {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge variant="primary" size="md">Most Popular</Badge></div>}
                    <CardContent className="flex-1 space-y-6 pt-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">${price === 0 ? '0' : price.toFixed(2)}</span>
                        {price > 0 && <span className="text-sm text-muted-foreground">{priceLabel}</span>}
                      </div>
                      <ul className="space-y-3">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />{f}</li>
                        ))}
                        {plan.limitations?.map((l) => (
                          <li key={l} className="flex items-start gap-2 text-sm text-muted-foreground"><X className="h-4 w-4 mt-0.5 shrink-0" />{l}</li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button
                        variant={plan.popular ? 'primary' : 'outline'}
                        className="w-full"
                        size="lg"
                        onClick={() => handleSubscribe(plan.id, priceId)}
                        isLoading={loadingPlan === plan.id}
                      >
                        {plan.price === 0 ? 'Get Started Free' : 'Subscribe Now'}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
