import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import {themeColors} from '../../theme/colors';
import {size} from '../../theme/fontStyle';
import {fonts} from '../../theme/fonts';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {API_KEY} from '../../../config/variables';
import useLocation from '../../hooks/useLocation';
import LocationLayout from '../../components/common/LocationLayout';
import MapView, {Marker} from 'react-native-maps';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {Picker} from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../store';
import {
  fetchNearbyPlaces,
  filterMarkers,
  setSelectedDistance,
  setSelectedFilter,
} from '../../store/slices/MarkersSlice';

type TopRatedProps = {
  navigation?: NativeStackNavigationProp<any>;
};

const TopRated: React.FC<TopRatedProps> = ({navigation}) => {
  const {location} = useLocation();
  const [searchText, setSearchText] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch();
  const {markers, loading, selectedDistance, selectedFilter} = useSelector(
    (state: RootState) => state.markers,
  );
  const [isEnabled, setIsEnabled] = useState(false);

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

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  const fetchAutocompleteSuggestions = async (query: any) => {
    if (query.length === 0) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=${API_KEY}`,
      );
      const data = await response.json();
      if (response.ok) {
        setSuggestions(data.predictions);
      } else {
        console.error('Error fetching autocomplete suggestions:', data.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchLocationName = async (latitude: any, longitude: any) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`,
      );
      const data = await response.json();

      if (response.ok) {
        const locationName =
          data?.plus_code?.compound_code || 'Unknown Location';
        setCurrentLocation(locationName);
        setSearchText(locationName);
      } else {
        console.error('Error fetching location:', data.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const onFilterPress = (filter: any) => {
    dispatch(setSelectedFilter(filter));
  };

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

  useEffect(() => {
    if (location && !loading) {
      //@ts-ignore
      dispatch(
        //@ts-ignore
        fetchNearbyPlaces({
          latitude: location.latitude,
          longitude: location.longitude,
          selectedDistance,
          API_KEY,
          filters,
        }),
      ).then(() => {
        dispatch(filterMarkers(selectedFilter)); // Apply the filter after fetching places
      });
    }
  }, [selectedDistance]);

  useEffect(() => {
    if (location && !loading) {
      dispatch(filterMarkers(selectedFilter));
    }
  }, [selectedFilter]);

  useEffect(() => {
    if (location) {
      fetchLocationName(location?.latitude, location?.longitude);
    }
  }, [location]);

  const fetchPlaceDetails = async (placeId: any) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`,
      );
      const data = await response.json();
      if (response.ok) {
        const {lat, lng} = data.result.geometry.location;
        setSelectedLocation({latitude: lat, longitude: lng});
      } else {
        console.error('Error fetching place details:', data.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const mapRef = useRef<any>(null);
  const handleCurrentLocationPress = () => {
    if (location) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  const handleSelectSuggestion = (placeId: any, description: any) => {
    setSearchText(description);
    fetchPlaceDetails(placeId);
    setSuggestions([]);
  };

  const handleSearch = () => {
    setSuggestions([]);
  };

  return (
    <LocationLayout>
      <Modal visible={loading} transparent={true} animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={styles.loadingText}>Fetching Nearby Places...</Text>
        </View>
      </Modal>
      <View style={styles.mapContainer}>
        {location && (
          <MapView
            customMapStyle={[
              {
                featureType: 'poi',
                stylers: [{visibility: isEnabled ? 'on' : 'off'}],
              },
            ]}
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude:
                selectedLocation?.latitude || location?.latitude || 37.78825,
              longitude:
                selectedLocation?.longitude || location?.longitude || -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            zoomEnabled={true}
            scrollEnabled={true}
            // showsUserLocation={true}
            zoomControlEnabled={true}
            showsCompass={false}>
            {/* <Marker coordinate={location} title={'Your Location'} /> */}
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                title="Searched Location"
                pinColor={themeColors.primary}
              />
            )}
            {currentLocation && (
              <Marker
                coordinate={location}
                title="Current Location"
                pinColor={'#5990FA'}
              />
            )}
            {markers.map((marker: any, index: number) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: marker.geometry.location.lat,
                  longitude: marker.geometry.location.lng,
                }}
                title={marker.name}
              />
            ))}
          </MapView>
        )}
        <View style={styles.mapFilterContainer}>
          <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
            <View style={{flex: 1}}>
              <TextInput
                style={styles.searchBox}
                placeholder="Search Location..."
                value={searchText}
                onChangeText={text => {
                  if (!text) {
                    setSelectedLocation(null);
                  }
                  setSearchText(text);
                  fetchAutocompleteSuggestions(text);
                }}
                onSubmitEditing={handleSearch}
              />
              {searchText && (
                <EntypoIcon
                  name={'cross'}
                  size={20}
                  color={themeColors.primary}
                  style={{position: 'absolute', right: 15, top: 8}}
                  onPress={() => {
                    setSearchText('');
                    setSelectedLocation(null);
                  }}
                />
              )}
              {suggestions.length > 0 && (
                <FlatList
                  data={suggestions}
                  keyExtractor={(item: any) => item.place_id}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      onPress={() =>
                        handleSelectSuggestion(item.place_id, item.description)
                      }>
                      <Text style={styles.suggestionText}>
                        {item.description}
                      </Text>
                    </TouchableOpacity>
                  )}
                  style={styles.suggestionList}
                />
              )}
            </View>
            <View style={styles.categoryContainer}>
              {[
                'Display All',
                'Hospital',
                'Pharmacy',
                'Laboratory',
                'Herbal',
                'Ambulance',
                'Wholesale',
              ].map((filter, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor:
                        selectedFilter != filter
                          ? 'rgba(246, 127, 48, 0.7)'
                          : 'rgba(71, 190, 125, 0.6)',
                      marginTop: index == 0 ? 0 : 4,
                    },
                  ]}
                  onPress={() => onFilterPress(filter)}>
                  <Text
                    style={{
                      fontFamily: fonts.OpenSansBold,
                      color: themeColors.white,
                      fontSize: size.s,
                    }}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
              <View>
                <TouchableOpacity
                  style={styles.filterContainer}
                  onPress={() => {
                    setModalVisible(true);
                  }}>
                  <Icon
                    name={'filter'}
                    size={12}
                    color={themeColors.darkPink}
                    style={styles.icon}
                  />
                  <Text style={styles.filter}>Filter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        {/* <View style={styles.categoryContainer}>
          {[
            'Display All',
            'Hospital',
            'Herbal',
            'Labs',
            'Ambulance',
            'Pharmacy',
            'Wholesale',
          ].map((filter, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                {
                  backgroundColor:
                    selectedFilter != filter
                      ? 'rgba(255, 165, 0, 0.7)'
                      : 'rgba(71, 190, 125, 0.6)',
                },
              ]}
              onPress={() => onFilterPress(filter)}>
              <Text
                style={{
                  fontFamily: fonts.OpenSansBold,
                  color: themeColors.white,
                  fontSize: size.s,
                }}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
          <View>
            <TouchableOpacity
              style={styles.filterContainer}
              onPress={() => {
                setModalVisible(true);
              }}>
              <Icon
                name={'filter'}
                size={12}
                color={themeColors.darkPink}
                style={styles.icon}
              />
              <Text style={styles.filter}>Filter</Text>
            </TouchableOpacity>
          </View>
        </View> */}
        <TouchableOpacity
          style={styles.compassButton}
          onPress={handleCurrentLocationPress}>
          <MaterialIcon
            name="my-location"
            size={22}
            color={themeColors.black}
          />
        </TouchableOpacity>
        <View style={[styles.switchContainer]}>
          <Switch
            trackColor={{
              false: themeColors.darkGray,
              true: themeColors.primary,
            }} // Red background
            thumbColor={isEnabled ? '#FFFFFF' : '#FFFFFF'} // White color for the switch thumb
            ios_backgroundColor="#FF6347"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
          <Text
            style={{
              color: themeColors.black,
              fontFamily: fonts.OpenSansRegular,
            }}>
            Business Pins
          </Text>
        </View>
        <Modal
          visible={modalVisible}
          transparent
          animationType="none"
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, {width: '80%'}]}>
              <Text style={styles.modalHeading}>Sort By</Text>
              <Text style={styles.subHeading}>Distance (kms):</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedDistance}
                  style={styles.picker}
                  onValueChange={itemValue => {
                    dispatch(setSelectedDistance(itemValue));
                    setModalVisible(false);
                  }}>
                  <Picker.Item label="2 kms" value={2000} />
                  <Picker.Item label="4 kms" value={4000} />
                  <Picker.Item label="6 kms" value={6000} />
                  <Picker.Item label="8 kms" value={8000} />
                  <Picker.Item label="10 kms" value={10000} />
                </Picker>
              </View>

              <TouchableOpacity
                style={[styles.closeButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={[styles.closeButtonText]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </LocationLayout>
  );
};

export default TopRated;

const styles = StyleSheet.create({
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: themeColors.primary,
    fontFamily: fonts.OpenSansBold,
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapFilterContainer: {
    position: 'absolute',
    top: 10,
    width: '100%',
    paddingHorizontal: 15,
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
  },
  filterContainer: {
    // position: 'absolute',
    // right: 15,
    backgroundColor: 'rgba(155, 216, 235, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    marginVertical: 4,
  },
  icon: {
    marginRight: 5,
  },
  filter: {
    fontFamily: fonts.OpenSansBold,
    fontSize: size.sl,
    color: themeColors.darkPink,
  },
  searchBox: {
    // width:"50%",
    backgroundColor: 'white',
    // flex: 0.5,
    padding: 4,
    paddingRight: 25,
    borderRadius: 8,
    textAlign: 'center',
    position: 'relative',
    marginRight: 10,
    fontSize: size.sl,
    color: themeColors.darkGray,
  },
  filterButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
  },
  categoryContainer: {
    // position: 'absolute',
    // top: 65,
    // right: 15,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  categoryButton: {
    // backgroundColor: 'rgba(0, 0, 0, 0.5)', // Light black with 10% opacity
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
    width: 90,
    alignItems: 'center',
  },
  suggestionList: {
    marginTop: 10,
    backgroundColor: themeColors.white,
    zIndex: 1000,
    marginRight: 10,
  },
  suggestionText: {
    padding: 10,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
  },
  errorText: {
    color: 'red',
    fontSize: size.md,
    textAlign: 'center',
    padding: 15,
  },
  compassButton: {
    position: 'absolute',
    bottom: 20,
    left: 20, // Position it at the bottom-left corner
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    // alignItems: 'center',
  },
  modalHeading: {
    fontSize: size.md,
    fontWeight: 'bold',
    marginBottom: 10,
    color: themeColors.darkGray,
  },
  subHeading: {
    fontSize: size.sl,
    marginBottom: 5,
    color: themeColors.darkGray,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '100%',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  closeButton: {
    // margin: 10,
    padding: 10,
    backgroundColor: themeColors.primary,
    borderRadius: 5,
    alignSelf: 'center',
    width: '100%',
  },
  closeButtonText: {
    fontSize: size.md,
    color: themeColors.white,
    textAlign: 'center',
  },
  switchContainer: {
    position: 'absolute',
    // borderRadius: 30,
    padding: 5,
    backgroundColor: 'white',
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
