import {API_KEY, limit} from '../../config/variables';
import useLocation from '../hooks/useLocation';
import {supabase} from '../utils/supabaseClient';

export const getFacilityListByCategory = async (
  category: string,
  offset: number,
  location: any,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const {data, error} = await supabase
      .from('facilities')
      .select('*')
      .ilike('type', `%${category}%`)
      .order('rating', {ascending: false})
      .range(offset, offset + limit - 1);
    if (error) {
      errorCallback(new Error('Failed to fetch facilities list'));
      return;
    }
    const updatedData: any = await Promise.all(
      data?.map(async (place: any) => {
        // const d = await getRatingsAndDistance(place?.facility_name, location);
        return {
          ...place,
          // ...d,
        };
      }),
    );
    successCallback(updatedData);
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const getTopRatedFacility = async (
  category: string,
  location: any,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const {data, error} = await supabase
      .from('facilities')
      .select('*')
      .ilike('type', `%${category}%`)
      .order('rating', {ascending: false})
      .limit(4);

    if (error) {
      errorCallback(new Error('Failed to fetch top facility'));
      return;
    }
    const updatedData: any = await Promise.all(
      data?.map(async (place: any) => {
        // const d = await getRatingsAndDistance(place?.facility_name, location);
        return {
          ...place,
          // ...d,
        };
      }),
    );
    successCallback(updatedData);
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const getFacilityDetailsById = async (
  id: string,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const {data, error} = await supabase
      .from('facilities')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      errorCallback(new Error('Failed to fetch facility details'));
      return;
    }
    successCallback(data);
  } catch (err) {
    errorCallback(err as Error);
  }
};

const getRatingsAndDistance = async (placeName: string, location: any) => {
  try {
    let data = {
      distance: 0,
      photo: '',
    };
    // Step 1: Search for the place to get its place_id
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
      placeName,
    )}&inputtype=textquery&fields=place_id&key=${API_KEY}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.status === 'OK' && searchData.candidates.length > 0) {
      const placeId = searchData.candidates[0].place_id;

      // Step 2: Use the place_id to get complete details
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry,photo&key=${API_KEY}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      if (detailsData.status === 'OK') {
        const result = detailsData.result;

        // Helper function to build photo URL
        const buildPhotoUrl = (photoReference: string) =>
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${API_KEY}`;

        const distance = await fetchDistanceAndDuration(
          {
            lat: location?.latitude || 0,
            lng: location?.longitude || 0,
          },
          result.geometry ? result.geometry.location : {lat: 0, lng: 0},
        );
        data = {
          photo: result?.photos
            ? buildPhotoUrl(result?.photos[0]?.photo_reference)
            : '',
          distance,
        };
      } else {
        console.log('Place details request failed:', detailsData.status);
        if (detailsData.error_message) {
          console.log('Error Message:', detailsData.error_message);
        }
      }
    } else {
      console.log('Place search failed:', searchData.status);
      if (searchData.error_message) {
        console.log('Error Message:', searchData.error_message);
      }
    }
    return data;
  } catch (error) {
    console.log('Error fetching data:', error);
  }
};

const fetchDistanceAndDuration = async (
  origin: {lat: number; lng: number},
  destination: {lat: number; lng: number},
) => {
  try {
    let distance: any;
    const distanceMatrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${API_KEY}`;
    const response = await fetch(distanceMatrixUrl);
    const data = await response.json();

    if (data.status === 'OK') {
      const element = data.rows[0].elements[0];
      if (element.status === 'OK') {
        distance = element.distance.text;
      } else {
        console.log('Distance Matrix API response status: 1', element.status);
      }
    } else {
      console.log('Distance Matrix API response status: 2', data.status);
    }
    return distance;
  } catch (error) {
    console.log('Error fetching distance and duration:', error);
  }
};
