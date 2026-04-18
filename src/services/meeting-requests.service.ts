import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import type {
  MeetingRequestsListResponse,
  MeetingRequestStatus,
  ConfirmMeetingRequestResponse,
  DeclineMeetingRequestResponse,
  InstantMeetingRequest,
  InstantMeetingResponse,
} from '@/types/meeting-requests.types';

export const meetingRequestsService = {
  getRequests: async (params?: {
    status?: MeetingRequestStatus;
  }): Promise<MeetingRequestsListResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.MEETING_REQUESTS.LIST, { params });
    return data;
  },

  confirmRequest: async (requestId: string): Promise<ConfirmMeetingRequestResponse> => {
    const { data } = await apiClient.post(ENDPOINTS.MEETING_REQUESTS.CONFIRM(requestId));
    return data;
  },

  declineRequest: async (
    requestId: string,
    suggestAlternatives = true
  ): Promise<DeclineMeetingRequestResponse> => {
    const { data } = await apiClient.post(ENDPOINTS.MEETING_REQUESTS.DECLINE(requestId), {
      suggest_alternatives: suggestAlternatives,
    });
    return data;
  },

  createInstantMeeting: async (payload: InstantMeetingRequest): Promise<InstantMeetingResponse> => {
    const { data } = await apiClient.post(ENDPOINTS.MEETINGS.INSTANT, payload);
    return data;
  },
};
