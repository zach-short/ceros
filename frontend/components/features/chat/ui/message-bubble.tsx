'use client';

import { useState } from 'react';
import { Message, User } from '@/models';
import { Motion } from '@/models/motion';
import { UserAvatar } from '@/components/shared/user/user-avatar';
import { MessageReactions } from './message-reactions';
import { MessageEditIndicator } from './message-edit-indicator';
import { ParentMessagePreview } from './parent-message-preview';
import { MessageContextMenu } from './message-context-menu';
import { getDisplayName, UserPrivacyContext } from '@/lib/user-privacy';
import { MotionCardCompact } from '../committee/motions/motion-card-compact';
import { MotionDetailsDialog } from '../committee/motions/motion-details-dialog';

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
  users: User[];
  onReply?: (messageId: string, content: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
  parentMessage?: Message;
  onScrollToParent?: (messageId: string) => void;
  chatType?: 'dm' | 'committee';
  showAvatar?: boolean;
  isFirstInGroup?: boolean;
  motions?: Motion[];
  onVoteMotion?: (motionId: string, vote: 'aye' | 'nay' | 'abstain') => void;
  onSecondMotion?: (motionId: string) => void;
}

const MessageHeader = ({
  sender,
  privacyContext,
}: {
  sender: User | undefined;
  privacyContext: UserPrivacyContext;
}) => {
  const getUserDisplayName = () => {
    if (!sender) return 'Unknown User';
    return getDisplayName(sender, privacyContext);
  };

  return (
    <div className='flex items-baseline'>
      <span className='font-semibold text-xs'>{getUserDisplayName()}</span>
    </div>
  );
};

const MessageContent = ({
  message,
  onReactionClick,
}: {
  message: Message;
  onReactionClick: (emoji: string) => void;
}) => {
  return (
    <>
      <p className='text-xs whitespace-pre-wrap break-words overflow-auto'>
        {message.content}
      </p>

      <div className='flex flex-row items-center gap-2 mt-1'>
        {message.isEdited && message.originalContent && message.editedAt && (
          <MessageEditIndicator
            originalContent={message.originalContent}
            editedAt={message.editedAt}
            className=''
          />
        )}

        {message.reactions && message.reactions.length > 0 && (
          <MessageReactions
            reactions={message.reactions}
            onReactionClick={onReactionClick}
          />
        )}
      </div>
    </>
  );
};

export function MessageBubble({
  message,
  currentUserId,
  users,
  onReply,
  onEdit,
  onReaction,
  onDelete,
  onPin,
  parentMessage,
  onScrollToParent,
  chatType = 'dm',
  showAvatar = true,
  isFirstInGroup = true,
  motions = [],
  onVoteMotion,
  onSecondMotion,
}: MessageBubbleProps) {
  const [isMotionDialogOpen, setIsMotionDialogOpen] = useState(false);

  const sender = users.find((u) => u.id === message.senderId);
  const isOwn = message.senderId === currentUserId;
  const isReply = message.type === 'reply';
  const isMotion = message.type === 'motion';

  const privacyContext: UserPrivacyContext = {
    user: sender || ({ id: message.senderId } as User),
    viewerUserId: currentUserId,
    isOwnProfile: isOwn,
  };

  const handleReaction = (emoji: string) => {
    onReaction?.(message.id, emoji);
  };

  const handleContextMenuReaction = (messageId: string, emoji: string) => {
    onReaction?.(messageId, emoji);
  };

  const motion =
    isMotion && message.motionId
      ? motions.find((m) => m.id === message.motionId)
      : undefined;

  const mover = motion ? users.find((u) => u.id === motion.moverId) : undefined;
  const seconder = motion?.seconderId
    ? users.find((u) => u.id === motion.seconderId)
    : undefined;

  const handleVote = (motionId: string, vote: 'aye' | 'nay' | 'abstain') => {
    onVoteMotion?.(motionId, vote);
  };

  const handleSecond = (motionId: string) => {
    onSecondMotion?.(motionId);
  };

  const handleMotionCardClick = () => {
    setIsMotionDialogOpen(true);
  };

  return (
    <div id={`message-${message.id}`} className='group py-[.5]'>
      {isReply && parentMessage && isFirstInGroup && (
        <div className='mb-2 ml-12'>
          <ParentMessagePreview
            parentMessage={parentMessage}
            isOwnReply={false}
            onClick={() => onScrollToParent?.(parentMessage.id)}
            users={users}
            currentUserId={currentUserId}
          />
        </div>
      )}

      <div className='flex'>
        <div className='flex-shrink-0'>
          {showAvatar && isFirstInGroup && sender && !isMotion ? (
            <div className='pr-2 pb-2'>
              <UserAvatar
                user={sender}
                viewerUserId={currentUserId}
                isOwnProfile={isOwn}
                size='md'
              />
            </div>
          ) : showAvatar && !isMotion ? (
            <div className='w-12 pr-2' />
          ) : null}
        </div>

        <div className='flex-1 w-full min-w-0'>
          {isMotion && motion && mover ? (
            <>
              <div className='py-2'>
                <MotionCardCompact
                  motion={motion}
                  mover={mover}
                  seconder={seconder}
                  onClick={handleMotionCardClick}
                />
              </div>

              <MotionDetailsDialog
                open={isMotionDialogOpen}
                onOpenChange={setIsMotionDialogOpen}
                motion={motion}
                mover={mover}
                seconder={seconder}
                currentUserId={currentUserId}
                onVote={handleVote}
                onSecond={handleSecond}
              />
            </>
          ) : (
            <MessageContextMenu
              message={message}
              isOwn={isOwn}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onReaction={handleContextMenuReaction}
              onPin={onPin}
              chatType={chatType}
            >
              <div
                className='select-none touch-manipulation'
                style={{
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {isFirstInGroup && (
                  <MessageHeader
                    sender={sender}
                    privacyContext={privacyContext}
                  />
                )}

                <div className='flex flex-col'>
                  <MessageContent
                    message={message}
                    onReactionClick={handleReaction}
                  />
                </div>
              </div>
            </MessageContextMenu>
          )}
        </div>
      </div>
    </div>
  );
}
