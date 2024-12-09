import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Modal,
  Linking,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {themeColors} from '../theme/colors';
import {fonts} from '../theme/fonts';
import {size} from '../theme/fontStyle';
import {getFacilityDetailsById} from '../services/facility';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {parsePhoneNumbers} from '../utils/helpers';
import {Share} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {useToast} from 'react-native-toast-notifications';
import {AirbnbRating} from 'react-native-ratings';
import {SCREENS} from '../constants/screens';
import useLocation from '../hooks/useLocation';
import {API_KEY} from '../../config/variables';
import LocationLayout from '../components/common/LocationLayout';
import {checkFavoriteStatus, toggleFacilityFavorite} from '../services/profile';
import {useSelector} from 'react-redux';
import {user} from '../store/selectors';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const {width} = Dimensions.get('window');

type FacilityDetailsProps = {
  navigation?: NativeStackNavigationProp<any>;
  route?: {
    params: {
      id?: string;
      setFavorites: any;
      favorites: any;
    };
  };
};

const FacilityDetails: React.FC<FacilityDetailsProps> = ({
  navigation,
  route,
}) => {
  const userData: any = useSelector(user);
  const [isFavorited, setIsFavorited] = useState(false);
  const toast = useToast();
  const {location, locationError, retryLocation} = useLocation();
  const {id, setFavorites, favorites} = route?.params || {};
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [facilityDetails, setFacilityDetails] = useState<any>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'call' | 'whatsapp' | null>(
    null,
  );
  const [hasWhatsapp, setHasWhatsapp] = useState(false);
  const [facilityData, setFacilityData] = useState({
    id: '',
    address: '',
    avg_rating: 0,
    working_hours: {},
    reviews: [],
    phone_number: '',
    website: '',
    photos: [],
    location: {lat: 0, lng: 0},
    types: [],
  });
  const currentDay = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
  });
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [curFav, setCurFav] = useState<any>(null);

  const formatAddress = (addressComponents: any) => {
    return addressComponents
      .filter((component: any) => component.long_name)
      .map((component: any) => component.long_name)
      .join(', ');
  };

  // useEffect(() => {
  //   if (location?.latitude && facilityData?.location) {
  //     fetchDistanceAndDuration(
  //       {
  //         lat: location?.latitude || 0,
  //         lng: location?.longitude || 0,
  //       },
  //       facilityData?.location,
  //     );
  //   }
  // }, [location?.latitude, facilityData?.location]);

  const getCompletePlaceDetails = async (placeName: string) => {
    try {
      // Step 1: Search for the place to get its place_id
      const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
        placeName,
      )}&inputtype=textquery&fields=place_id&key=${API_KEY}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (searchData.status === 'OK' && searchData.candidates.length > 0) {
        const placeId = searchData.candidates[0].place_id;

        // Step 2: Use the place_id to get complete details
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_phone_number,geometry,opening_hours,website,address_component,photo,review,types&key=${API_KEY}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        if (detailsData.status === 'OK') {
          const result = detailsData.result;

          // Helper function to build photo URL
          const buildPhotoUrl = (photoReference: string) =>
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${API_KEY}`;

          setFacilityData({
            id: placeId,
            address: formatAddress(result.address_components),
            avg_rating: result.rating,
            working_hours: result.opening_hours
              ? result.opening_hours.weekday_text.reduce(
                  (acc: any, text: any) => {
                    const [day, hours] = text.split(': ');
                    acc[day] = hours;
                    return acc;
                  },
                  {},
                )
              : {},
            reviews: result.reviews
              ? result.reviews.map((review: any) => ({
                  authorName: review.author_name,
                  rating: review.rating,
                  comment: review.text,
                  timeAgo: review.relative_time_description,
                  profilePhotoUrl: review.profile_photo_url || '',
                }))
              : [],
            phone_number: result.formatted_phone_number || '',
            website: result.website || '',
            photos: result.photos
              ? result.photos.map((photo: any) =>
                  buildPhotoUrl(photo.photo_reference),
                )
              : [],
            location: result.geometry
              ? result.geometry.location
              : {lat: 0, lng: 0},
            types: result.types || [],
          });
          setLoading(false);
        } else {
          setLoading(false);
          console.log('Place details request failed:', detailsData.status);
          if (detailsData.error_message) {
            console.log('Error Message:', detailsData.error_message);
          }
        }
      } else {
        setLoading(false);
        console.log('Place search failed:', searchData.status);
        if (searchData.error_message) {
          console.log('Error Message:', searchData.error_message);
        }
      }
    } catch (error) {
      setLoading(false);
      console.log('Error fetching data:', error);
    }
  };

  const handleActionPress = (type: 'call' | 'whatsapp') => {
    setActionType(type);
    // setIsModalVisible(true);
  };

  const handleNumberSelect = (number: string) => {
    setSelectedNumber(number);
    setIsModalVisible(false);

    if (actionType === 'call') {
      const phoneNumber = `tel:${number}`;
      Linking.canOpenURL(phoneNumber)
        .then(supported => {
          if (!supported) {
            console.log('Phone call not supported on this device');
          } else {
            return Linking.openURL(phoneNumber);
          }
        })
        .catch(err =>
          console.log('An error occurred while trying to make a call:', err),
        );
    } else if (actionType === 'whatsapp') {
      let formattedNumber = number.replace(/[-\s]/g, ''); // Remove any dashes or spaces
      // if (!formattedNumber.startsWith('+')) {
      //   formattedNumber = `+233${formattedNumber.slice(-9)}`; // Assuming Ghana country code, adjust as necessary
      // }
      const url = `whatsapp://send?phone=${formattedNumber}`;
      Linking.canOpenURL(url)
        .then(supported => {
          if (!supported) {
            console.log("WhatsApp is not installed or can't open URL");
          } else {
            return Linking.openURL(url);
          }
        })
        .catch(err =>
          console.log('An error occurred while trying to open WhatsApp:', err),
        );
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this facility: ${
          facilityDetails?.facility_name
        }\n\nAddress: ${
          facilityData?.address || facilityDetails?.location
        }\n\nVisit us for more info!`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type: ' + result.activityType);
        } else {
          console.log('Shared');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Dismissed');
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  useEffect(() => {
    if (id) {
      getFacilityDetailsById(
        id,
        () => setLoading(true),
        (successData: any) => {
          setFacilityDetails(successData);
          // getCompletePlaceDetails(successData.facility_name);
          setHasWhatsapp(!!successData.whatsapp);
          if (!successData.whatsapp) {
            setActionType('call');
          }
          setLoading(false);
        },
        (error: any) => {
          console.log('Error while fetching facility details', error);
          setLoading(false);
        },
      );
      checkFavoriteStatus(
        userData?.id,
        id as string,
        () => {},
        (successData: any) => {
          setIsFavorited(successData.length > 0);
        },
        (error: any) => {
          console.error('Error fetching favorite status:', error);
        },
      );
      if (favorites) {
        const currentFavorite = favorites?.find(
          (f: any) => f?.facility_id == id,
        );
        if (currentFavorite) {
          setCurFav(currentFavorite);
        } else {
          setCurFav(null);
        }
      }
    }
  }, [id]);

  const handleCopyNumber = (number: string) => {
    Clipboard.setString(number);
    setIsModalVisible(false);
    toast.show('Number copied to clipboard', {
      type: 'success',
      placement: 'top',
      duration: 4000,
      animationType: 'slide-in',
    });
  };

  const images = [
    require('../../assets/healthCareCenter.jpeg'),
    require('../../assets/healthCareCenter.jpeg'),
    require('../../assets/healthCareCenter.jpeg'),
    require('../../assets/healthCareCenter.jpeg'),
  ];

  const handleSnap = (index: number) => {
    setCurrentIndex(index);
  };

  const fetchDistanceAndDuration = async (
    origin: {lat: number; lng: number},
    destination: {lat: number; lng: number},
  ) => {
    try {
      const distanceMatrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${API_KEY}`;
      const response = await fetch(distanceMatrixUrl);
      const data = await response.json();

      if (data.status === 'OK') {
        const element = data.rows[0].elements[0];
        if (element.status === 'OK') {
          setDistance(element.distance.text);
          setDuration(element.duration.text);
        } else {
          console.log('Distance Matrix API response status: 1', element.status);
        }
      } else {
        console.log('Distance Matrix API response status: 2', data.status);
      }
    } catch (error) {
      console.log('Error fetching distance and duration:', error);
    }
  };

  const handleToggleFacilityFavorite = () => {
    setIsFavorited(!isFavorited);
    if (setFavorites && isFavorited) {
      setFavorites((prev: any) => {
        return prev?.filter((facility: any) => facility?.facility_id !== id);
      });
    } else if (setFavorites && !isFavorited && curFav) {
      setFavorites((prev: any) => {
        return [{...curFav}, ...prev];
      });
    }
    toggleFacilityFavorite(
      userData?.id,
      id as string,
      () => {},
      (successData: any) => {
        console.log('response', successData);
      },
      (error: any) => {
        console.log('Error', error);
      },
    );
  };

  return (
    <LocationLayout>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color={themeColors.primary} size={'large'} />
          </View>
        ) : !facilityDetails ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No record found</Text>
          </View>
        ) : (
          <>
            <ScrollView
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}>
              <View style={styles.carouselContainer}>
                <Carousel
                  loop
                  autoPlay
                  width={width}
                  height={width * 0.6}
                  data={
                    facilityData?.photos?.length > 0
                      ? facilityData?.photos
                      : images
                  }
                  renderItem={({item}) => (
                    <Image
                      source={
                        //@ts-ignore
                        facilityData?.photos?.length > 0 ? {uri: item} : item // Adjust this line if `item` is not a URI
                      }
                      style={styles.image}
                    />
                  )}
                  onSnapToItem={handleSnap}
                />
                <TouchableOpacity style={styles.ratingIcon}>
                  <Text
                    style={{
                      marginRight: 5,
                      fontFamily: fonts.OpenSansBold,
                      fontSize: size.sl,
                    }}>
                    {facilityDetails?.rating || 'N/A'}
                  </Text>
                  <AirbnbRating
                    isDisabled
                    count={5}
                    defaultRating={facilityDetails?.rating || 0}
                    size={12}
                    showRating={false}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.favoritesIcon}
                  onPress={handleToggleFacilityFavorite}>
                  <MaterialIcon
                    name={isFavorited ? 'heart' : 'heart-outline'}
                    size={20}
                    color={themeColors.primary}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.paginationContainer}>
                {facilityData?.photos?.length
                  ? facilityData?.photos?.map((_, index: number) => (
                      <View
                        key={index}
                        style={[
                          styles.dot,
                          {
                            backgroundColor:
                              index === currentIndex
                                ? themeColors.primary
                                : themeColors.white,
                          },
                        ]}
                      />
                    ))
                  : images.map((_, index: number) => (
                      <View
                        key={index}
                        style={[
                          styles.dot,
                          {
                            backgroundColor:
                              index === currentIndex
                                ? themeColors.primary
                                : themeColors.white,
                          },
                        ]}
                      />
                    ))}
              </View>
              <View style={styles.facilityInfoContainer}>
                <Text style={styles.facilityName}>
                  {facilityDetails.facility_name}{' '}
                  {facilityDetails?.ownership
                    ? `(${facilityDetails?.ownership})`
                    : ''}
                </Text>
                <Text style={styles.nhisAccredited}>
                  <Text style={{fontFamily: fonts.OpenSansBold}}>
                    NHIS Accredited:
                  </Text>{' '}
                  {facilityDetails?.nhis_accredited || 'N/A'}
                </Text>
                <View style={styles.addressContainer}>
                  {/* <Icon
                  name="map-marker-alt"
                  size={15}
                  color={themeColors.primary}
                /> */}
                  <Text style={styles.facilityAddress}>
                    <Text style={{fontFamily: fonts.OpenSansBold}}>
                      Address:
                    </Text>{' '}
                    {facilityData?.address || facilityDetails?.location}
                  </Text>
                </View>
                <View style={styles.containerDistance}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Icon name="road" size={20} color={themeColors.primary} />
                      <Text style={styles.infoText}>
                        {distance ? ` ${distance},` : 'N/A,'}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Icon name="car" size={20} color={themeColors.primary} />
                      <Text style={styles.infoText}>
                        {duration ? ` ${duration}` : 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Services</Text>
                <Text style={styles.sectionContent}>
                  {facilityDetails?.services || 'N/A'}
                </Text>
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Facilities</Text>
                <Text style={styles.sectionContent}>
                  {facilityDetails?.specialist || 'N/A'}
                </Text>
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Working Hours</Text>
                {Object?.entries(facilityData?.working_hours)?.length ? (
                  Object?.entries(facilityData?.working_hours)?.map(
                    ([day, hours]: any) => (
                      <Text
                        key={day}
                        style={[
                          styles.sectionContent,
                          day === currentDay
                            ? {fontFamily: fonts.OpenSansBold}
                            : null,
                        ]}>
                        {day}: {hours}
                      </Text>
                    ),
                  )
                ) : (
                  <Text style={styles.sectionContent}>N/A</Text>
                )}
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Reviews</Text>
                {facilityData?.reviews?.length ? (
                  facilityData?.reviews?.map((review: any, index) => (
                    <View key={index} style={styles.reviewContainer}>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Image
                          source={{uri: review?.profilePhotoUrl}}
                          width={30}
                          height={30}
                          style={{marginRight: 5}}
                        />
                        <View style={{alignItems: 'flex-start'}}>
                          <Text style={styles.sectionContent}>
                            {review?.authorName}
                          </Text>
                          <AirbnbRating
                            isDisabled
                            count={5}
                            defaultRating={review?.rating || 0}
                            size={10}
                            showRating={false}
                          />
                        </View>
                      </View>
                      <Text
                        style={[styles.sectionContent, {marginVertical: 5}]}>
                        {review?.comment}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.sectionContent}>N/A</Text>
                )}
              </View>
              {/* <View style={styles.section}>
              <Text style={styles.sectionTitle}>Comments</Text>
              <Text style={styles.sectionContent}>
                {facilityDetails?.comments || 'N/A'}
              </Text>
            </View> */}
              <Modal
                transparent={true}
                visible={isModalVisible}
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContainer}>
                    {!actionType ? (
                      <View style={{alignItems: 'center'}}>
                        <TouchableOpacity
                          style={[styles.button, {marginVertical: 15}]}
                          onPress={() => handleActionPress('call')}>
                          <Icon
                            name="phone-alt"
                            size={20}
                            color={themeColors.primary}
                          />
                          <Text
                            style={[
                              styles.buttonText,
                              {color: themeColors.primary},
                            ]}>
                            Call
                          </Text>
                        </TouchableOpacity>
                        {hasWhatsapp && (
                          <TouchableOpacity
                            style={[styles.button, {marginVertical: 15}]}
                            onPress={() => handleActionPress('whatsapp')}>
                            <Icon
                              name="whatsapp"
                              size={20}
                              color={themeColors.primary}
                            />
                            <Text
                              style={[
                                styles.buttonText,
                                {color: themeColors.primary},
                              ]}>
                              WhatsApp
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ) : (
                      <>
                        <Text style={styles.modalTitle}>
                          {actionType === 'call'
                            ? 'Select a Number to Call'
                            : 'Select a Number for WhatsApp'}
                        </Text>
                        {parsePhoneNumbers(facilityDetails?.tel)?.map(
                          (number: string, index: number) => (
                            <View key={index} style={styles.modalItemContainer}>
                              <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => handleNumberSelect(number)}>
                                <Text style={styles.modalItemText}>
                                  {number}
                                </Text>
                              </TouchableOpacity>
                              {/* <TouchableOpacity
                              style={styles.copyButton}
                              onPress={() => handleCopyNumber(number)}>
                              <Icon
                                name="copy"
                                size={20}
                                color={themeColors.primary}
                              />
                            </TouchableOpacity> */}
                            </View>
                          ),
                        )}
                      </>
                    )}
                    <TouchableOpacity
                      style={styles.modalCancel}
                      onPress={() => {
                        setIsModalVisible(false);
                        if (hasWhatsapp) {
                          setActionType(null);
                        }
                      }}>
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </ScrollView>
            <View style={styles.fixedButtonsContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setIsModalVisible(true)}>
                <Icon name="phone-alt" size={20} color={themeColors.white} />
                <Text style={styles.buttonText}>Contact</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!distance}
                style={styles.button}
                onPress={() => {
                  navigation?.navigate(SCREENS.DIRECTION, {
                    destination: {
                      latitude: facilityData?.location?.lat,
                      longitude: facilityData?.location?.lng,
                    },
                  });
                }}>
                <Icon
                  name="map-marker-alt"
                  size={20}
                  color={themeColors.white}
                />
                <Text style={styles.buttonText}>
                  Direction {distance ? '' : '(N/A)'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleShare}>
                <Icon name="share-alt" size={20} color={themeColors.white} />
                <Text style={styles.buttonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </LocationLayout>
  );
};

