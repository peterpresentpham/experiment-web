import { pAppQuery } from 'src/services/api-query';
import { TFindUserDto, TFindUserResponse, TOnlyOkResponse, TUser } from 'src/types/papp.type';

export default class User {
  static async getMe() {
    const response = await pAppQuery.get<TUser>('/user/me');
    return response;
  }

  static async sendVerifyEmail() {
    const response = await pAppQuery.post<TOnlyOkResponse>('/user/send-verify-email');
    return response;
  }

  static async findUsers(params: TFindUserDto) {
    const response = await pAppQuery.get<TFindUserResponse>('/user/find-user', {
      params: { searchText: params.searchText, page: params.page, limit: params.limit },
    });
    return response;
  }
}
