'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 text-stone-600">
      <div className="flex items-center gap-2.5 bg-white p-5 rounded-lg border border-stone-200 shadow-xs">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-800" />
        <span className="text-sm font-medium">Initializing Annapurna platform...</span>
      </div>
    </div>
  );
}
