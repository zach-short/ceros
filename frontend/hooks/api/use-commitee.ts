import {
  committeeApi,
  UpdateCommitteeRequest,
  AddMemberRequest,
  AddObserverRequest,
  ChangeChairRequest
} from '@/lib/api/committee';
import { useFetch, useMutation } from '../use-fetch';
import { Committee } from '@/models/committee';

export function useCommittee(options?: {
  resourceParams?: string[];
  enabled?: boolean;
}) {
  return useFetch<{ committee: Committee }>(committeeApi.getOne, options);
}

export function useCommittees() {
  return useFetch<{ committees: Committee[] }>(committeeApi.getMany);
}

export function useUserCommittees() {
  return useFetch<{ committees: Committee[] }>(committeeApi.getUserCommittees);
}

export function useCreateCommittee(options?: {
  onSuccess?: (data: { id: string; message: string }) => void;
  onError?: (error: any) => void;
}) {
  return useMutation(committeeApi.createCommittee, {
    onSuccess: (data: { message: string; id: string }) => {
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}

export function useUpdateCommittee(
  committeeId: string,
  options?: {
    onSuccess?: (data: { message: string }) => void;
    onError?: (error: any) => void;
  },
) {
  return useMutation(
    (data: UpdateCommitteeRequest) => committeeApi.updateCommittee(committeeId, data),
    {
      onSuccess: (data: { message: string }) => {
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        options?.onError?.(error);
      },
    },
  );
}

export function useDeleteCommittee(
  committeeId: string,
  options?: {
    onSuccess?: (data: { message: string }) => void;
    onError?: (error: any) => void;
  },
) {
  return useMutation(() => committeeApi.deleteCommittee(committeeId), {
    onSuccess: (data: { message: string }) => {
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}

export function useAddMember(
  committeeId: string,
  options?: {
    onSuccess?: (data: { message: string }) => void;
    onError?: (error: any) => void;
  },
) {
  return useMutation(
    (data: AddMemberRequest) => committeeApi.addMember(committeeId, data),
    {
      onSuccess: (data: { message: string }) => {
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        options?.onError?.(error);
      },
    },
  );
}

export function useRemoveMember(
  committeeId: string,
  options?: {
    onSuccess?: (data: { message: string }) => void;
    onError?: (error: any) => void;
  },
) {
  return useMutation(
    (memberId: string) => committeeApi.removeMember(committeeId, memberId),
    {
      onSuccess: (data: { message: string }) => {
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        options?.onError?.(error);
      },
    },
  );
}

export function useAddObserver(
  committeeId: string,
  options?: {
    onSuccess?: (data: { message: string }) => void;
    onError?: (error: any) => void;
  },
) {
  return useMutation(
    (data: AddObserverRequest) => committeeApi.addObserver(committeeId, data),
    {
      onSuccess: (data: { message: string }) => {
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        options?.onError?.(error);
      },
    },
  );
}

export function useRemoveObserver(
  committeeId: string,
  options?: {
    onSuccess?: (data: { message: string }) => void;
    onError?: (error: any) => void;
  },
) {
  return useMutation(
    (observerId: string) => committeeApi.removeObserver(committeeId, observerId),
    {
      onSuccess: (data: { message: string }) => {
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        options?.onError?.(error);
      },
    },
  );
}

export function useChangeChair(
  committeeId: string,
  options?: {
    onSuccess?: (data: { message: string }) => void;
    onError?: (error: any) => void;
  },
) {
  return useMutation(
    (data: ChangeChairRequest) => committeeApi.changeChair(committeeId, data),
    {
      onSuccess: (data: { message: string }) => {
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        options?.onError?.(error);
      },
    },
  );
}
