import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {fonts} from '../../theme/fonts';
import {themeColors} from '../../theme/colors';
import {Calendar} from 'react-native-calendars';
import moment, {Moment} from 'moment';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {PeriodTrackerData} from '../../interfaces';
import {trackLengthCycle, trackLengthPeriods} from '../../constants';

type PeriodsTrackerStackParamList = {
  TrackYourCyclePatterns: {
    trackLengthCycle: number;
    trackLengthPeriods: number;
    period_consistent_text: string;
    your_goal: string;
    user_age: number;
    periodTrackerData: PeriodTrackerData[];
  };
};

type TrackYourCyclePatternsRouteProp = RouteProp<
  PeriodsTrackerStackParamList,
  'TrackYourCyclePatterns'
>;

interface TrackYourCyclePatternsProps {
  route: TrackYourCyclePatternsRouteProp;
}

const SelectDateOfPeriod = ({route}: TrackYourCyclePatternsProps) => {
  // navigation_____
  const navigation = useNavigation<any>();
  const track_length_periods = route?.params?.trackLengthPeriods;
  const track_length_cycle = route?.params?.trackLengthCycle;

  const {periodTrackerData} = route?.params;

  // const period_length = periodTrackerData
  //   ? periodTrackerData[0]?.period_length
  //   : track_length_periods;

  // const cycle_length = periodTrackerData
  //   ? periodTrackerData[0]?.cycle_length
  //   : track_length_cycle;

  console.log('periodTracker-data', periodTrackerData);

  // console.log('route.params', route.params);
  // console.log('periodLengths', period_length);
  // console.log('route.params.trackLengthCycle', route.params.trackLengthCycle);
  // console.log('route.params.trackLengthPeriods', period_length);
  console.log('route-track_length_cycle', track_length_cycle);
  console.log('track_length_periodsas', track_length_periods);

  // marked dates_____
  const [markedDates, setMarkedDates] = useState<{
    [key: string]: {selected: boolean; marked: boolean; color: string};
  }>({});

  // Calculate and mark initial period dates
  const calculateInitialMarkedDates = (startDate: Moment) => {
    const newMarkedDates: {
      [key: string]: {selected: boolean; marked: boolean; color: string};
    } = {};

    for (let i = 0; i < track_length_periods; i++) {
      const date = startDate.clone().add(i, 'days').format('YYYY-MM-DD');
      newMarkedDates[date] = {
        selected: true,
        marked: true,
        color: themeColors.darkBlue,
      };
    }
    setMarkedDates(newMarkedDates);
  };

  console.log('~ marked_dates_____ :', markedDates);
  const onDayPress = (day: {dateString: string}) => {
    const startDate = moment(day.dateString);
    const newMarkedDates: {
      [key: string]: {
        selected: boolean;
        marked: boolean;
        color: string;
      };
    } = {};

    for (let i = 0; i < track_length_periods; i++) {
      const date = startDate.clone().add(i, 'days').format('YYYY-MM-DD');
      newMarkedDates[date] = {
        selected: true,
        marked: true,
        color: themeColors.darkBlue,
      };
    }
    setMarkedDates(newMarkedDates);
  };

  useEffect(() => {
    const today = moment();
    calculateInitialMarkedDates(today);
  }, []);

  return (
    // container______
    <View style={styles.date_of_period_container}>
      {/* select_start_date_____ */}
      <Text style={styles.selectdate_of_period}>
        select the start date of your period.
      </Text>

      {/* date_picker */}

      <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        theme={{
          selectedDayBackgroundColor: themeColors.red,
          todayTextColor: themeColors.primary,
          arrowColor: themeColors.red,
          monthTextColor: themeColors.red,
          textDayFontFamily: fonts.OpenSansRegular,
          textMonthFontFamily: fonts.OpenSansRegular,
          textDayHeaderFontFamily: fonts.OpenSansRegular,
          textDayFontSize: moderateScale(14),
        }}
        style={styles.calendar}
      />

      {/* button_not sure_and confirm */}

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingTop: verticalScale(120),
        }}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('YourPeriodFlow', {
              markedDates: markedDates,
              periodTrackerData: periodTrackerData,
              period_consistent_text: route.params.period_consistent_text,
              trackLengthCycle: track_length_cycle,
              trackLengthPeriods: track_length_periods,
              your_goal: route.params.your_goal,
              user_age: route.params.user_age,
            })
          }
          activeOpacity={0.7}
          style={[styles.buttons_trackCycle]}>
          <Text style={styles.button_text}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SelectDateOfPeriod;

const styles = StyleSheet.create({
  date_of_period_container: {
    flex: 1,
  },
  selectdate_of_period: {
    fontSize: moderateScale(18),
    fontFamily: fonts.OpenSansBold,
    color: themeColors.black,
    paddingHorizontal: horizontalScale(22),
    paddingTop: verticalScale(22),
  },
  calendar: {
    width: horizontalScale(340),
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: verticalScale(120),
  },
  buttons_trackCycle: {
    backgroundColor: themeColors.primary,
    borderRadius: 10,
    width: horizontalScale(330),
    alignSelf: 'center',
    paddingVertical: verticalScale(14),
  },
  button_text: {
    textAlign: 'center',
    fontSize: moderateScale(14),
    color: themeColors.white,
    alignSelf: 'center',
    fontFamily: fonts.OpenSansMedium,
  },
});
