import { useFetch, useMutation } from '../use-fetch';
import {
  committeeApi,
  StartCommitteeChatResponse,
  GetCommitteeHistoryResponse,
  GetMessageRepliesResponse,
} from '@/lib/api/committee';

export function useCommitteeChat(options?: {
  onSuccess?: (data: StartCommitteeChatResponse) => void;
  onError?: (error: any) => void;
}) {
  return useMutation(committeeApi.startChat, {
    onSuccess: (data: StartCommitteeChatResponse) => {
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      console.error('Failed to start committee chat:', error);
      options?.onError?.(error);
    },
  });
}

export function useCommitteeHistory(
  committeeId: string,
  enabled: boolean = true,
) {
  return useFetch<GetCommitteeHistoryResponse>(committeeApi.getHistory, {
    resourceParams: [committeeId],
    dependencies: [committeeId],
    enabled: !!committeeId && enabled,
  });
}

export function useMessageReplies(messageId: string, enabled: boolean = true) {
  return useFetch<GetMessageRepliesResponse>(committeeApi.getMessageReplies, {
    resourceParams: [messageId],
    dependencies: [messageId],
    enabled: !!messageId && enabled,
  });
}

export function useToggleMessageReaction(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useMutation(
    ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      committeeApi.toggleMessageReaction(messageId, emoji),
    {
      onSuccess: (data) => {
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Failed to toggle message reaction:', error);
        options?.onError?.(error);
      },
    },
  );
}

export function useEditMessage(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useMutation(
    ({ messageId, content }: { messageId: string; content: string }) =>
      committeeApi.editMessage(messageId, content),
    {
      onSuccess: (data) => {
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Failed to edit message:', error);
        options?.onError?.(error);
      },
    },
  );
}

export function useDeleteMessage(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useMutation(
    (messageId: string) => committeeApi.deleteMessage(messageId),
    {
      onSuccess: (data) => {
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Failed to delete message:', error);
        options?.onError?.(error);
      },
    },
  );
}

