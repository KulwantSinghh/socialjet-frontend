import { useQuery } from '@tanstack/react-query';
import { getMeetings, getOnboardingCalls } from '@/services/meetings.service';
import type { MeetingsListParams, OnboardingCallsParams } from '@/types/meeting.types';

export function useMeetings(params?: MeetingsListParams) {
  return useQuery({
    queryKey: ['meetings', params],
    queryFn: () => getMeetings(params),
  });
}

export function useOnboardingCalls(params?: OnboardingCallsParams) {
  return useQuery({
    queryKey: ['onboarding-calls', params],
    queryFn: () => getOnboardingCalls(params),
    staleTime: 30_000,
  });
}
