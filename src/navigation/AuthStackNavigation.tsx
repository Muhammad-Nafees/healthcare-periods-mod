import {ActivityIndicator, View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SCREENS} from '../constants/screens';
import SplashScreen from '../screens/authStack/splashScreeen/Splash';
import {NavigationStackParams} from '../interfaces/index';
import GetStarted from '../screens/authStack/GetStarted';
import PhoneNumberVerification from '../screens/authStack/PhoneNumberVerification';
import OTPVerificationScreen from '../screens/authStack/forgetScreens/OTPVerification';
import ResetPasswordScreen from '../screens/authStack/forgetScreens/ResetPassword';
import SignupScreen from '../screens/authStack/Signup';
import LoginScreen from '../screens/authStack/Login';
import ForgotPasswordScreen from '../screens/authStack/forgetScreens/ForgotPassword';
import {NavigationContainer} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {user} from '../store/selectors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useState} from 'react';
import {themeColors} from '../theme/colors';

const AuthStackNavigation = () => {
  const Stack = createNativeStackNavigator();
  const [isUserLoginLoading, setIsUserLoginLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkUserLogin = async () => {
      try {
        const isLoggedInJSON = await AsyncStorage.getItem('isLoggedIn');
        const isLogged = isLoggedInJSON ? JSON.parse(isLoggedInJSON) : false;
        setIsLoggedIn(isLogged);
        setIsUserLoginLoading(false);
      } catch (error) {
        console.log('~ ERROR :', error);
      }
    };
    checkUserLogin();
  });

  if (isUserLoginLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator color={themeColors.primary} size={30} />
      </View>
    );
  }

  // const userData = useSelector(user);
  const initialRoute = !isLoggedIn ? 'Splash' : 'Login';

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          animation: 'slide_from_right',
          animationDuration: 10000,
        }}>
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="GetStarted"
          component={GetStarted}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="VerifyPhoneNumber"
          component={PhoneNumberVerification}
        />
        <Stack.Screen
          name="OtpVerification"
          component={OTPVerificationScreen}
        />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AuthStackNavigation;
