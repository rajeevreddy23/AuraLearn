import { Sparkles } from 'lucide-react';

export default function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-muted rounded animate-pulse mx-auto" />
          <div className="h-3 w-48 bg-muted rounded animate-pulse mx-auto" />
        </div>
      </div>
    </div>
  );
}
