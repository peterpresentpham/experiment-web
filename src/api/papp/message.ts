import { pAppQuery } from 'src/services/api-query';
import { TGetMessageDto, TMessageResponse } from 'src/types/papp.type';

export default class Message {
  static async getMessages(params: TGetMessageDto) {
    const response = await pAppQuery.get<TMessageResponse>('/message', {
      params: { conversationId: params.conversationId, page: params.page, limit: params.limit },
    });
    return response;
  }
}
