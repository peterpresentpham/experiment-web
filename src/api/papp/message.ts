import { pAppQuery } from 'src/services/api-query';
import {
  TEditMessageDto,
  TGetMessageDto,
  TMessageItem,
  TMessageResponse,
} from 'src/types/papp.type';

export default class Message {
  static async getMessages(params: TGetMessageDto) {
    const response = await pAppQuery.get<TMessageResponse>('/message', {
      params: { conversationId: params.conversationId, page: params.page, limit: params.limit },
    });
    return response;
  }

  static async editMessage(params: TEditMessageDto) {
    const response = await pAppQuery.put<TMessageItem>('/message', null, { params });
    return response;
  }
}
