import {CometChat} from '@cometchat/chat-sdk-react-native';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {cometChatConfig} from '../../../CometConfig';
import screenName from '../../navigation/screenName';

const SignUp = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [errortext, setErrortext] = useState('');

  const handleSubmitButton = () => {
    setErrortext('');
    if (!userName) return Alert.alert('Please fill Name');
    if (!userEmail) return Alert.alert('Please fill Email');
    if (!userPassword) return Alert.alert('Please fill Address');

    auth()
      .createUserWithEmailAndPassword(userEmail, userPassword)
      .then(user => {
        console.log('user::', JSON.stringify(user));
        console.log('Registration Successful. Please Login to proceed');
        if (user) {
          auth().currentUser?.updateProfile({
            displayName: userName,
            photoURL: 'https://aboutreact.com/profile.png',
          });
          if (user?.user?.uid) {
            let newUser = new CometChat.User(user?.user?.uid);
            newUser.setName(userName);
            CometChat.createUser(newUser, cometChatConfig.cometChatAuthKey)
              .then(res => {
                if (res?.uid) {
                  console.log('comet', res);
                  navigation.navigate(screenName.login);
                }
              })
              .catch(err => {
                console.log('comet err:', err);
              });
          }
        }
      })
      .catch(error => {
        console.log('catch firebase:', error);
        if (error.code === 'auth/email-already-in-use') {
          setErrortext('That email address is already in use!');
        } else {
          setErrortext(error.message);
        }
      });
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#307ecc'}}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          justifyContent: 'center',
          alignContent: 'center',
        }}>
        <View style={{alignItems: 'center'}}>
          <Image
            source={{uri: 'https://picsum.photos/200/300'}}
            style={{
              width: '50%',
              height: 200,
              resizeMode: 'contain',
              margin: 30,
            }}
          />
        </View>
        <KeyboardAvoidingView enabled>
          <View style={styles.sectionStyle}>
            <TextInput
              style={styles.inputStyle}
              onChangeText={UserName => setUserName(UserName)}
              placeholder="Enter Name"
              placeholderTextColor="#8b9cb5"
            />
          </View>
          <View style={styles.sectionStyle}>
            <TextInput
              style={styles.inputStyle}
              onChangeText={UserEmail => setUserEmail(UserEmail)}
              placeholder="Enter Email"
              placeholderTextColor="#8b9cb5"
              keyboardType="email-address"
            />
          </View>
          <View style={styles.sectionStyle}>
            <TextInput
              style={styles.inputStyle}
              onChangeText={UserPassword => setUserPassword(UserPassword)}
              placeholder="Enter Password"
              placeholderTextColor="#8b9cb5"
              secureTextEntry={true}
            />
          </View>
          {errortext != '' ? (
            <Text style={styles.errorTextStyle}> {errortext} </Text>
          ) : null}
          <TouchableOpacity
            style={styles.buttonStyle}
            activeOpacity={0.5}
            onPress={handleSubmitButton}>
            <Text style={styles.buttonTextStyle}>REGISTER</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};
export default SignUp;

const styles = StyleSheet.create({
  sectionStyle: {
    flexDirection: 'row',
    height: 40,
    marginTop: 20,
    marginLeft: 35,
    marginRight: 35,
    margin: 10,
  },
  buttonStyle: {
    backgroundColor: '#7DE24E',
    borderWidth: 0,
    color: '#FFFFFF',
    borderColor: '#7DE24E',
    height: 40,
    alignItems: 'center',
    borderRadius: 30,
    marginLeft: 35,
    marginRight: 35,
    marginTop: 20,
    marginBottom: 20,
  },
  buttonTextStyle: {
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 16,
  },
  inputStyle: {
    flex: 1,
    color: 'white',
    paddingLeft: 15,
    paddingRight: 15,
    borderWidth: 1,
    borderRadius: 30,
    borderColor: '#dadae8',
  },
  errorTextStyle: {
    color: 'red',
    textAlign: 'center',
    fontSize: 14,
  },
});
