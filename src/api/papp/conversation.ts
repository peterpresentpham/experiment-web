import { pAppQuery } from 'src/services/api-query';
import { TPagination } from 'src/types/global';
import { TConversation, TConversationResponse, TCreatePrivateChatDto } from 'src/types/papp.type';

export default class Conversation {
  static async createPrivateChat(params: TCreatePrivateChatDto) {
    const response = await pAppQuery.post<TConversation>('/conversation/create', params);
    return response;
  }

  static async getListConversations(params?: TPagination) {
    const response = await pAppQuery.get<TConversationResponse>('/conversation/conversations', {
      params,
    });
    return response;
  }
}
