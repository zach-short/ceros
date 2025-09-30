'use client';

import { Check, CheckCheck } from 'lucide-react';

interface ReadReceiptIndicatorProps {
  isOwn: boolean;
  deliveredAt?: string;
  readBy?: string[];
  recipientId?: string;
  chatType?: 'dm' | 'committee';
}

export function ReadReceiptIndicator({
  isOwn,
  deliveredAt,
  readBy,
  recipientId,
  chatType = 'dm',
}: ReadReceiptIndicatorProps) {
  // Only show read receipts for DMs and only on own messages
  if (!isOwn || chatType !== 'dm') return null;

  const isRead = readBy && readBy.length > 0 && recipientId && readBy.includes(recipientId);
  const isDelivered = !!deliveredAt;

  if (isRead) {
    return (
      <CheckCheck
        size={14}
        className='text-blue-500'
        aria-label='Read'
      />
    );
  }

  if (isDelivered) {
    return (
      <CheckCheck
        size={14}
        className='text-gray-400'
        aria-label='Delivered'
      />
    );
  }

  return (
    <Check
      size={14}
      className='text-gray-400'
      aria-label='Sent'
    />
  );
}