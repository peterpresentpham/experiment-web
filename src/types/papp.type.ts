import { TPagination, TPaginationResponse } from './global';

export enum USER_ROLE {
  USER = 1,
  ADMIN = 2,
}

export enum USER_STATUS {
  EMAIL_INACTIVE = 1,
  ACTIVE = 2,
  INACTIVE = 3,
}

export enum CONVERSATION_TYPE {
  GROUP = 1,
  PRIVATE = 2,
}

export enum CONVERSATION_USER_ROLE {
  USER = 1,
  ADMIN = 2,
}

export enum MESSAGE_TYPE {
  TEXT = 1,
  IMAGE = 2,
  VIDEO = 3,
  SYSTEM = 4,
  FILE = 5,
  EDIT_TEXT = 6,
}

export type TAuthSignupDto = {
  name: string;
  password: string;
  email: string;
};

export type TVerifyTokenDto = {
  token: string;
};

export type TGoogleSigninDto = {
  idToken: string;
};

export type TPasswordLoginDto = {
  email?: string;
  name?: string;
  password: string;
};

export type TGoogleRecoverPasswordDto = {
  idToken: string;
};

export type TRecoverTokenDto = {
  token: string;
  newPassword: string;
};

export type TOnlyOkResponse = {
  isOk: boolean;
};

export type TAccessTokenResponse = {
  accessToken: string;
};

export type TMessageItem = {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  type: MESSAGE_TYPE;
  replyToId: number;
};

export type TGetMessageDto = TPagination & {
  conversationId?: number;
};

export type TEditMessageDto = {
  conversationId: number;
  messageId: number;
  content: string;
};

export type TMessageResponse = {
  data: Array<TMessageItem>;
  metadata: TPaginationResponse;
};

export type TUserFindItem = {
  id: number;
  name: string;
  email: string;
};

export type TUser = TUserFindItem & {
  role: USER_ROLE;
  status: USER_STATUS;
  avatarUrl?: string;
  lastSeenAt?: string;
};

export type TFindUserDto = TPagination & {
  searchText?: string;
  userIds?: Array<number>;
};

export type TFindUserResponse = {
  data: Array<TUserFindItem>;
  metadata: TPaginationResponse;
};

export type TCreatePrivateChatDto = {
  partnerId: number;
};

export type TConversation = {
  id: number;
  name: string;
  type: number;
  hash: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type TConversationParticipant = {
  id: number;
  role: number;
  conversation: TConversation;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type TParticipantItem = {
  id: number;
  name: string;
  email: string;
};

export type TConversationItem = {
  conversationId: number;
  conversationName: string;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  id: number;
  role: CONVERSATION_USER_ROLE;
  groupType: CONVERSATION_TYPE;

  yourParticipant: TParticipantItem;
  anotherParticipant: TParticipantItem | null;
};

export type TConversationResponse = {
  data: Array<TConversationItem>;
  metadata: TPaginationResponse;
};

export enum MICROSERVICE_EVENTS {
  join_conversation = 'join_conversation',
  joined_conversation = 'joined_conversation',
  typing_message = 'typing_message',
  stop_typing = 'stop_typing',
  send_message = 'send_message',
  receive_message = 'receive_message',
  message_sent = 'message_sent',
  edit_message = 'edit_message',
  notify_edited_message = 'notify_edited_message',
  message_edited = 'message_edited',
  leave_conversation = 'leave_conversation',
}

export type TSocketReceiveMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  type: MESSAGE_TYPE;
  replyToId: number;
};

export type TSocketJoinedConversation = {
  conversationId?: number;
};

export type TSocketJoinConversation = {
  conversationId: number;
};

export type TSocketLeaveConversation = {
  conversationId: number;
};

type TSocketSendMessage = {
  conversationId: number;
  content: string;
};

type TSocketEditMessage = TSocketSendMessage & {
  messageId: number;
};

export type TSocketNotifyEditedMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  editedContent: string;
};

export type TSocketTypingMessage = {
  conversationId: number;
  senderId: number;
};

export type ClientToServerEvents = {
  [MICROSERVICE_EVENTS.send_message]: (payload: TSocketSendMessage) => void;
  [MICROSERVICE_EVENTS.leave_conversation]: (payload: TSocketLeaveConversation) => void;
  [MICROSERVICE_EVENTS.join_conversation]: (payload: TSocketJoinConversation) => void;
  [MICROSERVICE_EVENTS.typing_message]: (payload: TSocketTypingMessage) => void;
  [MICROSERVICE_EVENTS.stop_typing]: (payload: TSocketTypingMessage) => void;
  [MICROSERVICE_EVENTS.edit_message]: (payload: TSocketEditMessage) => void;
};

export type ServerToClientEvents = {
  [MICROSERVICE_EVENTS.receive_message]: (payload: TSocketReceiveMessage) => void;
  [MICROSERVICE_EVENTS.joined_conversation]: (payload: TSocketJoinedConversation) => void;
  [MICROSERVICE_EVENTS.typing_message]: (payload: TSocketTypingMessage) => void;
  [MICROSERVICE_EVENTS.stop_typing]: (payload: TSocketTypingMessage) => void;
  [MICROSERVICE_EVENTS.message_sent]: (payload: TSocketReceiveMessage) => void;
  [MICROSERVICE_EVENTS.notify_edited_message]: (payload: TSocketNotifyEditedMessage) => void;
  [MICROSERVICE_EVENTS.message_edited]: (payload: TSocketNotifyEditedMessage) => void;
};
