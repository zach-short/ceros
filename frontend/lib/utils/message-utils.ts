import { Message, MessageReaction } from '@/models';

/**
 * Transforms raw message data from backend to frontend format,
 * converting metadata.reactions to proper MessageReaction format
 */
export function transformMessagesWithReactions(
  messages: any[],
  currentUserId: string
): Message[] {
  return messages.map((message) => {
    const transformedMessage: Message = {
      ...message,
      reactions: transformReactions(message.metadata?.reactions || [], currentUserId),
    };

    return transformedMessage;
  });
}

/**
 * Converts backend reaction format to frontend MessageReaction format
 */
function transformReactions(
  backendReactions: any[],
  currentUserId: string
): MessageReaction[] {
  if (!Array.isArray(backendReactions)) {
    return [];
  }

  return backendReactions.map((reaction) => ({
    emoji: reaction.emoji,
    count: reaction.count || 0,
    userReacted: Array.isArray(reaction.users)
      ? reaction.users.includes(currentUserId)
      : false,
  }));
}