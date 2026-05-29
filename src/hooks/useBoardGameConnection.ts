import { useCaroConnectionContext } from 'src/context/caro-connection.context';
import { useConnect4ConnectionContext } from 'src/context/connect4-connection.context';
import { TMyGame } from 'src/types/caro.type';

export default function useBoardGameConnectionContext(game: TMyGame) {
  const caro = useCaroConnectionContext();
  const connect4 = useConnect4ConnectionContext();

  return game == 'caro' ? caro : connect4;
}
