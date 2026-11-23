import { tengenMoveOrder } from 'src/services/caro-tengen/engine';
import { TCaroWinMode, TTurn } from 'src/types/caro.type';

/**
 * Rapfi (GPL-3.0, https://github.com/dhbloo/rapfi, see public/engines/rapfi/NOTICE.md), the
 * strongest open gomoku engine, with its mix9svq NNUE for the free rule, compiled to WebAssembly
 * by Emscripten. It speaks the Piskvork protocol: commands go in as lines, and the move comes back
 * as an "x,y" line. The blocked-ends rule is our addition to Rapfi (experiment-web.patch). Its
 * network was trained here (public/models/caro-rapfi/NOTICE.md); it is a separate download, fetched
 * the first time a blocked-ends game starts, and until it arrives (or when it cannot be fetched)
 * that rule plays with the classical evaluation.
 */

/** Piskvork rule numbers; 8 is caro, as Tengen numbers it. */
const RULE: Record<TCaroWinMode, number> = { 'non-blockOpponent': 0, blockOpponent: 8 };

/** The Emscripten module: what `rapfi-*.js` resolves to. */
export type TRapfiModule = {
  sendCommand: (command: string) => void;
  /** Emscripten's in-memory file system, where rapfi.data is unpacked. */
  FS_createDataFile: (
    parent: string,
    name: string,
    data: Uint8Array,
    canRead: boolean,
    canWrite: boolean,
    canOwn?: boolean
  ) => void;
};

/** The blocked-ends network and a config that lists it after the free-rule network. */
export type TRapfiCaroNetwork = { config: Uint8Array; network: Uint8Array };

/** Where the caro files go in the engine's file system, next to the preloaded ones. */
const CARO_CONFIG_FILE = 'config-caro.toml';
const CARO_NETWORK_FILE = 'caro.bin.lz4';

export type TRapfiModuleOptions = {
  arguments: Array<string>;
  locateFile: (file: string) => string;
  onReceiveStdout: (line: string) => void;
  onReceiveStderr: (line: string) => void;
};

export type TRapfiFactory = (options: TRapfiModuleOptions) => Promise<TRapfiModule>;

export type TRapfiRequest = {
  steps: { [location: number]: TTurn };
  size: number;
  winMode: TCaroWinMode;
  /** The side Rapfi moves for. */
  turn: TTurn;
  /** Locations not to play, e.g. moves that lost here before. */
  exclude?: Iterable<number>;
};

/**
 * Milliseconds per move. Rapfi uses most of it with an unlimited game clock; about what Tengen
 * takes, and Rapfi's NNUE reaches depth 16 or more in it.
 */
export const RAPFI_TURN_MS = 2_000;

/**
 * How much longer than its turn Rapfi may take to answer before the move is given up on. The
 * first search of the multi-threaded build also starts its threads, which is slow on a phone; an
 * engine that never answers (a crashed thread, memory running out) must not stall the game.
 */
export const RAPFI_ANSWER_GRACE_MS = 6_000;

/** A Piskvork "x,y" line as a board location, or null for any other output. */
export function parseRapfiMove(line: string, size: number) {
  const match = /^(\d+),(\d+)$/.exec(line.trim());
  if (!match) return null;
  const x = Number(match[1]);
  const y = Number(match[2]);
  if (x >= size || y >= size) return null;
  return y * size + x;
}

/**
 * The commands that make Rapfi move on this position: the moves to avoid (YXBLOCK), then the
 * whole board (BOARD, 1 for Rapfi's stones and 2 for the opponent's), which starts the search.
 * Multi-line commands go in as one string: Rapfi reads them in one go, and an empty input in the
 * middle would end its command loop.
 *
 * BOARD is read as the game's move list: the first stone is Black's, and wherever two stones of
 * one side follow each other Rapfi inserts a pass. So the stones go in alternating from the side
 * that moved first; in board order (as `steps` iterates) the passes gave Rapfi a different game,
 * and it misjudged the position badly (mates that did not exist).
 */
export function rapfiCommands(request: TRapfiRequest) {
  const { steps, size, turn, exclude } = request;
  const cell = (location: number) => `${location % size},${Math.floor(location / size)}`;
  const blocks = [...(exclude ?? [])].map(cell);
  // An impossible position (stone counts two apart) keeps board order.
  const order = tengenMoveOrder(steps, turn) ?? Object.keys(steps).map(Number);
  const stones = order.map((location) => `${cell(location)},${steps[location] == turn ? 1 : 2}`);
  return [
    'YXBLOCKRESET',
    ...(blocks.length > 0 ? [['YXBLOCK', ...blocks, 'DONE'].join('\n')] : []),
    ['BOARD', ...stones, 'DONE'].join('\n'),
  ];
}

