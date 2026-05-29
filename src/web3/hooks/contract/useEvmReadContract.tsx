/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { TOptionalQuery } from 'src/types/global';
import { ChainId, TContractActionParams } from 'src/web3/types';
import { createPublicClient, fallback, http, HttpTransport } from 'viem';
import { base, bsc } from 'viem/chains';

const chainMap: { [chain: string]: { chain: any; rpcs?: Array<HttpTransport> } } = {
  [ChainId.BSC]: {
    chain: bsc,
    rpcs: [
      http('https://bsc-dataseed.bnbchain.org'),
      http('https://bsc-dataseed1.ninicoin.io'),
      http('https://bsc-rpc.publicnode.com'),
    ],
  },
  [ChainId.BASE]: { chain: base },
};

export default function useEvmReadContract() {
  const readContract = useCallback(async (chainId: ChainId, params: TContractActionParams) => {
    const { chain, rpcs } = chainMap[chainId as keyof typeof chainMap];
    if (!chain) throw new Error(`Chain ${chainId} not supported for public EVM read`);

    const publicClient = createPublicClient({
      chain,
      transport: rpcs ? fallback(rpcs) : http(),
    });

    const { address, functionName, args, abi } = params;
    if (!abi) throw new Error('ABI is required for EVM readContract');

    const data = await publicClient.readContract({
      address: address as `0x${string}`,
      abi,
      functionName,
      args,
    });

    return data;
  }, []);

  return { readContract };
}

type TQueryType = {
  chainId: ChainId;
  contractParams: TContractActionParams;
  queryParams?: TOptionalQuery<unknown>;
};

export function useQueryEvmReadContract({ chainId, contractParams, queryParams }: TQueryType) {
  const { readContract } = useEvmReadContract();

  return useQuery({
    ...queryParams,
    queryKey: ['useQueryEvmReadContract', chainId, contractParams],
    queryFn: () => readContract(chainId, contractParams),
  });
}
