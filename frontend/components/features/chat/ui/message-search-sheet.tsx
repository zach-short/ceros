'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Message } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageSearchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: Message[];
  onSelectMessage: (messageId: string) => void;
}

export function MessageSearchSheet({
  open,
  onOpenChange,
  messages,
  onSelectMessage,
}: MessageSearchSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMessages = messages.filter((msg) =>
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectMessage = (messageId: string) => {
    onSelectMessage(messageId);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-full sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>Search Messages</SheetTitle>
        </SheetHeader>

        <div className='mt-4 space-y-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search in conversation...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-9'
            />
          </div>

          <ScrollArea className='h-[calc(100vh-200px)]'>
            {searchQuery && (
              <div className='space-y-2'>
                {filteredMessages.length === 0 ? (
                  <div className='text-center py-8 text-muted-foreground'>
                    No messages found
                  </div>
                ) : (
                  filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => handleSelectMessage(msg.id)}
                      className='p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors'
                    >
                      <div className='text-sm line-clamp-2'>{msg.content}</div>
                      <div className='text-xs text-muted-foreground mt-1'>
                        {new Date(msg.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {!searchQuery && (
              <div className='text-center py-8 text-muted-foreground'>
                Type to search messages...
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}