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
    <div className="min-h-screen flex items-center justify-center bg-[#F4F1E8] text-[#26332D]">
      <div className="agri-card p-6 flex items-center gap-3 shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin text-[#17633F]" />
        <span className="text-sm font-semibold text-[#123C2C] font-heading">Initializing Annapurna platform...</span>
      </div>
    </div>
  );
}
