'use client';

import { useState, useMemo } from 'react';
import { useConversations } from '@/hooks/api/use-chat';
import { ConversationItem } from './conversation-item';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { ConversationSummary } from '@/lib/api/chat';
import { toast } from 'sonner';

interface ConversationsListProps {
  searchQuery?: string;
  isEditMode?: boolean;
  selectedRoomIds?: string[];
  onToggleSelection?: (roomId: string) => void;
}

export function ConversationsList({
  searchQuery,
  isEditMode = false,
  selectedRoomIds = [],
  onToggleSelection,
}: ConversationsListProps = {}) {
  const { data: conversationsData, loading, error } = useConversations();
  const [conversationStates, setConversationStates] = useState<
    Record<string, Partial<ConversationSummary>>
  >({});

  const conversations = useMemo(() => {
    const baseConversations = conversationsData?.conversations || [];
    return baseConversations
      .map((conv) => ({
        ...conv,
        ...conversationStates[conv.roomId],
      }))
      .filter((conv) => !conv.isArchived)
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });
  }, [conversationsData, conversationStates]);

  const handlePin = (roomId: string) => {
    setConversationStates((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        isPinned: !prev[roomId]?.isPinned,
      },
    }));
    toast.success(
      conversationStates[roomId]?.isPinned
        ? 'Conversation unpinned'
        : 'Conversation pinned',
    );
  };

  const handleMute = (roomId: string) => {
    setConversationStates((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        isMuted: !prev[roomId]?.isMuted,
      },
    }));
    toast.success(
      conversationStates[roomId]?.isMuted
        ? 'Conversation unmuted'
        : 'Conversation muted',
    );
  };

  const handleArchive = (roomId: string) => {
    setConversationStates((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        isArchived: true,
      },
    }));
    toast.success('Conversation archived');
  };

  const handleDelete = (roomId: string) => {
    setConversationStates((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        isArchived: true,
      },
    }));
    toast.success('Conversation deleted');
  };

  const handleMarkUnread = (roomId: string) => {
    setConversationStates((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        unreadCount: 1,
      },
    }));
    toast.success('Marked as unread');
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <DefaultLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-12'>
        <p className='text-red-500'>Failed to load conversations</p>
        <p className='text-sm text-gray-500'>Please try refreshing the page</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='max-w-md mx-auto'>
          <h3 className='text-lg font-medium mb-2'>No conversations yet</h3>
          <p className='text-gray-500'>
            Start a conversation by visiting a friend&apos;s profile and sending
            them a message.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-lg '>
      <div className='gap-y-2'>
        {conversations.map((conversation: ConversationSummary) => (
          <ConversationItem
            key={conversation.roomId}
            conversation={conversation}
            searchQuery={searchQuery}
            isEditMode={isEditMode}
            isSelected={selectedRoomIds.includes(conversation.roomId)}
            onToggleSelection={onToggleSelection}
            onPin={handlePin}
            onMute={handleMute}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onMarkUnread={handleMarkUnread}
          />
        ))}
      </div>
    </div>
  );
}
