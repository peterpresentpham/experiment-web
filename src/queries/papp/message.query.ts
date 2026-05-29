import { DefaultError, UseQueryOptions } from '@tanstack/react-query';
import PAppClient from 'src/api/papp';
import { QUERY_KEY } from 'src/configs/constance';
import useAuthQuery, { useAuthMutation } from 'src/hooks/useAuthQuery';
import { TEditMessageDto, TGetMessageDto, TMessageResponse } from 'src/types/papp.type';

export function useGetMessages(
  params: TGetMessageDto,
  options?: UseQueryOptions<TMessageResponse, DefaultError, TMessageResponse>
) {
  return useAuthQuery({
    ...options,
    queryKey: [QUERY_KEY.getMessages, params.conversationId, params.page, params.limit],
    queryFn: () => PAppClient.message.getMessages(params),
    enabled: Boolean(params.conversationId),
  });
}

export function useEditMessage() {
  return useAuthMutation({
    mutationFn: (params: TEditMessageDto) => PAppClient.message.editMessage(params),
  });
}
