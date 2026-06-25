import { useQuery } from '@tanstack/react-query';
import { campaignsService } from '@/services/campaigns.service';

export const deliveryLinksKeys = {
  liveLinks: (leadId: string) => ['delivery-live-links', leadId] as const,
};

// Creators publish posts asynchronously and submit links over time, so poll to
// surface newly-live content while the Live stage is open.
const POLL_INTERVAL = 15_000;

/** Live posts (videos / carousels) published by the lead's creators. */
export function useDeliveryLiveLinks(leadId: string) {
  return useQuery({
    queryKey: deliveryLinksKeys.liveLinks(leadId),
    queryFn: () => campaignsService.getDeliveryLiveLinks(leadId),
    enabled: !!leadId,
    staleTime: 10_000,
    refetchInterval: POLL_INTERVAL,
    refetchOnWindowFocus: true,
  });
}
