import { DefaultError, InfiniteData, UseQueryOptions } from '@tanstack/react-query';
import PAppClient from 'src/api/papp';
import { QUERY_KEY } from 'src/configs/constance';
import useAuthQuery, { useAuthInfiniteQuery, useAuthMutation } from 'src/hooks/useAuthQuery';
import { TEditMessageDto, TGetMessageDto, TMessageResponse } from 'src/types/papp.type';

const MESSAGE_LIMIT = 20;

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

export function useGetMessagesInfinite(params: { conversationId?: number }) {
  return useAuthInfiniteQuery<TMessageResponse, Error, InfiniteData<TMessageResponse>>({
    queryKey: [QUERY_KEY.getMessages, 'infinite', params.conversationId],
    queryFn: ({ pageParam = 1 }) =>
      PAppClient.message.getMessages({
        conversationId: params.conversationId,
        page: pageParam as number,
        limit: MESSAGE_LIMIT,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.metadata) return undefined;
      const { currentPage, totalPages } = lastPage.metadata;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: Boolean(params.conversationId),
  });
}

export function useEditMessage() {
  return useAuthMutation({
    mutationFn: (params: TEditMessageDto) => PAppClient.message.editMessage(params),
  });
}
