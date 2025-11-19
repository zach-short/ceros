'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Users,
  Edit,
  Trash2,
  XIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ConversationsList } from '@/components/features/chat/conversations/conversations-list';
import { CommitteeList } from '@/components/features/chat/committee/committee-list';
import { Committee } from '@/models/committee';
import { chatApi } from '@/lib/api/chat';
import { toast } from 'sonner';
import { useConversations } from '@/hooks/api/use-chat';

interface ChatSectionsProps {
  conversationsCount: number;
  committeesCount: number;
  committees: Committee[];
}

function DirectMessagesSection({
  conversationsCount,
}: {
  conversationsCount: number;
}) {
  const [directMessagesExpanded, setDirectMessagesExpanded] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { refetch } = useConversations();

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setSelectedRoomIds([]);
  };

  const handleToggleSelection = (roomId: string) => {
    setSelectedRoomIds((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId],
    );
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedRoomIds.length === 0) return;

    setIsDeleting(true);
    try {
      await chatApi.deleteConversations(selectedRoomIds);
      toast.success(
        `Deleted ${selectedRoomIds.length} conversation${selectedRoomIds.length > 1 ? 's' : ''}`,
      );
      setSelectedRoomIds([]);
      setIsEditMode(false);
      setShowDeleteDialog(false);
      refetch();
    } catch (error) {
      console.error('Failed to delete conversations:', error);
      toast.error('Failed to delete conversations');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className='flex items-center justify-between w-full mb-3'>
        <button
          onClick={() => setDirectMessagesExpanded(!directMessagesExpanded)}
          className='flex items-center gap-2 text-left hover:opacity-75'
        >
          {directMessagesExpanded ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
          <MessageSquare size={16} />
          <span className='font-medium'>Direct Messages</span>
          <span className='text-sm opacity-60'>({conversationsCount})</span>
        </button>

        {selectedRoomIds.length > 0 ? (
          <Button
            variant='destructive'
            size='sm'
            onClick={handleDeleteClick}
            className='h-8'
          >
            <Trash2 size={14} />({selectedRoomIds.length})
          </Button>
        ) : (
          <Button
            variant='ghost'
            size='sm'
            onClick={handleToggleEditMode}
            className='h-8'
          >
            {isEditMode ? <XIcon size={14} /> : <Edit size={14} />}
          </Button>
        )}
      </div>

      <div className={directMessagesExpanded ? 'block' : 'hidden'}>
        <ConversationsList
          isEditMode={isEditMode}
          selectedRoomIds={selectedRoomIds}
          onToggleSelection={handleToggleSelection}
        />
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversations</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedRoomIds.length}{' '}
              conversation{selectedRoomIds.length > 1 ? 's' : ''}? This will
              permanently delete all messages in{' '}
              {selectedRoomIds.length > 1
                ? 'these conversations'
                : 'this conversation'}
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function GroupChatsSection({
  committeesCount,
  committees,
}: {
  committeesCount: number;
  committees: Committee[];
}) {
  const [groupChatsExpanded, setGroupChatsExpanded] = useState(true);
  return (
    <div>
      <button
        onClick={() => setGroupChatsExpanded(!groupChatsExpanded)}
        className='flex items-center gap-2 w-full text-left mb-3 hover:opacity-75'
      >
        {groupChatsExpanded ? (
          <ChevronDown size={16} />
        ) : (
          <ChevronRight size={16} />
        )}
        <Users size={16} />
        <span className='font-medium'>Committees</span>
        <span className='text-sm opacity-60'>({committeesCount})</span>
      </button>

      <div className={groupChatsExpanded ? 'block' : 'hidden'}>
        <CommitteeList committees={committees} />
      </div>
    </div>
  );
}

export function ChatSections({
  conversationsCount,
  committeesCount,
  committees,
}: ChatSectionsProps) {
  return (
    <div className='p-6 space-y-6'>
      <GroupChatsSection
        committeesCount={committeesCount}
        committees={committees}
      />
      <DirectMessagesSection conversationsCount={conversationsCount} />
    </div>
  );
}
