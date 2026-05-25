import { TPaginationResponse } from './global';

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
  FILE = 3,
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

export type TUser = {
  id: number;
  name: string;
  email: string;
  role: USER_ROLE;
  status: USER_STATUS;
  avatarUrl?: string;
  lastSeenAt?: string;
};

export type TUserFindItem = {
  id: number;
  name: string;
  email: string;
};

export type TFindUserDto = {
  searchText: string;
  page?: number;
  limit?: number;
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

export type TMessageItem = {
  conversationId: number;
  senderId: number;
  senderName: string;
  senderEmail: string;
  content: string;
  type: MESSAGE_TYPE;
};

export type TGetMessageDto = {
  conversationId?: number;
  page?: number;
  limit?: number;
};

export type TMessageResponse = {
  data: Array<TMessageItem>;
  metadata: TPaginationResponse;
};
