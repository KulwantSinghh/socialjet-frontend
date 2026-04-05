---
description: How to create a new API service with centralized endpoints and types
---

# Create API Service Workflow

## Architecture

```
Component → React Query hook → Service function → Axios client → endpoints.ts → API
```

All API communication follows this chain. Never call `axios` or `fetch` directly from components.

## Steps

### Step 1: Define the endpoint in `src/services/api/endpoints.ts`

```ts
export const ENDPOINTS = {
  // ... existing endpoints
  INVOICES: {
    LIST: '/invoices',
    DETAIL: (id: string) => `/invoices/${id}`,
    CREATE: '/invoices',
    UPDATE: (id: string) => `/invoices/${id}`,
    DELETE: (id: string) => `/invoices/${id}`,
  },
};
```

**Rules:**

- All endpoint URLs are defined ONLY in `endpoints.ts` — never hardcode URLs elsewhere
- Group by domain (AUTH, USERS, LEADS, INVOICES, etc.)
- Use functions for dynamic segments

### Step 2: Define types in `src/types/{domain}.types.ts`

```ts
// src/types/invoice.types.ts

export interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
}

export interface CreateInvoiceRequest {
  clientId: string;
  amount: number;
  dueDate: string;
  items: InvoiceItem[];
}

export interface InvoiceListResponse {
  data: Invoice[];
  total: number;
  page: number;
  pageSize: number;
}
```

**Rules:**

- One types file per domain
- Request types are suffixed with `Request`
- Response types are suffixed with `Response`
- Use the generic `ApiResponse<T>` from `common.types.ts` when possible

### Step 3: Create the service file `src/services/{domain}.service.ts`

```ts
// src/services/invoice.service.ts

import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import type { Invoice, CreateInvoiceRequest, InvoiceListResponse } from '@/types/invoice.types';

export const invoiceService = {
  getAll: async (params?: { page?: number; status?: string }): Promise<InvoiceListResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.INVOICES.LIST, { params });
    return data;
  },

  getById: async (id: string): Promise<Invoice> => {
    const { data } = await apiClient.get(ENDPOINTS.INVOICES.DETAIL(id));
    return data;
  },

  create: async (payload: CreateInvoiceRequest): Promise<Invoice> => {
    const { data } = await apiClient.post(ENDPOINTS.INVOICES.CREATE, payload);
    return data;
  },

  update: async (id: string, payload: Partial<CreateInvoiceRequest>): Promise<Invoice> => {
    const { data } = await apiClient.patch(ENDPOINTS.INVOICES.UPDATE(id), payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.INVOICES.DELETE(id));
  },
};
```

**Rules:**

- Service is an object with methods (not a class)
- Every method is fully typed (params + return type)
- Uses `apiClient` from `./api/client` — NEVER creates its own Axios instance
- Uses `ENDPOINTS` — NEVER hardcodes URLs
- Service handles ONLY the HTTP call. No caching, no state, no UI logic.

### Step 4: Create React Query hooks in `src/hooks/` (if needed)

```ts
// src/hooks/useInvoices.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '@/services/invoice.service';

export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...invoiceKeys.lists(), params] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
};

export function useInvoices(params?: { page?: number; status?: string }) {
  return useQuery({
    queryKey: invoiceKeys.list(params ?? {}),
    queryFn: () => invoiceService.getAll(params),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoiceService.getById(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoiceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}
```

**Rules:**

- Query key factories follow the pattern above (hierarchical, composable)
- Hooks are thin wrappers around React Query — no business logic
- Mutations invalidate relevant query keys on success
