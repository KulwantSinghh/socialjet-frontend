// ---- Deal Details (campaign-creators) ----

export interface DealDetails {
  lead_id: string;
  total_budget: number;
  platforms: string[];
  number_of_creators: number;
  age_group: string;
  deal_notes?: string;
  company?: string;
  stage?: string;
  updated_at: string;
}

export interface SaveDealDetailsRequest {
  lead_id: string;
  total_budget: number;
  platforms: string[];
  number_of_creators: number;
  age_group: string;
  deal_notes?: string;
  updated_at: string;
}
