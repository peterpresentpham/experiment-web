import { useQuery } from '@tanstack/react-query';
import { TOptionalQuery } from 'src/types/global';
import { useWeb3WalletContext } from 'src/web3/context/web3-wallet.context';
import BalanceService, { TBalanceOptionType } from 'src/web3/services/BalanceService';
import { useWeb3Store } from 'src/web3/states/web3.state';

type TParamsType = Partial<{
  query: TOptionalQuery<string | number | undefined>;
  params: TBalanceOptionType;
}>;

export default function useAccountBalance(params: TParamsType = {}) {
  const { address } = useWeb3WalletContext();
  const { chainId } = useWeb3Store();

  return useQuery({
    enabled: Boolean(address),
    ...params.query,
    queryKey: ['useAccountBalance', address, chainId, params.params],
    queryFn: () => BalanceService.balance(address || '', chainId, params.params),
  });
}
