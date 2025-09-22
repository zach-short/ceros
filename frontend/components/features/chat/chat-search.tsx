'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ChatSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ChatSearch({ searchQuery, onSearchChange }: ChatSearchProps) {
  return (
    <div className='relative'>
      <Search
        className='absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50'
        size={20}
      />
      <Input
        placeholder='Search messages and committees...'
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className='pl-10'
      />
    </div>
  );
}