import { TMyAllGame, TMyGame } from 'src/types/caro.type';
import { useCaroConfigContext } from '../CaroConfigDialog/caroConfig.context';
import { useConnect4ConfigContext } from '../Connect4ConfigDialog/connect4Config.context';
import { usePikachuConfigContext } from '../PikachuConfigDialog/pikachuConfig.context';

export default function useBoardGameConfigContext(game: TMyGame) {
  const caro = useCaroConfigContext();
  const connect4 = useConnect4ConfigContext();

  return game == 'caro' ? caro : connect4;
}

export function useAllGameConfigContext(game: TMyAllGame) {
  const caro = useCaroConfigContext();
  const connect4 = useConnect4ConfigContext();
  const pikachu = usePikachuConfigContext();

  return game == 'caro' ? caro : game == 'connect4' ? connect4 : pikachu;
}
