import { committeeApi } from '@/lib/api/committee';
import { useFetch, useMutation } from '../use-fetch';
import { Committee } from '@/models/committee';

export function useCommittee() {
  return useFetch<Committee>(committeeApi.getOne);
}

export function useCommittees() {
  return useFetch<{ committees: Committee[] }>(committeeApi.getMany);
}

export function useCreateCommittee(options?: {
  onSuccess?: (data: { message: string }) => void;
  onError?: (error: any) => void;
}) {
  return useMutation(committeeApi.createCommittee, {
    onSuccess: (data: { message: string }) => {
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}
