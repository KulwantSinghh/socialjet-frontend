import { useQuery } from '@tanstack/react-query';
import { getMeetings } from '@/services/meetings.service';
import type { MeetingsListParams } from '@/types/meeting.types';

export function useMeetings(params?: MeetingsListParams) {
  return useQuery({
    queryKey: ['meetings', params],
    queryFn: () => getMeetings(params),
  });
}
