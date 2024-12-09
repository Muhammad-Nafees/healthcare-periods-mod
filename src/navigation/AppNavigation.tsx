import React, {useEffect, useState} from 'react';
import {
  NavigationContainer,
  NavigationProp,
  ParamListBase,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import BottomTabNavigation from './BottomTabNavigation';

import Categories from '../screens/Home/Categories';
import TopRated from '../screens/Home/TopRated';
import FacilityDetails from '../../src/screens/FacilityDetails';
import DirectionScreen from '../../src/screens/Direction';
import Diseases from '../../src/screens/Diseases';
import Symptoms from '../../src/screens/Symptoms';
import AddMedication from '../screens/pillreminder/AddMedication';
import MedicationTimeSlots from '../../src/screens/MedicationTimeSlots';
import DiseasesList from '../../src/screens/DiseasesList';
import DiseaseDetails from '../../src/screens/DiseaseDetails';
import SymptomsList from '../../src/screens/SymptomsList';
import SymptomDetails from '../../src/screens/SymptomDetails';
import SearchResults from '../../src/screens/SearchResults';
import ChangePassword from '../screens/authStack/forgetScreens/ChangePassword';
import Profile from '../screens/profile/Profile';
import {Dispatch, UnknownAction} from '@reduxjs/toolkit';
import ChangePasswordScreen from '../screens/authStack/forgetScreens/ChangePassword';
import {StyleSheet} from 'react-native';
import EditMedications from '../screens/pillreminder/EditMedications';
import EditUserMedicationInfo from '../screens/pillreminder/EditUserMedicationInfo';
import PeriodConsentAndPolicies from '../screens/periodsTrackerScreens/PeriodConsentAndPolicies';
import SetYourHealthGoal from '../screens/periodsTrackerScreens/SetYourHealthGoal';
import TrackLengthCycle from '../screens/periodsTrackerScreens/TrackLengthCycle';
import TrackLengthPeriods from '../screens/periodsTrackerScreens/TrackLengthPeriods';
import TrackYourCyclePatterns from '../screens/periodsTrackerScreens/TrackYourCyclePatterns';
import SelectDateOfPeriod from '../screens/periodsTrackerScreens/SelectDateOfPeriod';
import YourPeriodFlow from '../screens/periodsTrackerScreens/YourPeriodFlow';
import TrackPeriod from '../screens/periodsTrackerScreens/TrackPeriod';
import DashboardPeriods from '../screens/periodsTrackerScreens/DashboardPeriods';
import {useDispatch, useSelector} from 'react-redux';
import {user} from '../store/selectors';
import {supabase} from '../utils/supabaseClient';
import {setPeriodTracker} from '../store/slices/periodTracker';
import TrackAge from '../screens/periodsTrackerScreens/TrackAge';
import DashboardCalenderView from '../screens/periodsTrackerScreens/DashboardCalenderView';
import Notifications from '../screens/Notifications';

const Stack = createNativeStackNavigator<any>();

const AppNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          animation: 'slide_from_right',
        }}
        initialRouteName={'Home'}>
        <Stack.Screen
          name={'BottomNavigation'}
          component={BottomTabNavigation}
          options={{headerShown: false}}
        />

        <Stack.Screen
          options={{
            // headerShown: false,
            title: 'Quick Add',
          }}
          name={'AddMedication'}
          component={AddMedication}
        />

        <Stack.Screen
          options={{
            // headerShown: false,
            title: 'Quick Add',
          }}
          name={'AddMedicationContinue'}
          component={MedicationTimeSlots}
        />

        <Stack.Screen
          name={'ChangePassword'}
          component={ChangePasswordScreen}
        />
        <Stack.Screen name={'Categories'} component={Categories} />
        <Stack.Screen name={'Diseases'} component={Diseases} />
        <Stack.Screen name={'DiseasesList'} component={DiseasesList} />
        <Stack.Screen name={'DiseasesDetails'} component={DiseaseDetails} />
        <Stack.Screen name={'Notifications'} component={Notifications} />
        <Stack.Screen
          options={{
            headerShown: false,
          }}
          name={'PeriodsTracker'}
          component={PeriodsTrackerNavigationStack}
        />

        <Stack.Screen name={'Symptoms'} component={Symptoms} />
        <Stack.Screen name={'SymptomsList'} component={SymptomsList} />
        <Stack.Screen name={'SymptomsDetails'} component={SymptomDetails} />
        <Stack.Screen name={'SearchResult'} component={SearchResults} />
        <Stack.Screen name={'TopRated'} component={TopRated} />
        <Stack.Screen name={'FacilityDetails'} component={FacilityDetails} />
        <Stack.Screen name={'Direction'} component={DirectionScreen} />
        <Stack.Screen name={'Profile'} component={Profile} />
        <Stack.Screen name={'EditMedication'} component={EditMedications} />
        <Stack.Screen
          name={'EditUserMedicationInfo'}
          component={EditUserMedicationInfo}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const PeriodsTrackerNavigationStack = () => {
  const {periodTrackerData} = useSelector((state: any) => state.PeriodTracker);
  const Stack = createNativeStackNavigator();

  return (
    <>
      <Stack.Navigator
        initialRouteName={
          periodTrackerData && periodTrackerData.length > 0
            ? 'DashboardPeriods'
            : 'PeriodConsentAndPolicies'
        }
        screenOptions={{
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}>
        {periodTrackerData && periodTrackerData.length > 0 ? (
          <>
            <Stack.Screen
              options={{
                title: 'Period & Ovulation',
              }}
              name={'DashboardPeriods'}
              component={DashboardPeriods}
            />
            <Stack.Screen
              options={{
                title: 'Calender View',
              }}
              name={'DashboardCalenderView'}
              component={DashboardCalenderView}
            />
          </>
        ) : (
          <Stack.Screen
            name={'PeriodConsentAndPolicies'}
            component={PeriodConsentAndPolicies}
          />
        )}

        <Stack.Screen
          options={{
            title: 'Set Your Health Goal',
          }}
          name={'SetYourHealthGoal'}
          component={SetYourHealthGoal}
        />

        <Stack.Screen
          options={{
            title: 'Track Age',
          }}
          name={'TrackAge'}
          component={TrackAge}
        />

        <Stack.Screen
          options={{
            title: 'Track Length Cycle',
          }}
          name={'TrackLengthCycle'}
          component={TrackLengthCycle}
        />

        <Stack.Screen
          options={{
            title: 'Track Length Periods',
          }}
          name={'TrackLengthPeriods'}
          component={TrackLengthPeriods}
        />

        <Stack.Screen
          options={{
            title: 'Track Your Cycle Pattern',
          }}
          name={'TrackYourCyclePatterns'}
          component={TrackYourCyclePatterns}
        />

        <Stack.Screen
          options={{
            title: 'Select Date Of Period',
          }}
          name={'SelectDateOfPeriod'}
          component={SelectDateOfPeriod}
        />

        <Stack.Screen
          options={{
            title: 'Your Period Flow',
          }}
          name={'YourPeriodFlow'}
          component={YourPeriodFlow}
        />

        <Stack.Screen
          options={{
            title: 'Track Period',
          }}
          name={'TrackPeriod'}
          component={TrackPeriod}
        />
      </Stack.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigation;
