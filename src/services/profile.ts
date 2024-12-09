import moment from 'moment';
import {supabase} from '../utils/supabaseClient';
import {limit} from '../../config/variables';

export const updateProfile = async (
  userProfile: {
    first_name: string | undefined;
    last_name: string | undefined;
    sex: string | undefined;
    dob: string | Date;
  },
  userid: any,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
) => {
  loadCallback();

  const dobDate = new Date(userProfile?.dob); // Convert the existing date to a Date object

  const formattedDOB = `${dobDate.getDate().toString().padStart(2, '0')}/${(
    dobDate.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}/${dobDate.getFullYear()}`;

  // Output will be in the format: "DD/MM/YYYY"
  console.log(formattedDOB); // Example: "31/10/1989"

  try {
    const usersProfileData = {
      first_name: userProfile?.first_name,
      last_name: userProfile?.last_name,
      sex: userProfile?.sex,
      dob: formattedDOB,
    };

    const {data, error} = await supabase
      .from('user_profiles')
      .update(usersProfileData)
      .eq('id', userid.userid);
    if (error) {
      errorCallback(error);
    } else {
      const {data: userProfile, error: fetchError} = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userid.userid)
        .single();
      if (fetchError) {
        errorCallback(fetchError);
        return;
      }

      successCallback(userProfile);
    }
  } catch (error) {
    throw error;
  }
};

export const uploadAvatar = async (
  imagePath: string,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
) => {
  loadCallback(); // Loading start karna
  try {
    // File ko read karna
    // const fileData = await RNFS.readFile(imagePath, 'base64');
    // File ka naam nikaalna
    // const fileName = imagePath.split('/').pop();
    // Supabase mein upload karna
    // console.log('Filename--- Uploaded', fileName);

    const {data, error} = await supabase.storage
      .from('avatar')
      .upload(`/${fileName}`, fileData, {
        // yahan fileData istemal karna hai
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      errorCallback(error); // Agar koi error aaye to callback ke zariye error bhejna
    } else {
      successCallback(data); // Agar upload successful ho to callback ke zariye data bhejna
    }
  } catch (error) {
    errorCallback(error); // Error ko handle karna
  }
};

export const toggleFacilityFavorite = async (
  userId: string,
  facilityId: string,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
) => {
  loadCallback();
  try {
    // Check if the facility is already in favorites
    const {data: favoritesData, error: fetchError} = await supabase
      .from('favorites')
      .select('id') // Assuming 'id' is the primary key in your favorites table
      .eq('user_id', userId)
      .eq('facility_id', facilityId)
      .maybeSingle();

    if (fetchError) {
      errorCallback(fetchError);
      return;
    }

    if (favoritesData) {
      // Facility is already favorited, remove it
      const {error: deleteError} = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoritesData.id); // Use the retrieved id to delete

      if (deleteError) {
        errorCallback(deleteError);
      } else {
        successCallback('Facility removed from favorites');
      }
    } else {
      // Facility is not favorited, add it
      const {data, error: insertError} = await supabase
        .from('favorites')
        .insert([
          {
            user_id: userId,
            facility_id: facilityId,
            created_at: moment(new Date()).valueOf(),
            updated_at: moment(new Date()).valueOf(),
            created_by: userId,
            updated_by: userId,
            is_created_by_admin_panel: false,
          },
        ]);

      if (insertError) {
        errorCallback(insertError);
      } else {
        successCallback('Facility added to favorites');
      }
    }
  } catch (error) {
    errorCallback(error);
  }
};

export const checkFavoriteStatus = async (
  userId: string,
  facilityId: string,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
) => {
  loadCallback();
  try {
    const {data, error} = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('facility_id', facilityId);

    if (error) {
      errorCallback(error);
    } else {
      successCallback(data);
    }
  } catch (error) {
    errorCallback(error);
  }
};

export const fetchFavorites = async (
  userId: string,
  offset: number,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
) => {
  loadCallback();
  try {
    const {data, error} = await supabase
      .from('favorites')
      .select(`*,facilities(*)`)
      .eq('user_id', userId)
      .order('created_at', {ascending: false})
      .range(offset, offset + limit - 1);

    if (error) {
      errorCallback(error);
    } else {
      successCallback(data);
    }
  } catch (error) {
    errorCallback(error);
  }
};
