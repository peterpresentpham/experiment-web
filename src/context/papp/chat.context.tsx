'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Socket } from 'socket.io-client';
import useSocket from 'src/hooks/useSocket';
import { useGetMessages } from 'src/queries/papp/message.query';
import { useFindUsers, useGetMe } from 'src/queries/papp/user.query';
import { useConversationStore } from 'src/states/conversation.state';
import {
  ClientToServerEvents,
  MESSAGE_TYPE,
  MICROSERVICE_EVENTS,
  ServerToClientEvents,
  TSocketNotifyEditedMessage,
  TSocketJoinedConversation,
  TSocketReceiveMessage,
  TSocketTypingMessage,
} from 'src/types/papp.type';

type TChatContext = {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  messages: TSocketReceiveMessage[];
  typingUserIds: Array<number>;
  fn: {
    sendMessage: (message: string) => void;
    typingMessage: () => void;
    stopMessage: () => void;
    editMessage: (messageId: number, content: string) => void;
  };
};

const contextDefault: TChatContext = {
  socket: null,
  messages: [],
  typingUserIds: [],
  fn: {
    sendMessage: () => {},
    typingMessage: () => {},
    stopMessage: () => {},
    editMessage: () => {},
  },
};

const ChatContext = createContext<TChatContext>(contextDefault);

interface Props {
  children: ReactNode;
}

