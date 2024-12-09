import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {themeColors} from '../../theme/colors';
import {Calendar} from 'react-native-calendars';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';

import {fonts} from '../../theme/fonts';
import {supabase} from '../../utils/supabaseClient';
import {useSelector} from 'react-redux';
import {user} from '../../store/selectors';
import {ActivityIndicator} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import moment from 'moment';

const DashboardCalenderView = ({route}: any) => {
  const setSeletedDate = route.params.setSelectedDate;
  const selectedDate = route.params.selectedDate;
  const setDates = route.params.setDates;
  console.log('setDatesadad :', setDates);
  const userData: any = useSelector(user);
  const [periodTrackerDataCalender, setPeriodTrackerDataCalender] =
    useState<any>([]);
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);

  const cycle_length = periodTrackerDataCalender[0]?.cycle_length;
  const period_length = periodTrackerDataCalender[0]?.period_length;

  const getPeriodData = async () => {
    setIsLoading(true);
    try {
      const {data, error} = await supabase
        .from('tracker_logs')
        .select('*')
        .eq('user_id', userData?.id);

      if (error) {
        console.error('Error fetching tracker logs:', error.message);
      } else {
        console.log('~ data :', data);
        setPeriodTrackerDataCalender(data);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  console.log(
    'periodTrackerDataCalender',
    JSON.stringify(periodTrackerDataCalender),
  );

  useEffect(() => {
    getPeriodData();
  }, []);
  function calculateOvulationAndFertileWindow(
    periodStartDate: any,
    cycleLength: any,
  ) {
    // if (cycleLength < 22 || cycleLength > 82) {
    //   throw new Error('Cycle length must be between 22 and 82 days.');
    // }

    const startDate = new Date(periodStartDate);
    const ovulationDay = -14;
    const ovulationDateLocal = new Date(startDate);
    ovulationDateLocal.setDate(startDate.getDate() + ovulationDay);
    const fertileStartDateLocal = new Date(ovulationDateLocal);
    fertileStartDateLocal.setDate(ovulationDateLocal.getDate() - 2);
    const fertileEndDateLocal = new Date(ovulationDateLocal);
    fertileEndDateLocal.setDate(ovulationDateLocal.getDate() + 2);
    const fertileWindowDates = [];
    const fertileWindowDatesUTC = [];
    const currentDateLocal = new Date(fertileStartDateLocal);

    while (currentDateLocal <= fertileEndDateLocal) {
      fertileWindowDates.push(currentDateLocal.toISOString().split('T')[0]);
      fertileWindowDatesUTC.push(
        new Date(currentDateLocal.toISOString()).toISOString().split('T')[0],
      );
      currentDateLocal.setDate(currentDateLocal.getDate() + 1);
    }

    return {
      ovulation_date: ovulationDateLocal.toISOString().split('T')[0],
      ovulation_date_utc: new Date(ovulationDateLocal.toISOString())
        .toISOString()
        .split('T')[0],
      fertile_window_dates: fertileWindowDates,
      fertile_window_dates_utc: fertileWindowDatesUTC,
    };
  }

  const markCycleDates = (periodTrackerData: any = []) => {
    const markedDates: any = {};
    if (!Array.isArray(periodTrackerData)) {
      console.error('Invalid data format. Expected an array.');
      return markedDates;
    }

    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    periodTrackerData.forEach((log: any = {}) => {
      const {
        period_start_date,
        period_length,
        flow_types = [],
        cycle_length,
        fertile_window_dates,
      } = log;

      if (!period_start_date || !flow_types.length) {
        console.warn('Skipping log due to missing data:', log);
        return;
      }

      const lastFlowDate = new Date(
        flow_types[flow_types.length - 1]?.date || period_start_date,
      );

      for (let cycle = 0; cycle < 24; cycle++) {
        const cycleStartDate = new Date(lastFlowDate.getTime());
        cycleStartDate.setDate(
          lastFlowDate.getDate() + cycle * (cycle_length + period_length),
        );
        console.log('cyclestartdatee', cycleStartDate);
        if (cycleStartDate > threeMonthsFromNow) break;

        flow_types.forEach((flow: any = {}) => {
          const flowDate = new Date(flow.date || period_start_date);
          const daysFromStart = Math.floor(
            (flowDate.getTime() - lastFlowDate.getTime()) /
              (1000 * 60 * 60 * 24),
          );

          const adjustedDate = new Date(cycleStartDate.getTime());
          adjustedDate.setDate(cycleStartDate.getDate() + daysFromStart);
          console.log('adjustDATE--', adjustedDate);
          const formattedDate = adjustedDate.toISOString().split('T')[0];
          console.log('formattedDateee :', formattedDate);
          if (adjustedDate > threeMonthsFromNow) return;

          const flowColors: any = {
            light: '#FFCCCC',
            medium: '#FF6666',
            heavy: '#FF3333',
            'super heavy': '#CC0000',
          };

          const selectedFlow = flow.selectedFlow || '';
          const color = flowColors[selectedFlow] || '#a8e6cf';

          markedDates[formattedDate] = {
            marked: true,
            customStyles: {
              container: {backgroundColor: color},
              text: {color: 'black'},
            },
          };
        });

        console.log('fertile_window_dates :', fertile_window_dates);
      }
    });

    return markedDates;
  };

  const addContinuousCycleDates = (
    markedDates: any,
    periodTrackerData: any,
  ) => {
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    periodTrackerData?.forEach((log: any) => {
      const {period_start_date, period_length, cycle_length} = log;

      if (period_start_date) {
        let startDate = new Date(period_start_date);

        for (let cycle = 1; cycle <= 24; cycle++) {
          const cycleStartDate = new Date(startDate.getTime());
          cycleStartDate.setDate(
            startDate.getDate() + cycle * (cycle_length + period_length),
          );

          const result = calculateOvulationAndFertileWindow(
            cycleStartDate.toISOString().split('T')[0],
            cycle_length,
          );
          console.log('result-calcluation-fertile_____', result);
          if (cycleStartDate > threeMonthsFromNow) break;

          result?.fertile_window_dates?.map(fertileDate => {
            if (!markedDates[fertileDate]) {
              markedDates[fertileDate] = {
                marked: true,
                customStyles: {
                  container: {
                    backgroundColor:
                      fertileDate == result?.ovulation_date
                        ? '#800080'
                        : '#D8BFD8',
                  },
                  text: {color: 'black'},
                },
              };
            }
          });

          for (let day = 0; day < period_length; day++) {
            const currentDay = new Date(cycleStartDate.getTime());
            currentDay.setDate(cycleStartDate.getDate() + day);

            if (currentDay > threeMonthsFromNow) break;

            const formattedDate = currentDay.toISOString().split('T')[0];

            if (!markedDates[formattedDate]) {
              markedDates[formattedDate] = {
                marked: true,
                customStyles: {
                  container: {backgroundColor: '#a8e6cf'},
                  text: {color: 'black'},
                },
              };
            }
          }
        }
      }
    });
    return markedDates;
  };

  const getMarkedDates = (periodTrackerData: any) => {
    let markedDates = markCycleDates(periodTrackerData);
    markedDates = addContinuousCycleDates(markedDates, periodTrackerData);
    return markedDates;
  };

  // const [selectedDate, setSelectedDate] = useState('');

  const handleDayPress = (day: any) => {
    const selectedDate = day.dateString;
    console.log('selectedDatehandlepress', selectedDate);
    const dates = [];
    for (let i = -3; i <= 3; i++) {
      dates.push(moment(selectedDate).add(i, 'days').format('YYYY-MM-DD'));
    }
    setDates(dates);
    setSeletedDate(selectedDate);
    console.log('dates-array', dates);
    navigation.navigate('DashboardPeriods');
  };

  return (
    <View style={styles.dashboardCalenderView}>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size={30} color={themeColors.primary} />
        </View>
      ) : (
        <>
          <Calendar
            markingType={'custom'}
            markedDates={{
              ...getMarkedDates(periodTrackerDataCalender),
              [selectedDate]: {
                selected: true,
                selectedColor: themeColors.primary,
              },
            }}
            onDayPress={handleDayPress}
            current={selectedDate}
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

          <View
            style={{
              width: horizontalScale(330),
              alignSelf: 'center',
              marginTop: verticalScale(40),
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              padding: 10,
              borderRadius: 20,
              paddingBottom: verticalScale(20),
            }}>
            <Text
              style={{
                fontSize: moderateScale(20),
                color: themeColors.darkGray,
                letterSpacing: 1,
              }}>
              About Your Cycle
            </Text>
            <View
              style={{
                // parent
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: verticalScale(10),
              }}>
              <View
                style={{
                  marginTop: verticalScale(10),
                  borderRadius: 20,
                  padding: 10,
                  backgroundColor: themeColors.white,
                  elevation: 3,
                  height: verticalScale(200),
                  width: horizontalScale(140),
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    fontSize: moderateScale(17),

                    color: themeColors.darkGray,
                    letterSpacing: 1,
                    paddingTop: verticalScale(20),
                  }}>
                  Average Cycle length
                </Text>
                <Text
                  style={{
                    fontSize: moderateScale(15),

                    color: themeColors.darkGray,
                    letterSpacing: 1,
                  }}>
                  {`${cycle_length} Days`}
                </Text>
              </View>

              <View
                style={{
                  marginTop: verticalScale(10),
                  borderRadius: 20,
                  padding: 10,
                  backgroundColor: themeColors.white,
                  elevation: 3,
                  height: verticalScale(200),
                  width: horizontalScale(140),
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    fontSize: moderateScale(17),
                    color: themeColors.darkGray,
                    letterSpacing: 1,
                    paddingTop: verticalScale(20),
                  }}>
                  Average Period length
                </Text>
                <Text
                  style={{
                    fontSize: moderateScale(15),
                    color: themeColors.darkGray,
                    letterSpacing: 1,
                  }}>
                  {`${period_length} Days`}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}

      {/* <Text
            style={{
              fontSize: moderateScale(16),
              color: themeColors.darkGray,
              letterSpacing: 1,
            }}>
            Cycle Length
          </Text>
          <Text
            style={{
              fontSize: moderateScale(16),
              color: themeColors.darkGray,
              letterSpacing: 1,
            }}>
            28 Days
          </Text> */}
    </View>
  );
};

export default DashboardCalenderView;

const styles = StyleSheet.create({
  dashboardCalenderView: {
    flex: 1,
    backgroundColor: themeColors.white,
  },
  calendar: {
    width: horizontalScale(340),
    borderRadius: 10,
    alignSelf: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