export default FacilityDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.lightGray,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: size.lg,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.darkGray,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  carouselContainer: {
    position: 'relative',
    width,
    height: width * 0.6,
  },
  image: {
    width,
    height: width * 0.6,
    resizeMode: 'cover',
  },
  ratingIcon: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: themeColors.white,
    padding: 8,
    borderRadius: 20,
    elevation: 3,
  },
  favoritesIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: themeColors.white,
    padding: 8,
    borderRadius: 20,
    elevation: 3,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  facilityInfoContainer: {
    backgroundColor: themeColors.white,
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 8,
    elevation: 3,
  },
  facilityName: {
    fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
    color: themeColors.darkGray,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 5,
  },
  facilityAddress: {
    fontSize: size.sl,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.darkGray,
    // marginLeft: 5,
  },
  nhisAccredited: {
    fontSize: size.sl,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.darkGray,
  },
  section: {
    margin: 15,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.white,
    paddingBottom: 15,
  },
  sectionTitle: {
    marginBottom: 10,
    fontSize: size.md,
    color: themeColors.darkGray,
    fontFamily: fonts.OpenSansBold,
    textTransform: 'uppercase',
  },
  sectionContent: {
    fontFamily: fonts.OpenSansRegular,
    fontSize: size.sl,
    color: themeColors.darkGray,
  },
  reviewContainer: {
    paddingVertical: 15,
  },
  fixedButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: themeColors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: themeColors.white,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    marginLeft: 5,
    color: themeColors.white,
    fontFamily: fonts.OpenSansMedium,
    fontSize: size.md,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: themeColors.white,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: size.lg,
    fontFamily: fonts.OpenSansBold,
    color: themeColors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 10,
  },
  modalItemText: {
    fontSize: size.md,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.darkGray,
    textAlign: 'center',
  },
  modalCancel: {
    paddingVertical: 10,
    marginTop: 10,
  },
  modalCancelText: {
    fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
    color: themeColors.white,
    textAlign: 'center',
    backgroundColor: themeColors.primary,
    padding: 5,
    borderRadius: 10,
  },
  modalItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.lightGray,
    justifyContent: 'center',
  },
  copyButton: {
    marginLeft: 10,
    padding: 5,
    borderRadius: 5,
    // backgroundColor: themeColors.lightGray,
  },
  containerDistance: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  infoText: {
    marginLeft: 5,
    fontSize: size.sl,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.darkGray,
  },
});
