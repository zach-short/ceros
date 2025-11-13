import { motionApi } from '@/lib/api/motion';
import { useFetch, useMutation } from '../use-fetch';
import { Motion } from '@/models/motion';

export function useCommitteeMotions(options?: {
  resourceParams?: string[];
  enabled?: boolean;
}) {
  return useFetch<{ motions: Motion[] }>(motionApi.getCommitteeMotions, options);
}

export function useMotion(options?: {
  resourceParams?: string[];
  enabled?: boolean;
}) {
  return useFetch<{ motion: Motion }>(motionApi.getMotion, options);
}

export function useCreateMotion(
  committeeId: string,
  options?: {
    onSuccess?: (data: { motion: Motion }) => void;
    onError?: (error: any) => void;
  },
) {
  return useMutation(
    (data: { title: string; description: string }) =>
      motionApi.createMotion(committeeId, data),
    {
      onSuccess: (data: { motion: Motion }) => {
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        options?.onError?.(error);
      },
    },
  );
}

export function useUpdateMotion(
  committeeId: string,
  motionId: string,
  options?: {
    onSuccess?: (data: { motion: Motion }) => void;
    onError?: (error: any) => void;
  },
) {
  return useMutation(
    (data: { status?: string; seconderId?: string }) =>
      motionApi.updateMotion(committeeId, motionId, data),
    {
      onSuccess: (data: { motion: Motion }) => {
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        options?.onError?.(error);
      },
    },
  );
}

export function useDeleteMotion(
  committeeId: string,
  motionId: string,
  options?: {
    onSuccess?: (data: { message: string }) => void;
    onError?: (error: any) => void;
  },
) {
  return useMutation(() => motionApi.deleteMotion(committeeId, motionId), {
    onSuccess: (data: { message: string }) => {
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}
