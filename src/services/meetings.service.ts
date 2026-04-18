import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { MeetingsListResponse, MeetingsListParams } from '@/types/meeting.types';

export async function getMeetings(params?: MeetingsListParams): Promise<MeetingsListResponse> {
  const response = await apiClient.get<MeetingsListResponse>(ENDPOINTS.MEETINGS.LIST, { params });
  return response.data;
}
