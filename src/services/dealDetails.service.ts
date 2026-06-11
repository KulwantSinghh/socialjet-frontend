import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import type { DealDetails, SaveDealDetailsRequest } from '@/types/dealDetails.types';

/** A record counts as "filled" only when the required form fields are present. */
export function isDealDetailsFilled(details: Partial<DealDetails> | null | undefined): boolean {
  if (!details || typeof details !== 'object') return false;
  return (
    details.total_budget != null &&
    (details.platforms?.length ?? 0) > 0 &&
    details.number_of_creators != null &&
    !!details.age_group
  );
}

export const dealDetailsService = {
  /**
   * Returns the deal details for a lead, or null when the form has not been
   * filled yet (empty body, partial record, or 404 from the API).
   */
  get: async (leadId: string): Promise<DealDetails | null> => {
    try {
      const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_INFLUENCERS.DEAL_DETAILS(leadId));
      return isDealDetailsFilled(data as Partial<DealDetails>) ? (data as DealDetails) : null;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) return null;
      throw err;
    }
  },

  save: async (payload: SaveDealDetailsRequest): Promise<DealDetails> => {
    const { data } = await apiClient.post(
      ENDPOINTS.CAMPAIGN_INFLUENCERS.DEAL_DETAILS(payload.lead_id),
      payload
    );
    return data;
  },
};
