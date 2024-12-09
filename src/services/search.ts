import {supabase} from '../utils/supabaseClient';

export const searchDiseasesORSymptoms = async (
  search_text: string,
  type: string, // 'diseases' or 'symptoms'
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const tableName =
      type === 'diseases' ? 'illness_and_conditions' : 'symptoms';
    const searchColumn =
      type === 'diseases' ? 'condition_name' : 'symptom_name';
    const {data, error} = await supabase
      .from(tableName)
      .select(`id, ${searchColumn}`)
      .ilike(searchColumn, `%${search_text}%`)
      .order(searchColumn, {ascending: true});
    if (error) {
      errorCallback(new Error('Failed to fetch results'));
      return;
    }
    successCallback(data);
  } catch (err) {
    errorCallback(err as Error);
  }
};