export type TRapfi = {
  threads: number;
  /** Best move as a board location; rejects when Rapfi answers with an error. */
  think: (request: TRapfiRequest) => Promise<number>;
  /** True while Rapfi owes a late answer (for good when it never comes); it is not used then. */
  isBroken: () => boolean;
};

/**
 * Starts Rapfi in this thread (a worker: the search blocks until it answers, or runs in its own
 * threads in the multi-threaded build). One request at a time.
 */
export async function loadRapfi(
  factory: TRapfiFactory,
  options: {
    threads: number;
    locateFile: (file: string) => string;
    turnMs?: number;
    /** Fetches the blocked-ends network; null (or a rejection) keeps the classical evaluation. */
    loadCaroNetwork?: () => Promise<TRapfiCaroNetwork | null>;
    onMessage?: (line: string) => void;
  }
): Promise<TRapfi> {
  let pending: { resolve: (move: string) => void; reject: (error: Error) => void } | undefined;
  // Set while Rapfi owes the answer to a move given up on: requests are refused at once until it
  // answers, and for the rest of the session when it never does.
  let broken = false;
  const engine = await factory({
    arguments: [],
    locateFile: options.locateFile,
    onReceiveStdout: (line) => {
      options.onMessage?.(line);
      // The answer to a move given up on: Rapfi was only slow (a phone that froze the tab while
      // it searched, a slow start of its threads), not broken, so it plays again. The move itself
      // was played by Tengen meanwhile; the next request starts a new game, as after any error.
      if (!pending && broken && /^\d+,\d+$/.test(line.trim())) {
        broken = false;
        return;
      }
      if (!pending) return;
      if (line.startsWith('ERROR')) pending.reject(new Error(`rapfi: ${line}`));
      else if (/^\d+,\d+$/.test(line.trim())) pending.resolve(line);
    },
    onReceiveStderr: (line) => console.warn('[rapfi]', line),
  });

  // Tried once: a network that failed to arrive is not fetched again in this session.
  let caroNetwork: Promise<void> | undefined;
  function installCaroNetwork() {
    caroNetwork ??= (async () => {
      const files = await options.loadCaroNetwork?.().catch((error: unknown) => {
        console.warn(
          '[rapfi] caro network unavailable, playing with the classical evaluation',
          error
        );
        return null;
      });
      if (!files) return;
      engine.FS_createDataFile('/', CARO_NETWORK_FILE, files.network, true, false, true);
      engine.FS_createDataFile('/', CARO_CONFIG_FILE, files.config, true, false, true);
      // Rapfi builds its evaluator when a game starts, so the next START picks the network up.
      engine.sendCommand(`RELOADCONFIG ${CARO_CONFIG_FILE}`);
      game = '';
    })();
    return caroNetwork;
  }

  // The game Rapfi was set up for; a new size or rule starts a new one.
  let game = '';
  async function think(request: TRapfiRequest) {
    if (broken) throw new Error('rapfi: stopped answering earlier');
    if (request.winMode == 'blockOpponent') await installCaroNetwork();
    const requested = `${request.size}:${request.winMode}`;
    if (requested != game) {
      engine.sendCommand(`START ${request.size}`);
      engine.sendCommand(`INFO rule ${RULE[request.winMode]}`);
      engine.sendCommand(`INFO thread_num ${options.threads}`);
      engine.sendCommand(`INFO timeout_turn ${options.turnMs ?? RAPFI_TURN_MS}`);
      engine.sendCommand('INFO timeout_match 0');
      engine.sendCommand('INFO time_left 2147483647');
      game = requested;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const answer = new Promise<string>((resolve, reject) => (pending = { resolve, reject }));
    try {
      for (const command of rapfiCommands(request)) engine.sendCommand(command);
      // The single-threaded build has answered by now; the timer only guards the threaded one.
      const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => {
            // It may still be searching: it is not asked again until it answers.
            broken = true;
            reject(new Error('rapfi: no answer in time'));
          },
          (options.turnMs ?? RAPFI_TURN_MS) + RAPFI_ANSWER_GRACE_MS
        );
      });
      const line = await Promise.race([answer, timeout]);
      const move = parseRapfiMove(line, request.size);
      if (move == null) throw new Error(`rapfi: bad move ${line}`);
      return move;
    } catch (error) {
      // An unknown state is safest started over.
      game = '';
      throw error;
    } finally {
      clearTimeout(timer);
      pending = undefined;
    }
  }

  return { threads: options.threads, think, isBroken: () => broken };
}
