'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X } from 'lucide-react';

interface MessageEditFormProps {
  initialContent: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
  className?: string;
}

export function MessageEditForm({
  initialContent,
  onSave,
  onCancel,
  className = '',
}: MessageEditFormProps) {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(content.length, content.length);
    }
  }, [content.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && content.trim() !== initialContent) {
      onSave(content.trim());
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-[60px] resize-none"
        placeholder="Edit your message..."
      />
      <div className="flex gap-2 mt-2">
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || content.trim() === initialContent}
          className="h-7"
        >
          <Check className="w-3 h-3 mr-1" />
          Save
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-7"
        >
          <X className="w-3 h-3 mr-1" />
          Cancel
        </Button>
      </div>
    </form>
  );
}