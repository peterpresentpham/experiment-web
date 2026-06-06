/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  MutationFunctionContext,
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import { useAuthStore } from 'src/states/auth.state';

export default function useAuthQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
>(props: UseQueryOptions<TQueryFnData, TError, TData, QueryKey>) {
  const { isReady, accessToken } = useAuthStore();

  return useQuery({
    ...props,
    queryKey: [...(props.queryKey as QueryKey), accessToken, isReady],
    enabled: (props.enabled ?? true) && isReady && Boolean(accessToken),
  });
}

export function useAuthInfiniteQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
>(props: UseInfiniteQueryOptions<TQueryFnData, TError, TData, QueryKey>) {
  const { isReady, accessToken } = useAuthStore();

  return useInfiniteQuery({
    ...props,
    queryKey: [...(props.queryKey as QueryKey), accessToken, isReady],
    enabled: (props.enabled ?? true) && isReady && Boolean(accessToken),
  } as any);
}

export function useAuthMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(props: UseMutationOptions<TData, TError, TVariables, TContext>) {
  const { isReady, accessToken } = useAuthStore();

  return useMutation({
    ...props,
    mutationFn: async (variables: TVariables, context: MutationFunctionContext) => {
      if (!isReady || !accessToken) throw new Error('Authentication required for this action.');
      if (props.mutationFn) return props.mutationFn(variables, context);
      throw new Error('No mutation function provided.');
    },
  });
}
