import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import type {
  ClientConversationMessage,
  ClientConversationThread,
  ClientInboxListResponse,
  ClientSyncRepliesResponse,
  SendClientMessageRequest,
} from '@/types/clientConversation.types';

export const clientConversationService = {
  getInboxList: async (): Promise<ClientInboxListResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.CLIENT_CONVERSATION.INBOX_LIST);
    return data;
  },

  getThread: async (leadId: string): Promise<ClientConversationThread> => {
    const { data } = await apiClient.get(ENDPOINTS.CLIENT_CONVERSATION.THREAD(leadId));
    return data;
  },

  sendMessage: async (
    leadId: string,
    payload: SendClientMessageRequest
  ): Promise<ClientConversationMessage> => {
    const { data } = await apiClient.post(ENDPOINTS.CLIENT_CONVERSATION.SEND(leadId), payload);
    return data;
  },

  syncReplies: async (): Promise<ClientSyncRepliesResponse> => {
    const { data } = await apiClient.post(ENDPOINTS.CLIENT_CONVERSATION.SYNC_REPLIES);
    return data;
  },
};
