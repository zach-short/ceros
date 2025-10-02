'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CommitteeHeaderProps {
  title: string;
  subtitle: string;
}

export function CommitteeHeader({ title, subtitle }: CommitteeHeaderProps) {
  const router = useRouter();

  return (
    <header className="p-4 border-b flex items-center gap-3">
      <button
        onClick={() => router.back()}
        className="p-2 hover:bg-accent rounded-full"
      >
        <ArrowLeft size={20} />
      </button>
      <div>
        <h1 className="font-semibold">{title}</h1>
        <p className="text-sm opacity-75">{subtitle}</p>
      </div>
    </header>
  );
}