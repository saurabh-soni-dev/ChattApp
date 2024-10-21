import {CometChat} from '@cometchat/chat-sdk-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import 'react-native-gesture-handler';
import {cometChatConfig} from '../../CometConfig';
import {audioCall, settings, videoCall} from '../assets/imageIndex';
import Context from '../i18n/Context';
import AuthStack from './stacks/authStack';

const Route = () => {
  const callListenerId: any = useRef(Math.random());
  const [user, setUser] = useState(null);
  console.log('user::', user);
  const [selectedConversation, setSelectedConversation] = useState<any>('');

  const [callType, setCallType] = useState<any>(null);
  const [callSettings, setCallSettings] = useState<any>(null);
  const [call, setCall] = useState<any>(null);
  const [isSomeoneCalling, setIsSomeoneCalling] = useState<any>(false);

  useEffect(() => {
    initCometChat();
    initAuthenticatedUser();
    getPermissions();
    return () => {
      setCallType(null);
      setCall(null);
      setCallSettings(null);
      setIsSomeoneCalling(false);
      CometChat.removeUserListener(user?.uid);
    };
  }, []);

  useEffect(() => {
    if (CometChat) {
      listenForCall();
    }
  }, [CometChat]);

  useEffect(() => {
    if (callType && selectedConversation) {
      initialCall();
    }
  }, [callType]);

  const initCometChat = async () => {
    let appSetting = new CometChat.AppSettingsBuilder()
      .subscribePresenceForAllUsers()
      .setRegion(cometChatConfig.cometChatRegion)
      .autoEstablishSocketConnection(true)
      .build();
    CometChat.init(cometChatConfig.cometChatAppId, appSetting).then(
      () => {
        console.log('Initialization completed successfully');
      },
      error => {
        console.log('Initialization failed with error:', error);
      },
    );
  };

  const initAuthenticatedUser = async () => {
    const authenticatedUser = await AsyncStorage.getItem('auth');
    console.log('authenticatedUser::12', authenticatedUser);
    setUser(() => (authenticatedUser ? JSON.parse(authenticatedUser) : null));
  };

  const getPermissions = () => {
    if (Platform.OS == 'android') {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
    }
  };

  const createGroup = () => () => {
    // navigation.navigate('Create Group');
  };

  const manageGroup = () => () => {
    // navigation.navigate('Manage Group');
  };

  // const handleLogout = () => {
  //   CometChat.logout().then(
  //     () => {
  //       console.log('Logout completed successfully');
  //       AsyncStorage.removeItem('auth');
  //       setUser(null);
  //       navigation.reset({
  //         index: 0,
  //         routes: [{name: 'login'}],
  //       });
  //     },
  //     error => {
  //       console.log('Logout failed with exception:', {error});
  //     },
  //   );
  // };

  // const logout = () => () => {
  //   Alert.alert('Confirm', 'Do you want to log out?', [
  //     {
  //       text: 'Cancel',
  //       style: 'cancel',
  //     },
  //     {text: 'OK', onPress: () => handleLogout()},
  //   ]);
  // };

  const startAudioCall = () => {
    if (CometChat && selectedConversation) {
      setCallType(CometChat?.CALL_TYPE?.AUDIO);
    }
  };

  const startVideoCall = () => {
    if (CometChat && selectedConversation) {
      setCallType(CometChat?.CALL_TYPE?.VIDEO);
    }
  };

  const rejectCall = (status: any, call: any) => {
    if (status && call) {
      CometChat.rejectCall(call.sessionId, status).then(
        call => {
          console.log('Call rejected successfully', call);
          setCallSettings(null);
          setCallType(null);
          setCall(null);
          setIsSomeoneCalling(false);
        },
        error => {
          console.log('Call rejection failed with error:', error);
        },
      );
    }
  };

  const startCall = (call: any) => {
    const sessionId = call.sessionId;
    const callType = call.type;
    const callListener = new CometChat.OngoingCallListener({
      onUserJoined: (user: any) => {
        /* Notification received here if another user joins the call. */
        console.log('User joined call:', user);
        /* this method can be use to display message or perform any actions if someone joining the call */
      },
      onUserLeft: (user: any) => {
        /* Notification received here if another user left the call. */
        console.log('User left call:', user);
        /* this method can be use to display message or perform any actions if someone leaving the call */
      },
      onUserListUpdated: (userList: any) => {
        console.log('user list:', userList);
      },
      onCallEnded: (call: any) => {
        /* Notification received here if current ongoing call is ended. */
        console.log('Call ended:', call);
        /* hiding/closing the call screen can be done here. */
        const status = CometChat.CALL_STATUS.CANCELLED;
        rejectCall(status, call.sessionId);
        setCallSettings(null);
        setCallType(null);
        setCall(null);
        setIsSomeoneCalling(false);
      },
      onError: (error: any) => {
        console.log('Error :', error);
        /* hiding/closing the call screen can be done here. */
        setCallSettings(null);
        setCallType(null);
        setCall(null);
        setIsSomeoneCalling(false);
      },
      onAudioModesUpdated: (audioModes: any) => {
        console.log('audio modes:', audioModes);
      },
    });
    const callSettings: any = new CometChat.CallSettingsBuilder()
      .setSessionID(sessionId)
      .enableDefaultLayout(true)
      .setIsAudioOnlyCall(callType == CometChat.CALL_TYPE.AUDIO ? true : false)
      .setCallEventListener(callListener)
      .build();
    setCallSettings(() => callSettings);
  };

  const acceptCall = (call: any) => {
    if (call) {
      CometChat.acceptCall(call.sessionId).then(
        call => {
          console.log('Call accepted successfully:', call);
          // start the call using the startCall() method
          startCall(call);
          setIsSomeoneCalling(false);
        },
        error => {
          console.log('Call acceptance failed with error', error);
          // handle exception
        },
      );
    }
  };

  const confirmCall = (call: any) => {
    if (call) {
      setIsSomeoneCalling(true);
    }
  };

  const listenForCall = () => {
    CometChat.addCallListener(
      callListenerId,
      new CometChat.CallListener({
        onIncomingCallReceived(call: any) {
          console.log('Incoming call:', call);
          const callInitiatorUid = call.callInitiator.uid;
          if (callInitiatorUid && callInitiatorUid !== user?.uid) {
            setCall(call);
            confirmCall(call);
          }
        },
        onOutgoingCallAccepted(call: any) {
          console.log('Outgoing call accepted:', call);
          startCall(call);
        },
        onOutgoingCallRejected(call: any) {
          console.log('Outgoing call rejected:', call);
          setCallSettings(null);
          setCallType(null);
          setCall(null);
          setIsSomeoneCalling(false);
        },
        onIncomingCallCancelled(call: any) {
          console.log('Incoming call calcelled:', call);
          setCallSettings(null);
          setCallType(null);
          setCall(null);
          setIsSomeoneCalling(false);
        },
      }),
    );
  };

  const isGroup = () => {
    return selectedConversation && selectedConversation?.guid;
  };

  const initialCall = () => {
    const receiverID = isGroup()
      ? selectedConversation?.guid
      : selectedConversation?.uid;
    const receiverType = isGroup()
      ? CometChat.RECEIVER_TYPE.GROUP
      : CometChat.RECEIVER_TYPE.USER;

    const call = new CometChat.Call(receiverID, callType, receiverType);

    CometChat.initiateCall(call).then(
      (outGoingCall: any) => {
        console.log('Call initiated successfully:', outGoingCall);
        setCall(outGoingCall);
        // perform action on success. Like show your calling screen.
      },
      error => {
        console.log('Call initialization failed with exception:', error);
      },
    );
  };

  const cancelCall = () => {
    const status = CometChat.CALL_STATUS.CANCELLED;
    rejectCall(status, call);
  };

  const handleRejectCall = () => {
    const status = CometChat.CALL_STATUS.REJECTED;
    rejectCall(status, call);
  };

  const handleAcceptCall = () => {
    acceptCall(call);
  };

  const renderChatHeaderTitle = () => {
    if (selectedConversation && selectedConversation?.name) {
      return (
        <View style={styles.chatHeaderTitleContainer}>
          <Text style={styles.chatHeaderTitle}>
            {selectedConversation.name}
          </Text>
          {selectedConversation.status && (
            <Text style={[styles.chatHeaderTitle, styles.chatHeaderStatus]}>
              {' '}
              - {selectedConversation.status}
            </Text>
          )}
        </View>
      );
    }
    return <Text style={styles.chatHeaderTitle}>Chat</Text>;
  };

  const renderChatHeaderRight = () => {
    if (
      selectedConversation &&
      selectedConversation?.contactType === 1 &&
      selectedConversation?.owner === user?.uid
    ) {
      return (
        <View style={styles.chatHeaderActions}>
          <TouchableOpacity onPress={startAudioCall}>
            <Image
              style={{width: 24, height: 24, marginRight: 8}}
              source={audioCall}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={startVideoCall}>
            <Image
              style={{width: 32, height: 24, marginRight: 8}}
              source={videoCall}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={manageGroup()}>
            <Image style={{width: 24, height: 24}} source={settings} />
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.chatHeaderActions}>
        <TouchableOpacity onPress={startAudioCall}>
          <Image
            style={{width: 24, height: 24, marginRight: 8}}
            source={audioCall}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={startVideoCall}>
          <Image style={{width: 32, height: 24}} source={videoCall} />
        </TouchableOpacity>
      </View>
    );
  };

  if (callType && selectedConversation && !callSettings) {
    return (
      <Modal animated animationType="fade">
        <View style={styles.waitingForCallContainer}>
          <Text style={styles.waitingForCallContainerTitle}>
            Calling {selectedConversation?.name}...
          </Text>
          <View style={styles.waitingForCallImageContainer}>
            <Image
              style={{width: 128, height: 128}}
              source={{uri: selectedConversation?.avatar}}></Image>
          </View>
          <TouchableOpacity style={styles.cancelCallBtn} onPress={cancelCall}>
            <Text style={styles.cancelCallLabel}>Cancel Call</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  if (callSettings) {
    return (
      <Modal animated animationType="fade">
        <View style={styles.callingScreenContainer}>
          <CometChat.CallingComponent callsettings={callSettings} />
        </View>
      </Modal>
    );
  }

  // if (user && !callSettings) {
  //   return (
  //     <Context.Provider
  //       value={{
  //         CometChat,
  //         user,
  //         setUser,
  //         selectedConversation,
  //         setSelectedConversation,
  //       }}>
  //       {isSomeoneCalling && call && (
  //         <Modal animated animationType="fade">
  //           <View style={styles.waitingForCallContainer}>
  //             <Text style={styles.waitingForCallContainerTitle}>
  //               You are having a call from {call?.sender?.name}
  //             </Text>
  //             <View style={styles.waitingForCallImageContainer}>
  //               <Image
  //                 style={{width: 128, height: 128}}
  //                 source={{
  //                   uri: call?.sender?.avatar
  //                     ? call?.sender?.avatar
  //                     : 'https://picsum.photos/200/300',
  //                 }}
  //               />
  //             </View>
  //             <TouchableOpacity
  //               style={styles.acceptCallBtn}
  //               onPress={handleAcceptCall}>
  //               <Text style={styles.acceptCallLabel}>Accept Call</Text>
  //             </TouchableOpacity>
  //             <TouchableOpacity
  //               style={styles.cancelCallBtn}
  //               onPress={handleRejectCall}>
  //               <Text style={styles.cancelCallLabel}>Reject Call</Text>
  //             </TouchableOpacity>
  //           </View>
  //         </Modal>
  //       )}
  //     </Context.Provider>
  //   );
  // }

  return (
    <Context.Provider
      value={{user, setUser, selectedConversation, setSelectedConversation}}>
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    </Context.Provider>
  );
};

export default Route;

const styles = StyleSheet.create({
  chatHeaderActions: {
    flexDirection: 'row',
  },
  chatHeaderTitleContainer: {
    flexDirection: 'row',
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatHeaderStatus: {
    textTransform: 'capitalize',
  },
  callingScreenContainer: {
    height: '100%',
    position: 'relative',
    width: '100%',
  },
  waitingForCallContainer: {
    flexDirection: 'column',
    height: '100%',
    position: 'relative',
    width: '100%',
    flex: 1,
    paddingTop: 128,
  },
  waitingForCallContainerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingVertical: 12,
    textAlign: 'center',
  },
  waitingForCallImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelCallBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    fontSize: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 16,
  },
  cancelCallLabel: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  acceptCallBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    fontSize: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 16,
  },
  acceptCallLabel: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
