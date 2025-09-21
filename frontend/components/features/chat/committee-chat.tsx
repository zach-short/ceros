'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useWebSocket } from '@/hooks/use-web-socket';
import { useSession } from 'next-auth/react';
import { ChatHeader } from './chat-header';
import { MessagesList } from './messages-list';
import { MessageInput } from './message-input';
import { MotionPanel } from './motion-panel';
import { Message } from './types';
import {
  useCommitteeChat,
  useCommitteeHistory,
} from '@/hooks/api/use-committee-chat';

export default function CommitteeChat() {
  const params = useParams();
  const committeeId = params.id as string;
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [showMotionPanel, setShowMotionPanel] = useState(false);
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

  const {
    isConnected,
    sendMessage,
    replyToMessage,
    proposeMotion,
    secondMotion,
    voteOnMotion,
    joinRoom,
  } = useWebSocket({
    onMessage: handleNewMessage,
    onConnect: () => console.log('Connected to committee chat'),
    onDisconnect: () => console.log('Disconnected from committee chat'),
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
    if (historyData?.messages) {
      setMessages(historyData.messages);
    }
  }, [historyData]);

  useEffect(() => {
    if (roomId && isConnected) {
      console.log('Joining committee room:', roomId);
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
      type: 'group',
      senderId: session.user.id,
      content,
      roomId: roomId,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    sendMessage(roomId, content, 'group');
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

  const handleProposeMotion = (title: string, description: string) => {
    if (!roomId || !isConnected || !committeeId) return;
    proposeMotion(roomId, title, description, committeeId);
    setShowMotionPanel(false);
  };

  if (!session) {
    return <div className='text-center p-4'>Loading...</div>;
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
    <div className='flex h-[calc(100vh-4rem)] lg:h-screen'>
      <div className='flex flex-col flex-1 max-w-4xl mx-auto'>
        <ChatHeader
          recipientName={`Committee `}
          recipientId={committeeId}
          isConnected={isConnected}
          isLoading={historyLoading || startingChat}
          onToggleMotions={() => setShowMotionPanel(!showMotionPanel)}
          showMotionPanel={showMotionPanel}
        />

        <div className='flex flex-1 overflow-hidden relative min-h-0'>
          <div className='flex flex-col flex-1'>
            <MessagesList
              ref={messagesEndRef}
              messages={messages}
              currentUserId={session.user.id}
              recipientName={`Committee ${committeeId}`}
              isLoading={historyLoading && messages.length === 0}
              onReply={handleReplyToMessage}
            />

            <MessageInput
              isConnected={isConnected}
              onSendMessage={handleSendMessage}
              onProposeMotion={() => setShowMotionPanel(true)}
              showMotionButton={true}
            />
          </div>

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
      </div>
    </div>
  );
}
