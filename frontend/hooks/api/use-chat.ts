import { useFetch, useMutation } from '../use-fetch';
import { chatApi, Message, Room } from '@/lib/api/chat';

export function useStartDM(options?: {
  onSuccess?: (data: { roomId: string; room: Room }) => void;
  onError?: (error: any) => void;
}) {
  return useMutation(chatApi.startDM, {
    onSuccess: (data: { roomId: string; room: Room }) => {
      console.log('DM conversation started:', data);
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      console.error('Failed to start DM conversation:', error);
      options?.onError?.(error);
    },
  });
}

export function useDMHistory(recipientId: string | undefined, enabled = true) {
  return useFetch<{ roomId: string; messages: Message[] }>(
    chatApi.getDMHistory,
    {
      resourceParams: [recipientId],
      dependencies: [recipientId],
      enabled: !!recipientId && enabled,
    },
  );
}

export function useConversations() {
  return useFetch<{ conversations: Room[] }>(chatApi.getConversations);
}

