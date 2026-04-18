import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { intelligenceService } from '@/services/intelligence.service';
import type { IntelligenceCallsParams, ReviewCallRequest } from '@/types/intelligence.types';

export const intelligenceKeys = {
  calls: (params: IntelligenceCallsParams) => ['intelligence', 'calls', params] as const,
  meetingSummary: (meetingId: string) => ['intelligence', 'meeting-summary', meetingId] as const,
  analyze: (meetingId: string) => ['intelligence', 'analyze', meetingId] as const,
  transcript: (meetingId: string) => ['intelligence', 'transcript', meetingId] as const,
};

export function useIntelligenceCalls(params?: IntelligenceCallsParams) {
  return useQuery({
    queryKey: intelligenceKeys.calls(params ?? {}),
    queryFn: () => intelligenceService.getCalls(params),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useReviewCall() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ callId, payload }: { callId: string; payload: ReviewCallRequest }) =>
      intelligenceService.reviewCall(callId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intelligence', 'calls'] });
    },
  });
}

export function useMeetingSummary(meetingId: string | undefined) {
  return useQuery({
    queryKey: intelligenceKeys.meetingSummary(meetingId ?? ''),
    queryFn: () => intelligenceService.getMeetingSummary(meetingId!),
    enabled: !!meetingId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useTranscript(meetingId: string | undefined) {
  return useQuery({
    queryKey: intelligenceKeys.transcript(meetingId ?? ''),
    queryFn: () => intelligenceService.getTranscript(meetingId!),
    enabled: !!meetingId,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useSalesAnalysis(meetingId: string | undefined, transcript: string | undefined) {
  return useQuery({
    queryKey: intelligenceKeys.analyze(meetingId ?? ''),
    queryFn: () => intelligenceService.analyzeSales(transcript ?? '', meetingId!),
    enabled: !!meetingId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
