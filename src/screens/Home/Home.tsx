import React, {useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {themeColors} from '../../theme/colors';
import {size} from '../../theme/fontStyle';
import SearchBar from '../../components/screens/Home/SearchBar';
import {useDispatch, useSelector} from 'react-redux';
import {user} from '../../store/selectors';
import Category from '../../components/screens/Home/Category';
import Advertisement from '../../components/screens/Home/Advertisement';
import TopRated from '../../components/screens/Home/TopRated';
import {fonts} from '../../theme/fonts';
import LocationLayout from '../../components/common/LocationLayout';
import {
  NavigationProp,
  useNavigation,
  useNavigationState,
} from '@react-navigation/native';
import {NavigationStackParams} from '../../interfaces';
import useLocation from '../../hooks/useLocation';
import {RootState} from '../../store';
import {fetchNearbyPlaces} from '../../store/slices/MarkersSlice';
import {API_KEY} from '../../../config/variables';

const HomeScreen = () => {
  const userData: any = useSelector(user);
  const {location} = useLocation();
  const dispatch = useDispatch();
  const {markers, loading, selectedDistance, selectedFilter} = useSelector(
    (state: RootState) => state.markers,
  );

  const filters: any = {
    Hospital: {type: 'hospital', keyword: ''},
    Herbal: {type: 'hospital', keyword: 'herbal'},
    Laboratory: {type: 'health', keyword: 'diagnostic, laboratory'},
    Ambulance: {type: 'hospital', keyword: 'ambulance'},
    Pharmacy: {type: 'pharmacy', keyword: ''},
    Wholesale: {type: 'pharmacy', keyword: 'wholesale'},
    'Display All': {
      keyword:
        'hospital, pharmacy, herbal, diagnostic, laboratory, ambulance, wholesale, health center, clinic, urgent care, medical center, healthcare, veterinary, dental, physical therapy, wellness, nutrition, rehabilitation',
    },
  };

  const navigation = useNavigation<NavigationProp<NavigationStackParams>>();

  useEffect(() => {
    if (location && !loading && markers?.length == 0) {
      dispatch(
        //@ts-ignore
        fetchNearbyPlaces({
          latitude: location.latitude,
          longitude: location.longitude,
          selectedDistance,
          API_KEY,
          filters,
        }),
      );
    }
  }, [location]);

  return (
    <LocationLayout>
      {/* <HeaderHome /> */}
      <View style={styles.container}>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.greeting}>
            Hi, {userData?.first_name} {userData?.last_name}
          </Text>
          {/* <Text style={styles.title}>How are you today?</Text> */}
          <SearchBar
            placeholder={'Search hospital, pharmacy, labs...'}
            showBtn
          />
          <Category />
          <Advertisement />
          <TopRated />
        </ScrollView>
      </View>
    </LocationLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.lightGray,
    paddingHorizontal: 20,
  },
  hello: {
    color: themeColors.black,
    fontSize: size.md,
    fontFamily: fonts.OpenSansRegular,
  },
  greeting: {
    color: themeColors.darkGray,
    fontSize: size.lg,
    fontFamily: fonts.OpenSansBold,
    textTransform: 'capitalize',
    textAlign: 'center',
    paddingTop: 20,
  },
  title: {
    color: themeColors.darkGray,
    fontSize: size.s,
    fontFamily: fonts.OpenSansRegular,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#f9c2ff',
  },
  errorText: {
    color: 'red',
    fontSize: size.md,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: size.md,
    color: 'gray',
    textAlign: 'center',
  },
});

export default HomeScreen;
