export type TSignalingClientToServerEvents = {
  create_room: () => void;
  join_room: (payload: { roomCode: string }) => void;
  send_signal: (payload: { roomCode: string; signal: string }) => void;
};

export type TSignalingServerToClientEvents = {
  room_created: (payload: { roomCode: string }) => void;
  joined_room: (payload: { roomCode: string }) => void;
  peer_joined: () => void;
  peer_left: () => void;
  receive_signal: (payload: { signal: string }) => void;
  room_error: (payload: { reason: string }) => void;
};