export default function ChatProvider({ children }: Props) {
  const { socket } = useSocket<ServerToClientEvents, ClientToServerEvents>();
  const currentConversationId = useConversationStore((state) => state.currentConversationId);
  const addConversationUsers = useConversationStore((state) => state.fn.addConversationUsers);

  const [typingUserIds, setTypingUserIds] = useState<Array<number>>([]);
  const [liveMessages, setLiveMessages] = useState<TSocketReceiveMessage[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const pendingMessagesRef = useRef<string[]>([]);
  const joinRequestedRef = useRef(false);

  const { data: messageData } = useGetMessages({ conversationId: currentConversationId });
  const { data: userData } = useGetMe();

  const { userIds } = useMemo(() => {
    if (currentConversationId && messageData?.data) {
      const userIds = new Set(messageData.data.map((item) => item.senderId));
      return { userIds: [...userIds] };
    }
    return { userIds: [] };
  }, [currentConversationId, messageData?.data]);

  const { data: conversationUsers } = useFindUsers({ userIds });

  useEffect(() => {
    if (conversationUsers?.data) addConversationUsers(conversationUsers.data);
  }, [addConversationUsers, conversationUsers?.data]);

  const messages = useMemo<TSocketReceiveMessage[]>(() => {
    const restMessages: TSocketReceiveMessage[] = (messageData?.data || [])
      .slice()
      .reverse()
      .map((msg) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        message: msg.content,
        content: msg.content,
        type: msg.type,
        replyToId: msg.replyToId,
      }));

    if (liveMessages.length === 0) return restMessages;

    const liveIds = new Set(liveMessages.map((m) => m.id));
    const uniqueRest = restMessages.filter((m) => !liveIds.has(m.id));
    return [...uniqueRest, ...liveMessages];
  }, [messageData?.data, liveMessages]);

  useEffect(() => {
    setLiveMessages([]);
    setIsJoined(false);
    pendingMessagesRef.current = [];
    joinRequestedRef.current = false;
  }, [currentConversationId]);

  useEffect(() => {
    if (!socket || !currentConversationId) return;

    const doJoin = () => {
      if (joinRequestedRef.current) return;
      joinRequestedRef.current = true;
      socket.emit(MICROSERVICE_EVENTS.join_conversation, {
        conversationId: currentConversationId,
      });
    };

    if (socket.connected) doJoin();
    else socket.once('connect', doJoin);

    return () => {
      socket.off('connect', doJoin);
    };
  }, [socket, currentConversationId]);

  useEffect(() => {
    if (!socket) return;

    const handleDisconnect = () => {
      setIsJoined(false);
      joinRequestedRef.current = false;
    };

    const handleReconnect = () => {
      if (!currentConversationId || joinRequestedRef.current) return;
      joinRequestedRef.current = true;
      socket.emit(MICROSERVICE_EVENTS.join_conversation, {
        conversationId: currentConversationId,
      });
    };

    socket.on('disconnect', handleDisconnect);
    socket.on('connect', handleReconnect);

    return () => {
      socket.off('disconnect', handleDisconnect);
      socket.off('connect', handleReconnect);
    };
  }, [socket, currentConversationId]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (payload: TSocketReceiveMessage) => {
      if (payload.conversationId !== currentConversationId) return;
      setLiveMessages((prev) => [...prev, payload]);
    };

    const handleJoined = (payload: TSocketJoinedConversation) => {
      if (payload?.conversationId !== currentConversationId) return;
      setIsJoined(true);

      if (pendingMessagesRef.current.length > 0 && currentConversationId != undefined) {
        const pending = pendingMessagesRef.current.splice(0);
        pending.forEach((message) => {
          socket.emit(MICROSERVICE_EVENTS.send_message, {
            conversationId: currentConversationId,
            content: message,
          });
        });
      }
    };

    const typingMessage = (payload: TSocketTypingMessage) => {
      if (payload.conversationId !== currentConversationId) return;
      setTypingUserIds((prev) => {
        if (prev.includes(payload.senderId)) return prev;
        return [...prev, payload.senderId];
      });
    };

    const stopTypeMessage = (payload: TSocketTypingMessage) => {
      if (payload.conversationId !== currentConversationId) return;
      setTypingUserIds((prev) => prev.filter((id) => id !== payload.senderId));
    };

    const editedMessage = (payload: TSocketNotifyEditedMessage) => {
      if (payload.conversationId !== currentConversationId) return;

      setLiveMessages((prev) => {
        const data = prev.map((msg) =>
          msg.id === payload.id
            ? { ...msg, content: payload.editedContent, type: MESSAGE_TYPE.EDIT_TEXT }
            : msg
        );
        return [...data];
      });
    };

    socket.on(MICROSERVICE_EVENTS.receive_message, handleReceiveMessage);
    socket.on(MICROSERVICE_EVENTS.message_sent, handleReceiveMessage);
    socket.on(MICROSERVICE_EVENTS.joined_conversation, handleJoined);
    socket.on(MICROSERVICE_EVENTS.typing_message, typingMessage);
    socket.on(MICROSERVICE_EVENTS.stop_typing, stopTypeMessage);
    socket.on(MICROSERVICE_EVENTS.notify_edited_message, editedMessage);
    socket.on(MICROSERVICE_EVENTS.message_edited, editedMessage);

    return () => {
      socket.off(MICROSERVICE_EVENTS.receive_message, handleReceiveMessage);
      socket.off(MICROSERVICE_EVENTS.message_sent, handleReceiveMessage);
      socket.off(MICROSERVICE_EVENTS.joined_conversation, handleJoined);
      socket.off(MICROSERVICE_EVENTS.typing_message, typingMessage);
      socket.off(MICROSERVICE_EVENTS.stop_typing, stopTypeMessage);
      socket.off(MICROSERVICE_EVENTS.notify_edited_message, editedMessage);
      socket.off(MICROSERVICE_EVENTS.message_edited, editedMessage);
    };
  }, [socket, currentConversationId]);

  const sendMessage = useCallback(
    (message: string) => {
      if (!socket || !currentConversationId) return;

      if (!isJoined) {
        pendingMessagesRef.current.push(message);
        if (!joinRequestedRef.current) {
          joinRequestedRef.current = true;
          socket.emit(MICROSERVICE_EVENTS.join_conversation, {
            conversationId: currentConversationId,
          });
        }
        return;
      }

      socket.emit(MICROSERVICE_EVENTS.send_message, {
        conversationId: currentConversationId,
        content: message,
      });
    },
    [currentConversationId, isJoined, socket]
  );

  const typingMessage = useCallback(() => {
    if (!socket || !currentConversationId || !isJoined || userData?.id == undefined) return;
    socket.emit(MICROSERVICE_EVENTS.typing_message, {
      conversationId: currentConversationId,
      senderId: userData?.id,
    });
  }, [currentConversationId, isJoined, socket, userData?.id]);

  const stopMessage = useCallback(() => {
    if (!socket || !currentConversationId || !isJoined || userData?.id == undefined) return;
    socket.emit(MICROSERVICE_EVENTS.stop_typing, {
      conversationId: currentConversationId,
      senderId: userData?.id,
    });
  }, [currentConversationId, isJoined, socket, userData?.id]);

  const editMessage = useCallback(
    (messageId: number, content: string) => {
      if (!socket || !currentConversationId || !isJoined) return;
      socket.emit(MICROSERVICE_EVENTS.edit_message, {
        conversationId: currentConversationId,
        content,
        messageId,
      });
    },
    [currentConversationId, isJoined, socket]
  );

  const contextValue = useMemo<TChatContext>(
    () => ({
      socket,
      messages,
      typingUserIds,
      fn: { sendMessage, typingMessage, stopMessage, editMessage },
    }),
    [messages, typingUserIds, sendMessage, typingMessage, socket, stopMessage, editMessage]
  );

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChatContext must be used within a ChatSocketProvider');
  return context;
}
