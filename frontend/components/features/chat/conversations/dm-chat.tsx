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
import { TypingIndicator } from '../ui/typing-indicator';
import { Message, User } from '../ui/types';
import { CenteredDiv } from '@/components/shared/layout/centered-div';
import { DefaultLoader } from '@/components/shared/layout/loader';
import { transformMessagesWithReactions } from '@/lib/utils/message-utils';
import { chatApi } from '@/lib/api/chat';

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
  const [typingUsers, setTypingUsers] = useState<Array<{ userId: string; name: string }>>([]);
  const [replyState, setReplyState] = useState<
    | {
        messageId: string;
        content: string;
      }
    | undefined
  >(undefined);
  const [editState, setEditState] = useState<
    | {
        messageId: string;
        content: string;
      }
    | undefined
  >(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializationAttempted = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    const message = data.message || data;
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

  const handleReactionUpdate = (data: {
    messageId: string;
    reactions: any[];
  }) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id === data.messageId) {
          return { ...msg, reactions: data.reactions };
        }
        return msg;
      }),
    );
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

  const handleReadReceiptUpdate = (data: {
    messageIds: string[];
    readBy: string;
    readAt: string;
    roomId: string;
  }) => {
    if (data.roomId !== roomId) return;

    setMessages((prev) =>
      prev.map((msg) => {
        if (data.messageIds.includes(msg.id)) {
          return {
            ...msg,
            readBy: [...(msg.readBy || []), data.readBy],
            readAt: data.readAt,
          };
        }
        return msg;
      }),
    );
  };

  const handleMessageDelivered = (data: {
    messageId: string;
    deliveredAt: string;
    roomId: string;
  }) => {
    if (data.roomId !== roomId) return;

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === data.messageId) {
          return { ...msg, deliveredAt: data.deliveredAt };
        }
        return msg;
      }),
    );
  };

  const handlePinToggled = (data: {
    messageId: string;
    isPinned: boolean;
    pinnedBy: string;
    pinnedAt: string;
    roomId: string;
  }) => {
    if (data.roomId !== roomId) return;

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === data.messageId) {
          return {
            ...msg,
            isPinned: data.isPinned,
            pinnedBy: data.pinnedBy,
            pinnedAt: data.pinnedAt,
          };
        }
        return msg;
      }),
    );
  };

  const {
    isConnected,
    sendMessage,
    replyToMessage,
    joinRoom,
    sendTypingStart,
    sendTypingStop,
  } = useWebSocket({
    onMessage: handleNewMessage,
    onReactionUpdate: handleReactionUpdate,
    onTypingUpdate: handleTypingUpdate,
    onReadReceiptUpdate: handleReadReceiptUpdate,
    onMessageDelivered: handleMessageDelivered,
    onPinToggled: handlePinToggled,
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

  // Mark messages as read when they're visible
  useEffect(() => {
    if (!roomId || !session?.user?.id || messages.length === 0) return;

    const unreadMessages = messages.filter(
      (msg) =>
        msg.senderId !== session.user.id &&
        (!msg.readBy || !msg.readBy.includes(session.user.id)),
    );

    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map((msg) => msg.id);
      chatApi.markMessagesAsRead(messageIds, roomId).catch((error) => {
        console.error('Failed to mark messages as read:', error);
      });
    }
  }, [messages, roomId, session?.user?.id]);

  const handleSendMessage = (content: string) => {
    if (!roomId || !isConnected || !session?.user?.id) return;

    if (replyState) {
      handleReply(replyState.messageId, content);
      setReplyState(undefined);
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
    setEditState(undefined);
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  const handlePinMessage = async (messageId: string) => {
    try {
      await chatApi.toggleMessagePin(messageId);
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
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
      <div className='flex flex-col h-[calc(100vh-4rem)] lg:h-screen max-w-4xl mx-auto border rounded-lg'>
        <ChatHeader
          recipientName={recipientName}
          recipientId={recipientId}
          recipientPicture={recipientPicture}
          isConnected={isConnected}
          isLoading={historyLoading || startingDM}
          chatType='dm'
        />

        <div className='flex-1 min-h-0 overflow-hidden'>
          <MessagesList
            ref={messagesEndRef}
            messages={messages}
            users={users}
            currentUserId={session.user.id}
            recipientName={recipientName}
            recipientId={recipientId}
            isLoading={historyLoading && messages.length === 0}
            onReply={handleStartReply}
            onReaction={handleReaction}
            onEdit={handleStartEdit}
            onDelete={handleDeleteMessage}
            onPin={handlePinMessage}
            onScrollToMessage={handleScrollToMessage}
            chatType='dm'
          />
        </div>

        <TypingIndicator typingUsers={typingUsers} chatType='dm' />

        <div className='lg:block hidden flex-shrink-0'>
          <MessageInput
            isConnected={isConnected}
            onSendMessage={handleSendMessage}
            replyState={replyState}
            editState={editState}
            onReplyCancel={handleCancelReply}
            onEditCancel={handleCancelEdit}
            onEditSave={handleEditMessage}
            onTyping={handleTyping}
            onStopTyping={handleStopTyping}
          />
        </div>
      </div>

      <div className='lg:hidden block fixed bottom-16 left-0 right-0 bg-background border-t'>
        <MessageInput
          isConnected={isConnected}
          onSendMessage={handleSendMessage}
          replyState={replyState}
          editState={editState}
          onReplyCancel={handleCancelReply}
          onEditCancel={handleCancelEdit}
          onEditSave={handleEditMessage}
          onTyping={handleTyping}
          onStopTyping={handleStopTyping}
        />
      </div>
    </>
  );
}
