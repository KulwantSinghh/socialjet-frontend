import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import type {
  MeetingsListResponse,
  MeetingsListParams,
  OnboardingCallsResponse,
  OnboardingCallsParams,
} from '@/types/meeting.types';

export async function getMeetings(params?: MeetingsListParams): Promise<MeetingsListResponse> {
  const response = await apiClient.get<MeetingsListResponse>(ENDPOINTS.MEETINGS.LIST, { params });
  return response.data;
}

export async function getOnboardingCalls(
  params?: OnboardingCallsParams
): Promise<OnboardingCallsResponse> {
  const response = await apiClient.get<OnboardingCallsResponse>(
    ENDPOINTS.MEETINGS.ONBOARDING_CALLS,
    { params }
  );
  return response.data;
}
