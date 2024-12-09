import {useDispatch, useSelector} from 'react-redux';
import {user} from '../store/selectors';
import AppNavigation from './AppNavigation';
import AuthStackNavigation from './AuthStackNavigation';
import {useEffect, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getUserProfile} from '../services/auth';
import {isBiometricUser, setUserData} from '../store/slices/User';
import {Dispatch, UnknownAction} from '@reduxjs/toolkit';
import {
  ActivityIndicator,
  AppState,
  BackHandler,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {themeColors} from '../theme/colors';
import TouchID from 'react-native-touch-id';
import {size} from '../theme/fontStyle';
import {fonts} from '../theme/fonts';
import LoginScreen from '../screens/authStack/Login';
import {NavigationContainer} from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidVisibility,
} from '@notifee/react-native';
import {notificationListeners} from '../utils/notificationServiceHelper';
import {setPeriodTracker} from '../store/slices/periodTracker';
import {supabase} from '../utils/supabaseClient';

const Route = () => {
  const optionalConfigObject = {
    title: 'Please Authenticate', // Android
    imageColor: themeColors.primary, // Android
    imageErrorColor: '#ff0000', // Android
    sensorDescription: 'Touch the sensor', // Android
    sensorErrorDescription: 'Authentication Failed', // Android
    cancelText: 'Cancel', // Android
    fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
    unifiedErrors: false, // use unified error messages (default false)
    passcodeFallback: false, // iOS - allows the device to fall back to using the passcode, if faceid/touch is not available. this does not mean that if touchid/faceid fails the first few times it will revert to passcode, rather that if the former are not enrolled, then it will use the passcode.
  };

  const dispatch = useDispatch<Dispatch<UnknownAction>>();
  const userData: any = useSelector(user);
  const {isBiometricUserAvailable} = useSelector(
    (state: any) => state.userData,
  );

  console.log('isBiometricUserAvailable', isBiometricUserAvailable);
  console.log('user-data-----', userData);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: any) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const lastMinimizedTime = await AsyncStorage.getItem(
          'lastMinimizedTime',
        );
        const currentTime = new Date().getTime();
        if (
          lastMinimizedTime &&
          currentTime - parseInt(lastMinimizedTime) >= 30000 // Check if 30 seconds have passed
        ) {
          // dispatch(isBiometricUser(true));
          triggerBiometricLogin();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        const currentTime = new Date().getTime();
        await AsyncStorage.setItem('lastMinimizedTime', currentTime.toString());
      }

      appState.current = nextAppState;
    };

    const handleAppClose = async () => {
      // This will be triggered when the app is closed (unmounted)
      const currentTime = new Date().getTime();
      await AsyncStorage.setItem('lastMinimizedTime', currentTime.toString());
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
      handleAppClose();
    };
  }, []);

  useEffect(() => {
    const checkBiometricOnStartup = async () => {
      const lastMinimizedTime = await AsyncStorage.getItem('lastMinimizedTime');
      const currentTime = new Date().getTime();
      const isAuthenticatedJSON = await AsyncStorage.getItem('isAuthenticated');
      const isAuthenticated = isAuthenticatedJSON
        ? JSON.parse(isAuthenticatedJSON)
        : false;
      if (
        (lastMinimizedTime &&
          currentTime - parseInt(lastMinimizedTime) >= 30000) || // Check if 30 seconds have passed
        !isAuthenticated
      ) {
        dispatch(isBiometricUser(true));

        triggerBiometricLogin();
      }
    };

    checkBiometricOnStartup(); // Trigger biometric check when the app is opened
  }, []);

  const triggerBiometricLogin = async () => {
    await AsyncStorage.setItem('isAuthenticated', JSON.stringify(false));
    const userId = await AsyncStorage.getItem('user_id');
    const isLoggedInJSON = await AsyncStorage.getItem('isLoggedIn');
    const isLoggedIn = isLoggedInJSON ? JSON.parse(isLoggedInJSON) : false;
    const biometricEnabledJSON = await AsyncStorage.getItem('biometricEnabled');
    const biometricEnabled = biometricEnabledJSON
      ? JSON.parse(biometricEnabledJSON)
      : false;

    if (userId && isLoggedIn && biometricEnabled) {
      TouchID.authenticate(
        'Authenticate to access the app',
        optionalConfigObject,
      )
        .then(async (success: any) => {
          console.log('success biometric', success);
          console.log('Biometric authentication success');
          setIsModalVisible(false);
          await AsyncStorage.setItem('isAuthenticated', JSON.stringify(true));
          dispatch(isBiometricUser(false));
        })
        .catch(async (error: any) => {
          await AsyncStorage.removeItem('isAuthenticated');
          // await AsyncStorage.removeItem('isLoggedIn');
          dispatch(setUserData(''));
          console.log('Biometric authentication failed', error);
          setIsModalVisible(true);
        });
    } else {
      dispatch(isBiometricUser(false));
    }
  };

  const handleRetryAuthentication = () => {
    setIsModalVisible(false);
    dispatch(isBiometricUser(true));

    triggerBiometricLogin(); // Retry biometric authentication
  };

  useEffect(() => {
    const fetchUserData = async () => {
      // await AsyncStorage.setItem('isLoginFlow', 'true');

      try {
        const userId = await AsyncStorage.getItem('user_id');
        const value = await AsyncStorage.getItem('isLoggedIn');
        const isLoggedIn = value ? JSON.parse(value) : false;

        const getFcmToken = async () => {
          try {
            const token = await messaging().getToken();
            console.log('FCM Token:', token);
            return token; // Token ko return karna
          } catch (error) {
            console.log('Error retrieving FCM token:', error);
            return null; // Agar error ho toh null return karna
          }
        };

        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        let token: any = null;
        if (enabled) {
          token = await getFcmToken();
        }

        if (userId && isLoggedIn) {
          notificationListeners();
          getUserProfile(
            token,
            userId,
            () => setLoading(true),
            (successData: any) => {
              dispatch(setUserData(successData));
              setLoading(false);
            },
            (error: any) => {
              console.log('Error while fetching user:', error);
              setLoading(false);
            },
          );
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.log('Error retrieving user ID from AsyncStorage:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [dispatch]);

  const getPeriodData = async () => {
    try {
      const {data, error} = await supabase
        .from('tracker_logs')
        .select('*')
        .eq('user_id', userData.id);

      if (data) {
        console.log('~ data :', data);
        dispatch(setPeriodTracker(data as any[]));
      }
    } catch (error) {
      console.error('~ error fetching tracker logs:', error);
    }
  };

  useEffect(() => {
    getPeriodData();
  });

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size={30} color={themeColors.primary} />
      </View>
    );
  }

  return isBiometricUserAvailable ? (
    <NavigationContainer>
      <LoginScreen />
    </NavigationContainer>
  ) : userData?.id ? (
    <AppNavigation />
  ) : (
    <AuthStackNavigation />
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  message: {
    fontSize: size.md,
    fontFamily: fonts.OpenSansMedium,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default Route;
