import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import type {
  IntelligenceCallsParams,
  IntelligenceCallsResponse,
  ReviewCallRequest,
  SalesAnalysis,
  MeetingSummaryResponse,
} from '@/types/intelligence.types';

export const intelligenceService = {
  getCalls: async (params?: IntelligenceCallsParams): Promise<IntelligenceCallsResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.INTELLIGENCE.CALLS, {
      params: {
        days: params?.days ?? 7,
        page: params?.page ?? 1,
        page_size: params?.page_size ?? 30,
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.review_status ? { review_status: params.review_status } : {}),
      },
    });
    return data;
  },

  reviewCall: async (callId: string, payload: ReviewCallRequest): Promise<unknown> => {
    const { data } = await apiClient.post(ENDPOINTS.INTELLIGENCE.REVIEW(callId), null, {
      params: {
        review_status: payload.review_status,
        ...(payload.review_notes ? { review_notes: payload.review_notes } : {}),
      },
    });
    return data;
  },

  getMeetingSummary: async (meetingId: string): Promise<MeetingSummaryResponse> => {
    const { data } = await apiClient.post<MeetingSummaryResponse>(
      ENDPOINTS.INTELLIGENCE.MEETING_SUMMARY,
      null,
      { params: { meeting_id: meetingId } }
    );
    return data;
  },

  getTranscript: async (meetingId: string): Promise<string> => {
    const { data } = await apiClient.get<string>(ENDPOINTS.INTELLIGENCE.TRANSCRIPT(meetingId));
    return data;
  },

  analyzeSales: async (transcript: string, meetingId: string): Promise<SalesAnalysis> => {
    const { data } = await apiClient.post<SalesAnalysis>(
      ENDPOINTS.INTELLIGENCE.ANALYZE,
      { transcript, meeting_id: meetingId },
      { timeout: 300000 }
    );
    return data;
  },
};
