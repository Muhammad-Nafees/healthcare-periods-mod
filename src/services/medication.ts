import moment from 'moment';
import {supabase} from '../utils/supabaseClient';

export const storeMedicationDetails = async (
  medicationData: any,
  id: any,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  console.log('id : inside', id.userid);
  const userId = id.userid;

  try {
    loadCallback();
    const {data, error} = await supabase
      .from('medications')
      .insert([medicationData])
      .eq('id', userId);

    console.log('error server', error);
    if (error) {
      errorCallback(new Error('Failed to fetch medication details'));
      return;
    }
    console.log('~ data inside medication :', data);
    successCallback(data);
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const updateMedicationDetails = async (
  medicationData: any,
  id: any,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  console.log('id inside', id);
  console.log('medicationData update data: ', medicationData.user_id);

  try {
    loadCallback();

    // Update the medication details
    const {data, error} = await supabase
      .from('medications')
      .update(medicationData)
      .eq('id', id); // Match the row with this ID (update condition)
    // .eq('user_id', userid); // Ensure it's for the right user

    console.log('error server', error);
    if (error) {
      errorCallback(new Error('Failed to update medication details'));
      return;
    }

    console.log('~ data inside medication update:', data);
    successCallback(data);
  } catch (err) {
    errorCallback(err as Error);
  }
};
