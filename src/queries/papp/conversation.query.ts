import PAppClient from 'src/api/papp';
import { QUERY_KEY } from 'src/configs/constance';
import useAuthQuery, { useAuthMutation } from 'src/hooks/useAuthQuery';
import { TMutationOptionsDefaultError } from 'src/types/global';
import { TConversation, TCreatePrivateChatDto } from 'src/types/papp.type';

export function useCreatePrivateChat(
  options?: TMutationOptionsDefaultError<TConversation, TCreatePrivateChatDto>
) {
  return useAuthMutation({
    ...options,
    mutationFn: (data: TCreatePrivateChatDto) => PAppClient.conversation.createPrivateChat(data),
  });
}

export function useGetListConversations(params?: { page?: number; limit?: number }) {
  return useAuthQuery({
    queryKey: [QUERY_KEY.getListConversations, params],
    queryFn: () => PAppClient.conversation.getListConversations(params),
  });
}
