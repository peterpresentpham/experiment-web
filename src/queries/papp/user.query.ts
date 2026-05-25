import PAppClient from 'src/api/papp';
import { QUERY_KEY } from 'src/configs/constance';
import useAuthQuery, { useAuthMutation } from 'src/hooks/useAuthQuery';
import { TMutationOptionsDefaultError } from 'src/types/global';
import { TFindUserDto, TOnlyOkResponse } from 'src/types/papp.type';

export function useGetMe() {
  return useAuthQuery({
    queryKey: [QUERY_KEY.getMe],
    queryFn: () => PAppClient.user.getMe(),
  });
}

export function useUserSendVerifyEmail(options?: TMutationOptionsDefaultError<TOnlyOkResponse>) {
  return useAuthMutation({
    ...options,
    mutationFn: () => PAppClient.user.sendVerifyEmail(),
  });
}

export function useFindUsers(params: TFindUserDto) {
  return useAuthQuery({
    queryKey: [QUERY_KEY.findUsers, params.searchText, params.page, params.limit],
    queryFn: () => PAppClient.user.findUsers(params),
  });
}
