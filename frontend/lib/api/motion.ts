import { Motion } from '@/models/motion';
import { User } from '@/models';
import { apiRequest } from '../api';

export interface GetCommitteeMotionsResponse {
  motions: Motion[];
}

export interface GetMotionResponse {
  motion: Motion;
  users: User[];
}

export const motionApi = {
  getCommitteeMotions: (committeeId: string): Promise<any> =>
    apiRequest('get', `/committees/${committeeId}/motions`),

  getMotion: (committeeId: string, motionId: string): Promise<any> =>
    apiRequest('get', `/committees/${committeeId}/motions/${motionId}`),

  createMotion: (
    committeeId: string,
    data: { title: string; description: string },
  ): Promise<any> =>
    apiRequest('post', `/committees/${committeeId}/motions`, data),

  updateMotion: (
    committeeId: string,
    motionId: string,
    data: {
      title?: string;
      description?: string;
      vote_threshold?: 'simple_majority' | 'two_thirds' | 'unanimous';
      status?: string;
      seconderId?: string;
    },
  ): Promise<any> =>
    apiRequest('patch', `/committees/${committeeId}/motions/${motionId}`, data),

  deleteMotion: (committeeId: string, motionId: string): Promise<any> =>
    apiRequest('delete', `/committees/${committeeId}/motions/${motionId}`),

  createMotionToTable: (committeeId: string, motionId: string): Promise<any> =>
    apiRequest('post', `/committees/${committeeId}/motions/${motionId}/table`),

  untableMotion: (committeeId: string, motionId: string): Promise<any> =>
    apiRequest(
      'post',
      `/committees/${committeeId}/motions/${motionId}/untable`,
    ),
};
