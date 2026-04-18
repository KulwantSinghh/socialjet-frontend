import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { salesService } from '@/services/sales.service';

const PAGE_SIZE = 5;

export const activityKeys = {
  byLimit: (limit: number) => ['sales-activity', limit] as const,
};

export function useActivityFeed() {
  const [limit, setLimit] = useState(PAGE_SIZE);

  const query = useQuery({
    queryKey: activityKeys.byLimit(limit),
    queryFn: () => salesService.getActivity(limit),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
    // Keep previous data visible while loading more (no flicker)
    placeholderData: keepPreviousData,
  });

  const activities = query.data?.activities ?? [];

  // If we got back exactly `limit` items there may be more; fewer = exhausted
  const hasMore = activities.length >= limit;

  const loadMore = () => setLimit((prev) => prev + PAGE_SIZE);

  return {
    ...query,
    activities,
    hasMore,
    loadMore,
  };
}
