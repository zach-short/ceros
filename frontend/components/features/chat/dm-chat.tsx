'use client';

import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '@/hooks/use-web-socket';
import { useSession } from 'next-auth/react';
import { useStartDM, useDMHistory } from '@/hooks/api/use-chat';
import { ChatHeader } from './chat-header';
import { MessagesList } from './messages-list';
import { MessageInput } from './message-input';
import { Message } from './types';
import { CenteredDiv } from '@/components/shared/layout/centered-div';
import { DefaultLoader } from '@/components/shared/layout/loader';

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
  const [roomId, setRoomId] = useState<string | null>(null);
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
              ? message
              : m,
          );
        }
        return [...prev, message];
      });
    }
  };

  const { isConnected, sendMessage, joinRoom } = useWebSocket({
    onMessage: handleNewMessage,
    onConnect: () => console.log('Connected to chat'),
    onDisconnect: () => console.log('Disconnected from chat'),
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
    if (historyData?.messages) {
      setMessages(historyData.messages);
    }
  }, [historyData]);

  useEffect(() => {
    if (roomId && isConnected) {
      console.log('Joining room:', roomId);
      joinRoom(roomId);
    }
  }, [roomId, isConnected, joinRoom]);

  useEffect(() => {
    if (historyData?.roomId && isConnected && !roomId) {
      console.log('Setting roomId from history:', historyData.roomId);
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
    <div className='flex flex-col h-full max-w-3xl mx-auto border rounded-lg mt-8 lg:mt-6'>
      <ChatHeader
        recipientName={recipientName}
        recipientId={recipientId}
        recipientPicture={recipientPicture}
        isConnected={isConnected}
        isLoading={historyLoading || startingDM}
      />

      <MessagesList
        ref={messagesEndRef}
        messages={messages}
        currentUserId={session.user.id}
        recipientName={recipientName}
        isLoading={historyLoading && messages.length === 0}
      />

      <MessageInput
        isConnected={isConnected}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
