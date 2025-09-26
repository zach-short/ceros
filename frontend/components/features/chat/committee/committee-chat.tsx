'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useWebSocket } from '@/hooks/use-web-socket';
import { useSession } from 'next-auth/react';
import { ChatHeader } from '../ui/chat-header';
import { MessagesList } from '../ui/messages-list';
import { MessageInput } from '../ui/message-input';
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

export default function CommitteeChat() {
  const params = useParams();
  const committeeId = params.id as string;
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [replyState, setReplyState] = useState<{messageId: string; content: string} | undefined>(undefined);
  const [editState, setEditState] = useState<{messageId: string; content: string} | undefined>(undefined);
  /* const [showMotionPanel, setShowMotionPanel] = useState(false); */
  /* const [threadMessage, setThreadMessage] = useState<Message | null>(null); */
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializationAttempted = useRef(false);

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

  const handleNewMessage = (message: Message) => {
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

      setUsers((prevUsers) => {
        const userExists = prevUsers.some((u) => u.id === message.senderId);
        if (!userExists && message.senderId !== session?.user?.id) {
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
  };

  const {
    isConnected,
    sendMessage,
    replyToMessage,
    /* proposeMotion, */
    /* secondMotion, */
    /* voteOnMotion, */
    joinRoom,
  } = useWebSocket({
    onMessage: handleNewMessage,
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
            return { ...msg, content: data.content, isEdited: true, editedAt: data.editedAt, originalContent: data.originalContent };
          }
          return msg;
        }),
      );
    },
  });

  const { mutate: deleteMessage } = useDeleteMessage({
    onSuccess: (data) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== data.messageId)
      );
    },
  });

  const handleReaction = (messageId: string, emoji: string) => {
    toggleReaction({ messageId, emoji });
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    editMessage({ messageId, content: newContent });
    setEditState(null);
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
    setEditState(null);
  };

  const handleCancelReply = () => {
    setReplyState(undefined);
  };

  const handleCancelEdit = () => {
    setEditState(null);
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

  return (
    <>
      <div className='flex h-[calc(100vh-4rem)] sm:h-screen'>
        <div className='flex flex-col flex-1 max-w-4xl mx-auto'>
          <ChatHeader
            recipientName={`Committee`}
            recipientId={committeeId}
            isConnected={isConnected}
            isLoading={historyLoading || startingChat}
            onToggleMotions={() => {
              window.location.href = `/committees/${committeeId}/motions`;
            }}
            chatType='committee'
          />

          <div className='flex flex-1 relative min-h-0'>
            <div className='flex flex-col flex-1'>
              <div className='flex-1'>
                <MessagesList
                  ref={messagesEndRef}
                  messages={messages}
                  users={users}
                  currentUserId={session.user.id}
                  recipientName={`Committee ${committeeId}`}
                  isLoading={historyLoading && messages.length === 0}
                  onReply={handleStartReply}
                  /* onOpenThread={handleOpenThread} */
                  onReaction={handleReaction}
                  onEdit={handleStartEdit}
                  onDelete={handleDeleteMessage}
                  onScrollToMessage={handleScrollToMessage}
                  chatType='committee'
                />
              </div>

              <div className='lg:block hidden'>
                <MessageInput
                  isConnected={isConnected}
                  onSendMessage={handleSendMessage}
                  /* onProposeMotion={() => setShowMotionPanel(true)} */
                  showMotionButton={true}
                  replyState={replyState}
                  editState={editState}
                  onReplyCancel={handleCancelReply}
                  onEditCancel={handleCancelEdit}
                  onEditSave={handleEditMessage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed mobile input */}
      <div className='lg:hidden block'>
        <MessageInput
          isConnected={isConnected}
          onSendMessage={handleSendMessage}
          /* onProposeMotion={() => setShowMotionPanel(true)} */
          showMotionButton={true}
          replyState={replyState}
          editState={editState}
          onReplyCancel={handleCancelReply}
          onEditCancel={handleCancelEdit}
          onEditSave={handleEditMessage}
        />
      </div>
    </>
  );
}

/*
 const handleProposeMotion = (title: string, description: string) => {
    if (!roomId || !isConnected || !committeeId) return;
    proposeMotion(roomId, title, description, committeeId);
    setShowMotionPanel(false);
  };

  const handleCloseThread = () => {
    setThreadMessage(null);
  };

  const handleSendReply = (content: string) => {
    if (!threadMessage) return;
    handleReplyToMessage(threadMessage.id, content);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === threadMessage.id
          ? { ...m, threadCount: (m.threadCount || 0) + 1 }
          : m,
      ),
    );
  };

  const handleOpenThread = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      setThreadMessage(message);
    }
  };



{showMotionPanel && (
            <>
              <div
                className='fixed inset-0 bg-black/50 z-40 lg:hidden'
                onClick={() => setShowMotionPanel(false)}
              />

              <div className='fixed inset-0 z-50 lg:absolute lg:inset-auto lg:right-4 lg:top-4 lg:bottom-4 lg:w-80 lg:z-40'>
                <MotionPanel
                  onClose={() => setShowMotionPanel(false)}
                  onProposeMotion={handleProposeMotion}
                  roomId={roomId}
                  committeeId={committeeId}
                  onSecondMotion={secondMotion}
                  onVoteMotion={voteOnMotion}
                />
              </div>
            </>
          )}
        </div>


        {threadMessage && (
          <ThreadView
            parentMessage={threadMessage}
            onClose={handleCloseThread}
            onSendReply={handleSendReply}
            currentUserId={session.user.id}
          />
        )}
*/
