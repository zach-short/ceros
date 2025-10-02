'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Edit } from 'lucide-react';
import { useState } from 'react';

interface MessageEditIndicatorProps {
  originalContent: string;
  editedAt: string;
  className?: string;
}

export function MessageEditIndicator({
  originalContent,
  editedAt,
}: MessageEditIndicatorProps) {
  const [open, setOpen] = useState(false);

  const formatEditTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    const timeString = date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (diffHours < 24) {
      return `Today ${timeString}`;
    } else if (diffDays < 2) {
      return `Yesterday ${timeString}`;
    } else if (diffDays < 7) {
      const dayName = date.toLocaleDateString([], { weekday: 'long' });
      return `${dayName} ${timeString}`;
    } else {
      const monthDay = date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      });
      return `${monthDay} ${timeString}`;
    }
  };

  return (
    <Popover open={open} onOpenChange={() => setOpen(!open)}>
      <PopoverTrigger
        className={`flex bg-yellow-400/30 border px-2 py-1 text-xs rounded-full flex-row items-center gap-1 mt-1`}
      >
        <Edit className='w-3 h-3' />
        <p className={``}>edited</p>
      </PopoverTrigger>

      <PopoverContent
        onClick={() => setOpen(!open)}
        className='absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-50'
      >
        <div className='space-y-2'>
          <div className='text-xs text-muted-foreground'>
            Edited {formatEditTime(editedAt)}
          </div>
          <div className='text-sm'>
            <div className='p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs break-words whitespace-pre-wrap'>
              {originalContent}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
