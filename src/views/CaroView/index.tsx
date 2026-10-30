import CaroConnectionProvider from 'src/context/caro-connection.context';
import CaroStateProvider from 'src/context/caro-state.context';
import CaroBoard from './CaroBoard';

export default function CaroView() {
  return (
    <CaroConnectionProvider>
      <CaroStateProvider>
        <div className="container flex flex-1 flex-col">
          <CaroBoard className="flex-1" />
        </div>
      </CaroStateProvider>
    </CaroConnectionProvider>
  );
}
