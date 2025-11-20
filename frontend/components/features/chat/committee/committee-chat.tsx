'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useWebSocket } from '@/hooks/use-web-socket';
import { useSession } from 'next-auth/react';
import { ChatHeader } from '../ui/chat-header';
import { MessagesList } from '../ui/messages-list';
import { MessageInput } from '../ui/message-input';
import { TypingIndicator } from '../ui/typing-indicator';
import { MessageSearchSheet } from '../ui/message-search-sheet';
import { Message, User } from '../ui/types';
import {
  useCommitteeChat,
  useCommitteeHistory,
  useToggleMessageReaction,
  useEditMessage,
  useDeleteMessage,
} from '@/hooks/api/use-committee-chat';
import { CenteredDiv } from '@/components/shared/layout/centered-div';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { transformMessagesWithReactions } from '@/lib/utils/message-utils';
import { Committee } from '@/models/committee';
import { CommitteeMotionsSheet } from './sheets/committee-motions-sheet';
import { getCommitteePicture } from '@/lib/utils/committee-avatar';

export default function CommitteeChat() {
  const params = useParams();
  const committeeId = params.id as string;
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [committee, setCommittee] = useState<Committee | null>(null);
  const [motions, setMotions] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<
    Array<{ userId: string; name: string }>
  >([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [motionsSheetOpen, setMotionsSheetOpen] = useState(false);
  const [replyState, setReplyState] = useState<
    { messageId: string; content: string } | undefined
  >(undefined);
  const [editState, setEditState] = useState<
    { messageId: string; content: string } | undefined
  >(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializationAttempted = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    mutate: startCommitteeChat,
    loading: startingChat,
    error: startChatError,
  } = useCommitteeChat({
    onSuccess: (data) => {
      setRoomId(data.roomId);
    },
    onError: (error) => {
      console.error('Failed to start committee chat:', error);
    },
  });

  const { data: historyData, loading: historyLoading } = useCommitteeHistory(
    committeeId,
    !!session?.apiToken && !!committeeId,
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewMessage = (data: any) => {
    const message = data.message || data;
    const sender = data.sender;

    if (message.roomId === roomId) {
      const transformedMessage = session?.user?.id
        ? transformMessagesWithReactions([message], session.user.id)[0]
        : message;

      setMessages((prev) => {
        const exists = prev.some(
          (m) =>
            m.id === message.id ||
            (m.content === message.content &&
              m.senderId === message.senderId &&
              Math.abs(
                new Date(m.timestamp).getTime() -
                  new Date(message.timestamp).getTime(),
              ) < 5000),
        );
        if (exists) {
          return prev.map((m) =>
            m.id.startsWith('temp-') &&
            m.content === message.content &&
            m.senderId === message.senderId
              ? transformedMessage
              : m,
          );
        }
        return [...prev, transformedMessage];
      });

      if (sender && message.senderId !== session?.user?.id) {
        setUsers((prevUsers) => {
          const userExists = prevUsers.some((u) => u.id === sender.id);
          if (!userExists) {
            const newUser: User = {
              id: sender.id,
              name: sender.name || 'Unknown User',
              email: '',
              picture: sender.picture,
            };
            return [...prevUsers, newUser];
          }
          return prevUsers;
        });
      } else if (!sender && message.senderId !== session?.user?.id) {
        setUsers((prevUsers) => {
          const userExists = prevUsers.some((u) => u.id === message.senderId);
          if (!userExists) {
            const placeholderUser: User = {
              id: message.senderId,
              name: 'Unknown User',
              email: '',
            };
            return [...prevUsers, placeholderUser];
          }
          return prevUsers;
        });
      }
    }
  };

  const handleTypingUpdate = (data: {
    userId: string;
    roomId: string;
    isTyping: boolean;
    name?: string;
  }) => {
    if (data.roomId !== roomId) return;

    setTypingUsers((prev) => {
      if (data.isTyping) {
        if (!prev.some((u) => u.userId === data.userId) && data.name) {
          return [...prev, { userId: data.userId, name: data.name }];
        }
      } else {
        return prev.filter((u) => u.userId !== data.userId);
      }
      return prev;
    });
  };

  const transformMotion = (motion: any) => ({
    ...motion,
    moverId: motion.mover_id || motion.moverId,
    seconderId: motion.seconder_id || motion.seconderId,
    committeeId: motion.committee_id || motion.committeeId,
    createdAt: motion.created_at || motion.createdAt,
    updatedAt: motion.updated_at || motion.updatedAt,
    votingEndsAt: motion.voting_ends_at || motion.votingEndsAt,
    votes: motion.votes?.map((vote: any) => ({
      ...vote,
      id: vote._id || vote.id,
      motionId: vote.motion_id || vote.motionId,
      userId: vote.user_id || vote.userId,
      createdAt: vote.created_at || vote.createdAt,
    })) || [],
  });

  const handleMotionEvent = (payload: any) => {
    if (payload.action === 'motion_proposed' && payload.payload?.motion) {
      const transformedMotion = transformMotion(payload.payload.motion);
      setMotions((prev) => {
        const exists = prev.some((m) => m.id === transformedMotion.id);
        if (exists) return prev;
        return [...prev, transformedMotion];
      });

      if (payload.payload?.message) {
        const transformedMessage = session?.user?.id
          ? transformMessagesWithReactions(
              [payload.payload.message],
              session.user.id,
            )[0]
          : payload.payload.message;

        setMessages((prev) => {
          const exists = prev.some((m) => m.id === transformedMessage.id);
          if (exists) return prev;
          return [...prev, transformedMessage];
        });
      }
    } else if (
      payload.action === 'motion_seconded' &&
      payload.payload?.motion
    ) {
      const transformedMotion = transformMotion(payload.payload.motion);
      setMotions((prev) =>
        prev.map((m) =>
          m.id === transformedMotion.id ? transformedMotion : m,
        ),
      );
    } else if (payload.action === 'vote_cast' && payload.payload?.motion) {
      const transformedMotion = transformMotion(payload.payload.motion);
      setMotions((prev) =>
        prev.map((m) =>
          m.id === transformedMotion.id ? transformedMotion : m,
        ),
      );
    }
  };

  const {
    isConnected,
    sendMessage,
    replyToMessage,
    sendTypingStart,
    sendTypingStop,
    proposeMotion,
    secondMotion,
    voteOnMotion,
    joinRoom,
  } = useWebSocket({
    onMessage: (payload: any) => {
      if (payload.action && ['motion_proposed', 'motion_seconded', 'vote_cast'].includes(payload.action)) {
        handleMotionEvent(payload);
      } else {
        handleNewMessage(payload);
      }
    },
    onTypingUpdate: handleTypingUpdate,
    onConnect: () => {},
    onDisconnect: () => {},
  });

  useEffect(() => {
    const shouldInitialize =
      committeeId &&
      session?.user?.id &&
      session?.apiToken &&
      !startingChat &&
      !roomId &&
      !startChatError &&
      !initializationAttempted.current;

    if (shouldInitialize) {
      initializationAttempted.current = true;
      startCommitteeChat(committeeId);
    }
  }, [
    committeeId,
    session?.user?.id,
    session?.apiToken,
    startCommitteeChat,
    startingChat,
    roomId,
    startChatError,
  ]);

  useEffect(() => {
    if (historyData?.messages && session?.user?.id) {
      setMessages(
        transformMessagesWithReactions(historyData.messages, session.user.id),
      );
    }
    if (historyData?.users) {
      setUsers(historyData.users);
    }
    if (historyData?.committee) {
      setCommittee(historyData.committee);
    }
    if (historyData?.motions) {
      setMotions(historyData.motions.map(transformMotion));
    }
  }, [historyData, session?.user?.id]);

  useEffect(() => {
    if (roomId && isConnected) {
      joinRoom(roomId);
    }
  }, [roomId, isConnected, joinRoom]);

  useEffect(() => {
    if (historyData?.roomId && isConnected && !roomId) {
      setRoomId(historyData.roomId);
    }
  }, [historyData?.roomId, isConnected, roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content: string) => {
    if (!roomId || !isConnected || !session?.user?.id) return;

    if (replyState) {
      handleReplyToMessage(replyState.messageId, content);
      setReplyState(undefined);
    } else {
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        type: 'group',
        senderId: session.user.id,
        content,
        roomId: roomId,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempMessage]);
      sendMessage(roomId, content, 'group');
    }
  };

  const handleReplyToMessage = (parentMessageId: string, content: string) => {
    if (!roomId || !isConnected || !session?.user?.id) return;

    const tempMessage: Message = {
      id: `temp-reply-${Date.now()}`,
      type: 'reply',
      senderId: session.user.id,
      content,
      roomId: roomId,
      parentMessageId,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    replyToMessage(roomId, content, parentMessageId);
  };

  const handleScrollToMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add(
        'bg-blue-600',
        'transition-colors',
        'duration-1000',
      );
      setTimeout(() => {
        element.classList.remove('bg-blue-600');
      }, 2000);
    }
  };

  const { mutate: toggleReaction } = useToggleMessageReaction({
    onSuccess: (data) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg.id === data.messageId) {
            return { ...msg, reactions: data.reactions };
          }
          return msg;
        }),
      );
    },
  });

  const { mutate: editMessage } = useEditMessage({
    onSuccess: (data) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg.id === data.id) {
            return {
              ...msg,
              content: data.content,
              isEdited: true,
              editedAt: data.editedAt,
              originalContent: data.originalContent,
            };
          }
          return msg;
        }),
      );
    },
  });

  const { mutate: deleteMessage } = useDeleteMessage({
    onSuccess: (data) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== data.messageId),
      );
    },
  });


  const handleReaction = (messageId: string, emoji: string) => {
    toggleReaction({ messageId, emoji });
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    editMessage({ messageId, content: newContent });
    setEditState(undefined);
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  const handleStartEdit = (messageId: string, content: string) => {
    setEditState({ messageId, content });
    setReplyState(undefined);
  };

  const handleStartReply = (messageId: string, content: string) => {
    setReplyState({ messageId, content });
    setEditState(undefined);
  };

  const handleCancelReply = () => {
    setReplyState(undefined);
  };

  const handleCancelEdit = () => {
    setEditState(undefined);
  };

  const handleTyping = () => {
    if (!roomId || !isConnected) return;

    sendTypingStart(roomId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStop(roomId);
    }, 3000);
  };

  const handleStopTyping = () => {
    if (!roomId || !isConnected) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    sendTypingStop(roomId);
  };

  const handleVoteMotion = async (
    motionId: string,
    vote: 'aye' | 'nay' | 'abstain',
  ) => {
    if (!roomId || !isConnected) return;
    try {
      voteOnMotion(roomId, motionId, vote);
    } catch (error) {
      console.error('Failed to vote on motion:', error);
    }
  };

  const handleSecondMotion = async (motionId: string) => {
    if (!roomId || !isConnected) return;
    try {
      secondMotion(roomId, motionId);
    } catch (error) {
      console.error('Failed to second motion:', error);
    }
  };

  const handleCreateMotion = async (title: string, description: string) => {
    if (!committeeId || !roomId || !isConnected) return;
    proposeMotion(roomId, title, description, committeeId);
  };

  if (!session) {
    return (
      <CenteredDiv>
        <DefaultLoader />
      </CenteredDiv>
    );
  }

  if (startChatError) {
    return (
      <div className='text-center p-4'>
        <p className='text-red-500'>Failed to initialize committee chat</p>
        <p className='text-sm text-gray-500'>Please try refreshing the page</p>
      </div>
    );
  }

  const committeeName = committee?.name || 'Committee';
  const activeMotionCount = motions.filter((m) =>
    ['proposed', 'seconded', 'open'].includes(m.status),
  ).length;

  return (
    <>
      <div className='flex h-[calc(100vh-4rem)] sm:h-screen'>
        <div className='flex flex-col flex-1 max-w-4xl mx-auto'>
          <ChatHeader
            recipientName={committeeName}
            recipientId={committeeId}
            recipientPicture={
              committee ? getCommitteePicture(committee) : undefined
            }
            isConnected={isConnected}
            isLoading={historyLoading || startingChat}
            onToggleMotions={activeMotionCount > 0 ? () => setMotionsSheetOpen(true) : undefined}
            onOpenSearch={() => setSearchOpen(true)}
            chatType='committee'
            activeMotionCount={activeMotionCount}
          />

          <div className='flex flex-1 relative min-h-0 overflow-hidden'>
            <div className='flex flex-col flex-1'>
              <div className='flex-1 min-h-0 overflow-hidden'>
                <MessagesList
                  ref={messagesEndRef}
                  messages={messages}
                  users={users}
                  currentUserId={session.user.id}
                  recipientName={committeeName}
                  isLoading={historyLoading && messages.length === 0}
                  onReply={handleStartReply}
                  onReaction={handleReaction}
                  onEdit={handleStartEdit}
                  onDelete={handleDeleteMessage}
                  onScrollToMessage={handleScrollToMessage}
                  chatType='committee'
                  motions={motions}
                  onVoteMotion={handleVoteMotion}
                  onSecondMotion={handleSecondMotion}
                />
              </div>

              <TypingIndicator typingUsers={typingUsers} chatType='committee' />

              <div className='lg:block hidden flex-shrink-0'>
                <MessageInput
                  isConnected={isConnected}
                  onSendMessage={handleSendMessage}
                  showMotionButton={true}
                  replyState={replyState}
                  editState={editState}
                  onReplyCancel={handleCancelReply}
                  onEditCancel={handleCancelEdit}
                  onEditSave={handleEditMessage}
                  onTyping={handleTyping}
                  onStopTyping={handleStopTyping}
                  participants={users}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='lg:hidden block fixed bottom-16 left-0 right-0 bg-background border-t'>
        <MessageInput
          isConnected={isConnected}
          onSendMessage={handleSendMessage}
          showMotionButton={true}
          replyState={replyState}
          editState={editState}
          onReplyCancel={handleCancelReply}
          onEditCancel={handleCancelEdit}
          onEditSave={handleEditMessage}
          onTyping={handleTyping}
          onStopTyping={handleStopTyping}
          participants={users}
        />
      </div>

      <MessageSearchSheet
        open={searchOpen}
        onOpenChange={setSearchOpen}
        messages={messages}
        onSelectMessage={handleScrollToMessage}
      />

      {activeMotionCount > 0 && (
        <CommitteeMotionsSheet
          open={motionsSheetOpen}
          onOpenChange={setMotionsSheetOpen}
          motions={motions}
          committee={committee}
          onCreateMotion={handleCreateMotion}
          isSubmitting={false}
        />
      )}
    </>
  );
}
