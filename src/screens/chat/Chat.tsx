import {View, Text} from 'react-native';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {GiftedChat} from 'react-native-gifted-chat';
import {styles} from './chat.style';
import Context from '../../i18n/Context';
import {CometChat} from '@cometchat/chat-sdk-react-native';

const Chat = () => {
  const {selectedConversation, user} = useContext(Context);

  const [messages, setMessages] = useState<any>([]);

  const userOnlineListenerId = useRef(Math.random());

  useEffect(() => {
    if (selectedConversation) {
      // get list of messages.
      loadMessages();
      // listen for messages.
      listenForMessages();
      // listen for online users.
      listenForOnlineUsers();
    }
    return () => {
      if (selectedConversation) {
        const conversationId =
          selectedConversation && selectedConversation.guid
            ? selectedConversation.guid
            : selectedConversation.uid
            ? selectedConversation.uid
            : null;
        if (conversationId) {
          CometChat.removeMessageListener();
        }
        setMessages(() => []);
        CometChat.removeUserListener(userOnlineListenerId);
      }
    };
  }, [selectedConversation]);

  const isValidMessage = (message: any) => {
    return (
      message &&
      message.id &&
      message.sentAt &&
      message.sender &&
      message.sender.uid &&
      message.sender.name &&
      message.sender.avatar &&
      message.category &&
      message.category === 'message'
    );
  };

  const listenForMessages = () => {
    const conversationId =
      selectedConversation && selectedConversation.guid
        ? selectedConversation.guid
        : selectedConversation.uid
        ? selectedConversation.uid
        : null;
    if (conversationId) {
      CometChat.addMessageListener(
        conversationId,
        new CometChat.MessageListener({
          onTextMessageReceived: (message: any) => {
            // set state.
            setMessages((previousMessages: any) =>
              GiftedChat.append(previousMessages, [
                transformSingleMessage(message),
              ]),
            );
          },
          onMediaMessageReceived: (mediaMessage: any) => {
            // Handle media message
            // set state.
            setMessages((previousMessages: any) =>
              GiftedChat.append(previousMessages, [
                transformSingleMessage(mediaMessage),
              ]),
            );
          },
        }),
      );
    }
  };

  const listenForOnlineUsers = () => {
    CometChat.addUserListener(
      Math.random()?.toString(),
      new CometChat.UserListener({
        onUserOnline: (onlineUser: any) => {
          if (onlineUser && onlineUser.uid === selectedConversation.uid) {
            // navigation.setOptions({
            //   headerTitle: () => renderChatHeaderTitle(onlineUser),
            // });
          }
        },
        onUserOffline: (offlineUser: any) => {
          if (offlineUser && offlineUser.uid === selectedConversation.uid) {
            // navigation.setOptions({
            //   headerTitle: () => renderChatHeaderTitle(offlineUser),
            // });
          }
        },
      }),
    );
  };

  const loadMessages = () => {
    const limit = 50;
    const messageRequestBuilder =
      new CometChat.MessagesRequestBuilder().setLimit(limit);
    if (selectedConversation.contactType === 1) {
      messageRequestBuilder.setGUID(selectedConversation.guid);
    } else if (selectedConversation.contactType === 0) {
      messageRequestBuilder.setUID(selectedConversation.uid);
    }
    const messagesRequest = messageRequestBuilder
      .setCategories(['message'])
      .build();
    messagesRequest
      .fetchPrevious()
      .then(messages => {
        setMessages(() => transformMessages(messages));
      })
      .catch(error => {});
  };

  const transformSingleMessage = (message: any) => {
    console.log('55', message);
    if (isValidMessage(message)) {
      let transformedMessage = {
        _id: message.id ? message.id : Math.random(),
        createdAt: new Date(message.sentAt * 1000),
        user: {
          _id: message.sender.uid,
          name: message.sender.name,
          avatar: message.sender.avatar,
        },
      };
      // if (message.text) {
      //   transformedMessage?.text = message.text;
      // }
      // if (message.data && message.data.url) {
      //   if (message.type && message.type === 'video') {
      //     transformedMessage?.video = message.data.url;
      //   } else {
      //     transformedMessage?.image = message.data.url;
      //   }
      // }
      return transformedMessage;
    }
    return message;
  };

  const transformMessages = (messages: any) => {
    if (messages && messages.length !== 0) {
      const transformedMessages = [];
      for (const message of messages) {
        if (isValidMessage(message)) {
          transformedMessages.push(transformSingleMessage(message));
        }
      }
      return transformedMessages.sort(function (a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }
    return [];
  };

  const getReceiverId = () => {
    if (selectedConversation && selectedConversation.guid) {
      return selectedConversation.guid;
    }
    if (selectedConversation && selectedConversation.uid) {
      return selectedConversation.uid;
    }
    return null;
  };

  const getReceiverType = () => {
    if (selectedConversation && selectedConversation.guid) {
      return CometChat.RECEIVER_TYPE.GROUP;
    }
    return CometChat.RECEIVER_TYPE.USER;
  };

  const sendMessageCometChat = (messages: any) => {
    console.log('1', messages);
    if (messages && messages.length !== 0) {
      console.log('2');
      const receiverID = getReceiverId();
      const receiverType = getReceiverType();
      console.log('3', receiverID, receiverType);
      if (receiverID && receiverType) {
        console.log('4');
        const messageText = messages[0]?.text;
        const textMessage = new CometChat.TextMessage(
          receiverID,
          messageText,
          receiverType,
        );
        CometChat.sendMessage(textMessage).then(
          message => {
            console.log('messs::', message);
            setMessages((previousMessages: any) =>
              GiftedChat.append(previousMessages, messages),
            );
          },
          error => {
            console.log('errrr::', error);
          },
        );
      }
    }
  };

  const onSend = useCallback((messages = []) => {
    sendMessageCometChat(messages);
  }, []);

  return (
    <View style={styles.container}>
      <GiftedChat
        scrollToBottom
        messages={messages}
        onSend={(messages: any) => onSend(messages)}
        user={{
          _id: user?.uid,
          name: user?.name,
          avatar: user?.avatar,
        }}
      />
    </View>
  );
};

export default Chat;
