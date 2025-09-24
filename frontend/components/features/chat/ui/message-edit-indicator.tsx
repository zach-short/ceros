'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface MessageEditIndicatorProps {
  originalContent: string;
  editedAt: string;
  className?: string;
}

export function MessageEditIndicator({
  originalContent,
  editedAt,
  className = '',
}: MessageEditIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const formatEditTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-auto p-0 text-xs opacity-70 hover:opacity-100 ${className}`}
      >
        <Edit className="w-3 h-3 mr-1" />
        edited
      </Button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-50"
        >
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              Edited {formatEditTime(editedAt)}
            </div>
            <div className="text-sm">
              <div className="font-medium mb-1">Original message:</div>
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs break-words whitespace-pre-wrap">
                {originalContent}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}