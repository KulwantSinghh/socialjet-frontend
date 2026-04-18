'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingRequestsService } from '@/services/meeting-requests.service';
import type { MeetingRequestStatus, InstantMeetingRequest } from '@/types/meeting-requests.types';

export const MEETING_REQUESTS_QUERY_KEY = 'meeting-requests';

export function useMeetingRequests(status?: MeetingRequestStatus) {
  return useQuery({
    queryKey: [MEETING_REQUESTS_QUERY_KEY, status],
    queryFn: () => meetingRequestsService.getRequests(status ? { status } : undefined),
    staleTime: 20_000,
    refetchInterval: 30_000,
  });
}

export function usePendingMeetingRequestsCount() {
  return useQuery({
    queryKey: [MEETING_REQUESTS_QUERY_KEY, 'pending_approval'],
    queryFn: () => meetingRequestsService.getRequests({ status: 'pending_approval' }),
    staleTime: 20_000,
    refetchInterval: 30_000,
    select: (data) => data.total,
  });
}

export function useConfirmMeetingRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => meetingRequestsService.confirmRequest(requestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [MEETING_REQUESTS_QUERY_KEY] });
    },
  });
}

export function useDeclineMeetingRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      suggestAlternatives,
    }: {
      requestId: string;
      suggestAlternatives?: boolean;
    }) => meetingRequestsService.declineRequest(requestId, suggestAlternatives),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [MEETING_REQUESTS_QUERY_KEY] });
    },
  });
}

export function useInstantMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InstantMeetingRequest) =>
      meetingRequestsService.createInstantMeeting(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
}
