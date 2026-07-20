'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AITeacherPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/select-teacher');
  }, [router]);
  return null;
}