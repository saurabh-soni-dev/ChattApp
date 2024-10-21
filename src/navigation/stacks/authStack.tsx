import {
  CardStyleInterpolators,
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import Home from '../../screens/home/Home';
import Login from '../../screens/login/Login';
import Signup from '../../screens/signup/SignUp';
import screenName from '../screenName';
import {useContext} from 'react';
import Context from '../../i18n/Context';
import Chat from '../../screens/chat/Chat';
const Stack = createStackNavigator();
export type AuthParams = {
  login: undefined;
  signUp: undefined;
  home: undefined;
  chat: undefined;
};

export type AuthNavigationProps = StackNavigationProp<AuthParams>;

const AuthStack = () => {
  const {user} = useContext(Context);
  console.log('user', user);

  const initialScreen = () => {
    if (user?.authToken) {
      return screenName.home;
    } else {
      return screenName.login;
    }
  };
  return (
    <Stack.Navigator
      // initialRouteName={screenName.chat}
      detachInactiveScreens={true}
      screenOptions={{
        cardOverlayEnabled: true,
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}>
      <Stack.Screen name={screenName.login} component={Login} />
      <Stack.Screen name={screenName.signUp} component={Signup} />
      <Stack.Screen name={screenName.home} component={Home} />
      <Stack.Screen name={screenName.chat} component={Chat} />
    </Stack.Navigator>
  );
};

export default AuthStack;
