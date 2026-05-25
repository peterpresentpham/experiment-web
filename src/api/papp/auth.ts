import { pAppQuery } from 'src/services/api-query';
import {
  TAccessTokenResponse,
  TAuthSignupDto,
  TGoogleRecoverPasswordDto,
  TGoogleSigninDto,
  TOnlyOkResponse,
  TPasswordLoginDto,
  TRecoverTokenDto,
  TVerifyTokenDto,
} from 'src/types/papp.type';

export default class Auth {
  static async signup(params: TAuthSignupDto) {
    const response = await pAppQuery.post<TOnlyOkResponse>('/auth/signup', params);
    return response;
  }

  static async verifyEmail(params: TVerifyTokenDto) {
    const response = await pAppQuery.post<TOnlyOkResponse>('/auth/verify-email', params);
    return response;
  }

  static async googleLogin(params: TGoogleSigninDto) {
    const response = await pAppQuery.post<TAccessTokenResponse>('/auth/signin/google', params, {
      withCredentials: true,
    });
    return response;
  }

  static async signinWithPassword(params: TPasswordLoginDto) {
    const response = await pAppQuery.post<TAccessTokenResponse>('/auth/signin/password', params, {
      withCredentials: true,
    });
    return response;
  }

  static async sendRecoverMailPassword(params: TGoogleRecoverPasswordDto) {
    const response = await pAppQuery.post<TOnlyOkResponse>(
      '/auth/forgot-password/send-recovery',
      params
    );
    return response;
  }

  static async recoverPassword(params: TRecoverTokenDto) {
    const response = await pAppQuery.post<TOnlyOkResponse>(
      '/auth/forgot-password/recovery',
      params
    );
    return response;
  }

  static async refresh() {
    const response = await pAppQuery.post<TAccessTokenResponse>(
      '/auth/refresh',
      {},
      { withCredentials: true }
    );
    return response;
  }
}
