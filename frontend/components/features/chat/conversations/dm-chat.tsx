'use client';

import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '@/hooks/use-web-socket';
import { useSession } from 'next-auth/react';
import {
  useStartDM,
  useDMHistory,
  useToggleMessageReaction,
  useEditMessage,
  useDeleteMessage,
} from '@/hooks/api/use-chat';
import { ChatHeader } from '../ui/chat-header';
import { MessagesList } from '../ui/messages-list';
import { MessageInput } from '../ui/message-input';
import { ThreadView } from '../ui/thread-view';
import { Message, User } from '../ui/types';
import { CenteredDiv } from '@/components/shared/layout/centered-div';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { transformMessagesWithReactions } from '@/lib/utils/message-utils';

interface DMChatProps {
  recipientId: string;
  recipientName: string;
  recipientPicture?: string;
}

export function DMChat({
  recipientId,
  recipientName,
  recipientPicture,
}: DMChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [threadMessage, setThreadMessage] = useState<Message | null>(null);
  const [replyState, setReplyState] = useState<{
    messageId: string;
    content: string;
  } | null>(null);
  const [editState, setEditState] = useState<{
    messageId: string;
    content: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializationAttempted = useRef(false);

  const {
    mutate: startDM,
    loading: startingDM,
    error: startDMError,
  } = useStartDM({
    onSuccess: (data) => {
      setRoomId(data.roomId);
    },
    onError: (error) => {
      console.error('Failed to start DM:', error);
    },
  });

  const { data: historyData, loading: historyLoading } = useDMHistory(
    recipientId,
    !!session?.apiToken && !!recipientId,
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewMessage = (data: any) => {
    // Check if data contains both message and sender (new format)
    const message = data.message || data; // Handle both old and new format
    const sender = data.sender;

    if (
      message.roomId === roomId ||
      (recipientId &&
        session?.user?.id &&
        (message.senderId === session.user.id ||
          message.senderId === recipientId))
    ) {
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

      // Add sender data to users if provided and not already exists
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
      }
    }
  };

  const handleReactionUpdate = (data: { messageId: string; reactions: any[] }) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id === data.messageId) {
          return { ...msg, reactions: data.reactions };
        }
        return msg;
      }),
    );
  };

  const { isConnected, sendMessage, replyToMessage, joinRoom } = useWebSocket({
    onMessage: handleNewMessage,
    onReactionUpdate: handleReactionUpdate,
    onConnect: () => {},
    onDisconnect: () => {},
  });

  useEffect(() => {
    const shouldInitialize =
      recipientId &&
      session?.user?.id &&
      session?.apiToken &&
      !startingDM &&
      !roomId &&
      !startDMError &&
      !initializationAttempted.current;

    if (shouldInitialize) {
      initializationAttempted.current = true;
      startDM({ recipientId });
    }
  }, [
    recipientId,
    session?.user?.id,
    session?.apiToken,
    startDM,
    startingDM,
    roomId,
    startDMError,
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
      handleReply(replyState.messageId, content);
      setReplyState(null);
    } else {
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        type: 'dm',
        senderId: session.user.id,
        content,
        roomId: roomId,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempMessage]);
      sendMessage(roomId, content, 'dm');
    }
  };

  const handleReply = (parentMessageId: string, content: string) => {
    if (!roomId || !isConnected || !session?.user?.id) return;

    const tempReply: Message = {
      id: `temp-${Date.now()}`,
      type: 'reply',
      senderId: session.user.id,
      content,
      roomId: roomId,
      timestamp: new Date().toISOString(),
      parentMessageId,
    };

    setMessages((prev) => [...prev, tempReply]);
    replyToMessage(roomId, content, parentMessageId);
  };

  const handleOpenThread = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      setThreadMessage(message);
    }
  };

  const handleCloseThread = () => {
    setThreadMessage(null);
  };

  const handleSendReply = (content: string) => {
    if (!threadMessage) return;
    handleReply(threadMessage.id, content);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === threadMessage.id
          ? { ...m, threadCount: (m.threadCount || 0) + 1 }
          : m,
      ),
    );
  };

  const handleScrollToMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('', 'transition-colors', 'duration-1000');
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
    setEditState(null);
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  const handleStartEdit = (messageId: string, content: string) => {
    setEditState({ messageId, content });
    setReplyState(null);
  };

  const handleStartReply = (messageId: string, content: string) => {
    setReplyState({ messageId, content });
    setEditState(null);
  };

  const handleCancelReply = () => {
    setReplyState(null);
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

  if (startDMError) {
    return (
      <div className='text-center p-4'>
        <p className='text-red-500'>Failed to initialize chat</p>
        <p className='text-sm text-gray-500'>Please try refreshing the page</p>
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-col h-full max-w-3xl mx-auto border rounded-lg'>
        <ChatHeader
          recipientName={recipientName}
          recipientId={recipientId}
          recipientPicture={recipientPicture}
          isConnected={isConnected}
          isLoading={historyLoading || startingDM}
          chatType='dm'
        />

        <div className='flex-1 pb-0 lg:pb-0'>
          <MessagesList
            ref={messagesEndRef}
            messages={messages}
            users={users}
            currentUserId={session.user.id}
            recipientName={recipientName}
            isLoading={historyLoading && messages.length === 0}
            onReply={handleStartReply}
            onOpenThread={handleOpenThread}
            onReaction={handleReaction}
            onEdit={handleStartEdit}
            onDelete={handleDeleteMessage}
            onScrollToMessage={handleScrollToMessage}
            chatType='dm'
          />
        </div>

        <div className='lg:block hidden'>
          <MessageInput
            isConnected={isConnected}
            onSendMessage={handleSendMessage}
            replyState={replyState}
            editState={editState}
            onReplyCancel={handleCancelReply}
            onEditCancel={handleCancelEdit}
            onEditSave={handleEditMessage}
          />
        </div>

        {threadMessage && (
          <ThreadView
            parentMessage={threadMessage}
            onClose={handleCloseThread}
            onSendReply={handleSendReply}
            currentUserId={session.user.id}
          />
        )}
      </div>

      {/* Fixed mobile input */}
      <div className='lg:hidden block'>
        <MessageInput
          isConnected={isConnected}
          onSendMessage={handleSendMessage}
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
