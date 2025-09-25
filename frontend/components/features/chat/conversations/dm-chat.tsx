'use client';

import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '@/hooks/use-web-socket';
import { useSession } from 'next-auth/react';
import {
  useStartDM,
  useDMHistory,
  useToggleMessageReaction,
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

  const handleNewMessage = (message: Message) => {
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

  const { isConnected, sendMessage, replyToMessage, joinRoom } = useWebSocket({
    onMessage: handleNewMessage,
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

  const handleReaction = (messageId: string, emoji: string) => {
    toggleReaction({ messageId, emoji });
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
    <div className='flex flex-col h-full max-w-3xl mx-auto border rounded-lg lg:mt-6'>
      <ChatHeader
        recipientName={recipientName}
        recipientId={recipientId}
        recipientPicture={recipientPicture}
        isConnected={isConnected}
        isLoading={historyLoading || startingDM}
        chatType='dm'
      />

      <MessagesList
        ref={messagesEndRef}
        messages={messages}
        users={users}
        currentUserId={session.user.id}
        recipientName={recipientName}
        isLoading={historyLoading && messages.length === 0}
        onReply={handleReply}
        onOpenThread={handleOpenThread}
        onReaction={handleReaction}
        onScrollToMessage={handleScrollToMessage}
        chatType='dm'
      />

      <MessageInput
        isConnected={isConnected}
        onSendMessage={handleSendMessage}
      />

      {threadMessage && (
        <ThreadView
          parentMessage={threadMessage}
          onClose={handleCloseThread}
          onSendReply={handleSendReply}
          currentUserId={session.user.id}
        />
      )}
    </div>
  );
}
