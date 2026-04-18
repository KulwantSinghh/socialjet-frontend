import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import type {
  InboxListResponse,
  InboxConversation,
  SendMessageRequest,
  SendMessageResponse,
  AutomationToggleResponse,
} from '@/types/inbox.types';

export const inboxService = {
  getConversations: async (): Promise<InboxListResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.INBOX.LIST);
    return data;
  },

  getConversation: async (leadId: string): Promise<InboxConversation> => {
    const { data } = await apiClient.get(ENDPOINTS.INBOX.CONVERSATION(leadId));
    return data;
  },

  sendMessage: async (
    leadId: string,
    payload: SendMessageRequest
  ): Promise<SendMessageResponse> => {
    if (payload.attachments && payload.attachments.length > 0) {
      const form = new FormData();
      form.append('text', payload.text);
      form.append('channel', payload.channel);
      if (payload.subject) form.append('subject', payload.subject);
      payload.attachments.forEach((f) => form.append('attachments', f));
      const { data } = await apiClient.post(ENDPOINTS.INBOX.SEND(leadId), form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    }
    const { data } = await apiClient.post(ENDPOINTS.INBOX.SEND(leadId), {
      text: payload.text,
      channel: payload.channel,
      ...(payload.subject && { subject: payload.subject }),
    });
    return data;
  },

  pauseAutomation: async (leadId: string): Promise<AutomationToggleResponse> => {
    const { data } = await apiClient.post(ENDPOINTS.INBOX.PAUSE_AUTOMATION(leadId));
    return data;
  },

  resumeAutomation: async (leadId: string): Promise<AutomationToggleResponse> => {
    const { data } = await apiClient.post(ENDPOINTS.INBOX.RESUME_AUTOMATION(leadId));
    return data;
  },
};
