import { Message } from '@/models';

export interface MessageInputProps {
  isConnected: boolean;
  onSendMessage: (content: string) => void;
  onProposeMotion?: () => void;
  showMotionButton?: boolean;
}

export interface MessagesListProps {
  messages: Message[];
  className?: string;
}

export interface MessageBubbleProps {
  message: Message;
  showSender?: boolean;
}

export interface ChatHeaderProps {
  recipientName: string;
  recipientId: string;
  recipientPicture?: string;
  isConnected: boolean;
  isLoading?: boolean;
  onToggleMotions?: () => void;
}

export interface ChatSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export interface ChatSearchResultsProps {
  searchQuery: string;
  conversationsCount: number;
}

export interface ChatSectionsProps {
  conversationsCount: number;
  committeesCount: number;
}