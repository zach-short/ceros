import { Motion } from '@/models/motion';
import { apiRequest } from '../api';

export interface GetCommitteeMotionsResponse {
  motions: Motion[];
}

export interface GetMotionResponse {
  motion: Motion;
}

export const motionApi = {
  getCommitteeMotions: (committeeId: string) =>
    apiRequest<GetCommitteeMotionsResponse>('get', `/committees/${committeeId}/motions`),

  getMotion: (committeeId: string, motionId: string) =>
    apiRequest<GetMotionResponse>('get', `/committees/${committeeId}/motions/${motionId}`),

  createMotion: (committeeId: string, data: { title: string; description: string }) =>
    apiRequest<GetMotionResponse>('post', `/committees/${committeeId}/motions`, data),

  updateMotion: (committeeId: string, motionId: string, data: { status?: string; seconderId?: string }) =>
    apiRequest<GetMotionResponse>('patch', `/committees/${committeeId}/motions/${motionId}`, data),

  deleteMotion: (committeeId: string, motionId: string) =>
    apiRequest<{ message: string }>('delete', `/committees/${committeeId}/motions/${motionId}`),
};
