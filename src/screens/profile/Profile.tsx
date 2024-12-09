import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useRef, useState} from 'react';
import {themeColors} from '../../theme/colors';
import {fonts} from '../../theme/fonts';
import {useNavigation} from '@react-navigation/native';
import RawBottomSheet from '../../components/shared-components/RawBottomSheet';
import {useDispatch, useSelector} from 'react-redux';
import {user} from '../../store/selectors';
import ImageCropPicker from 'react-native-image-crop-picker';
import {horizontalScale, verticalScale} from '../../utils/metrics';
import CameraIcon from 'react-native-vector-icons/FontAwesome5';
import CustomInput from '../../components/common/CustomInput';
import {Formik} from 'formik';
import {useToast} from 'react-native-toast-notifications';
import {ScrollView} from 'react-native-gesture-handler';
import {size} from '../../theme/fontStyle';
import DateTimePicker from '@react-native-community/datetimepicker';
import {validationUpdateProfile} from '../../validation';
import {Picker} from '@react-native-picker/picker';
// import {updateProfileSchema} from '../../interfaces/index';
import CustomPhoneNumber from '../../components/reusable_component/CustomPhoneInput';
import PhoneInput from 'react-native-phone-number-input';
import ProfileCustomButton from '../../components/reusable_component/ProfileCustomButton';
import {updateProfile, uploadAvatar} from '../../services/profile';
import {setUserData, setAvatarImage} from '../../store/slices/User';
import {Dispatch, UnknownAction} from '@reduxjs/toolkit';
import {SUPABASE_URL} from '@env';

const Profile = () => {
  const navigation = useNavigation();
  const userData: any = useSelector(user);

  console.log('user Data~', userData);
  const refRBSheet = useRef<any>();
  const dispatch = useDispatch<Dispatch<UnknownAction>>();
  const toast = useToast();
  const {saveimageUrl} = useSelector((state: any) => state.userData);

  const [imagePath, setimagePath] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDisabledField, setIsDisableField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode, setCountryCode] = useState<number>();
  const phoneInput = useRef<PhoneInput>(null);

  console.log('~ image-path :', imagePath);

  const openGallery = async () => {
    const galleryImage = await ImageCropPicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    });
    setimagePath(galleryImage.path);
    // handleimageUpload();
    refRBSheet.current.close();
  };

  const openCamera = async () => {
    const cameraImage = await ImageCropPicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
    });
    setimagePath(cameraImage.path);
    // handleimageUpload();
    refRBSheet.current.close();
  };

  console.log('~save iamge url-', saveimageUrl);
  const handleimageUpload = async () => {
    await uploadAvatar(
      imagePath,
      () => {
        // setIsLoading(true);
      },
      (successData: any) => {
        setIsLoading(false);
        dispatch(setAvatarImage(successData.fullPath));
        // setIsDisableField(false);
        toast.show('Avatar uploaded', {
          type: 'success',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
        console.log('~ Successdata', successData);
      },
      (error: any) => {
        console.log('Error uploading Avatar:', error);
        toast.show('Something went wrong', {
          type: 'danger',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
        // setIsLoading(false);
      },
    );
  };

  const handleSubmit = async (values: any) => {
    await updateProfile(
      values,
      {userid: userData.id},
      () => {
        setIsLoading(true);
      },
      (successData: any) => {
        setIsLoading(false);
        dispatch(setUserData(successData));
        setIsDisableField(false);
        toast.show('User profile Updated', {
          type: 'success',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
        console.log('~ Successdata', successData);
      },
      (error: any) => {
        console.log('Error updating profile:', error);
        toast.show('Check Network Connnection', {
          type: 'danger',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
        setIsLoading(false);
      },
    );
  };

  const dobString = userData.dob; // "8/20/2000"
  const [month, day, year] = dobString.split('/'); // Split the string
  // Create an ISO string
  const isoDateString = `${year}-${month}-${day}`;
  const dobDate = new Date(isoDateString); // Convert to Date object

  // Complete URL banaiye
  const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/${saveimageUrl}`;
  console.log('image_Url====', imageUrl);

  return (
    <Formik
      initialValues={{
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        sex: userData.sex || '',
        dob: dobDate || '',
        email: userData.email || '',
        emailOrPhone: userData.phone_number || '',
      }}
      onSubmit={handleSubmit}
      validationSchema={validationUpdateProfile}>
      {({
        errors,
        values,
        handleChange,
        handleSubmit,
        touched,
        setFieldValue,
        resetForm,
      }) => (
        <KeyboardAvoidingView behavior="padding">
          <ScrollView
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '100%',
            }}>
            <View style={{alignItems: 'center', paddingTop: verticalScale(35)}}>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 200,
                }}>
                {/* <Image
                  source={{
                    uri: `${SUPABASE_URL}/storage/v1/object/public/${saveimageUrl}`,
                  }}
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 200,
                    resizeMode: 'cover',
                    borderWidth: 3,
                    borderColor: 'grey',
                    backgroundColor: 'orange',
                  }}
                /> */}

                {imagePath ? (
                  <>
                    <Image
                      source={{uri: imagePath}}
                      style={{
                        width: 200,
                        height: 200,
                        borderRadius: 200,
                        resizeMode: 'cover',
                        borderWidth: 3,
                        borderColor: 'grey',
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => refRBSheet.current.open()}
                      activeOpacity={0.7}
                      style={{
                        width: 60,
                        height: 60,
                        backgroundColor: themeColors.white,
                        borderRadius: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'absolute',
                        right: 20,
                        bottom: -8,
                      }}>
                      <CameraIcon
                        name="camera"
                        size={30}
                        color={'rgba(0,0,0,0.9)'}
                      />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Image
                      source={require('../../../assets/images/avatar.jpg')}
                      style={{
                        width: 200,
                        height: 200,
                        borderRadius: 200,
                        resizeMode: 'cover',
                        borderWidth: 3,
                        borderColor: 'grey',
                      }}
                    />

                    <TouchableOpacity
                      onPress={() => refRBSheet.current.open()}
                      activeOpacity={0.7}
                      style={{
                        width: horizontalScale(60),
                        height: verticalScale(60),
                        backgroundColor: themeColors.white,
                        borderRadius: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'absolute',
                        right: 20,
                        bottom: -8,
                      }}>
                      <CameraIcon
                        name="camera"
                        size={30}
                        color={'rgba(0,0,0,0.9)'}
                      />
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* RBsheet */}

              <RawBottomSheet
                refRB={refRBSheet}
                openGallery={openGallery}
                openCamera={openCamera}
              />
            </View>

            <View style={{paddingTop: verticalScale(40)}}>
              <CustomInput
                placeholder={'First Name'}
                value={values.first_name}
                onChangeText={handleChange('first_name')}
                secureTextEntry={false}
                //  isError={isError}
                error={errors?.first_name}
                touched={touched.first_name}
                editable={isDisabledField}
                // icon=''
                // isError=''
                // focus={isDisabledField}
              />

              <CustomInput
                placeholder={'Last Name'}
                value={values.last_name}
                onChangeText={handleChange('last_name')}
                secureTextEntry={false}
                // isError={isError}
                error={errors?.last_name}
                touched={touched.last_name}
                editable={isDisabledField}

                // focus={isDisabledField}
              />

              <View style={styles.row}>
                <View style={{width: '49%'}}>
                  <View
                    style={[
                      styles.pickerContainer,
                      {
                        backgroundColor: isDisabledField
                          ? themeColors.white
                          : 'lightgrey',
                      },
                    ]}>
                    <Picker
                      // aria-disabled={false}
                      // enabled={false}
                      // placeholder={userData.sex}
                      enabled={isDisabledField}
                      selectedValue={
                        isDisabledField ? values.sex : userData.sex
                      }
                      // itemStyle={{fontSize: 10, backgroundColor: 'orange'}}
                      onValueChange={handleChange('sex')}
                      style={styles.picker}>
                      <Picker.Item
                        style={{color: themeColors.black}}
                        label={isDisabledField ? 'Sex' : userData.sex}
                        value={isDisabledField ? 'Sex' : userData.sex}
                      />
                      <Picker.Item
                        style={{color: themeColors.black}}
                        label={isDisabledField ? 'Male' : userData.sex}
                        value={isDisabledField ? 'Male' : userData.sex}
                      />
                      <Picker.Item
                        style={{color: themeColors.black}}
                        label={isDisabledField ? 'Female' : userData.sex}
                        value={isDisabledField ? 'Female' : userData.sex}
                      />
                    </Picker>
                  </View>

                  {errors.sex && <Text style={styles.error}>{errors.sex}</Text>}
                </View>

                <View style={{width: '49%'}}>
                  <View style={styles.datePickerContainer}>
                    <TouchableOpacity
                      disabled={!isDisabledField}
                      onPress={() => setShowDatePicker(true)}
                      style={[
                        styles.datePickerButton,
                        {
                          backgroundColor: isDisabledField
                            ? themeColors.white
                            : 'lightgrey',
                        },
                      ]}>
                      <Text style={styles.datePickerText}>
                        {values.dob
                          ? new Date(values.dob).toLocaleDateString()
                          : 'Date of birth'}
                      </Text>
                    </TouchableOpacity>

                    {showDatePicker &&
                      (console.log(
                        '~ Inside ShowdatePicker :',
                        values.dob ? new Date(values.dob) : new Date(),
                      ),
                      (
                        <DateTimePicker
                          value={values.dob ? new Date(values.dob) : new Date()}
                          mode="date"
                          display="default"
                          onChange={(event: any, date?: Date) => {
                            console.log('Dob-values', values);
                            setShowDatePicker(false);
                            // setShowDatePicker(false);
                            if (date) {
                              // Pass the date object instead of a string
                              setFieldValue('dob', date);
                            }
                          }}
                        />
                      ))}
                  </View>

                  {touched.dob && typeof errors.dob === 'string' && (
                    <Text style={styles.error}>{errors.dob}</Text>
                  )}
                </View>
              </View>

              <CustomInput
                placeholder={'Email'}
                value={values.email}
                onChangeText={handleChange('email')}
                secureTextEntry={false}
                icon="at"
                error={errors?.email}
                touched={touched.email}
                editable={false}
              />

              <CustomPhoneNumber
                value={values.emailOrPhone}
                onchangeState={handleChange('emailOrPhone')}
                setCountryCode={setCountryCode}
                phoneInput={phoneInput}
                countrycode={countryCode}
                error={errors?.emailOrPhone}
                touched={touched.emailOrPhone}
                editable={false}
                placeHolder={'phone number'}
              />

              {/* // stateError={isError} */}

              {/* 
              <CustomInput
                placeholder={'Password'}
                value={values.password}
                onChangeText={handleChange('password')}
                secureTextEntry={false}
                icon="at"
                error={errors?.password}
                touched={touched.password}
              />

              <CustomInput
                placeholder={'Confirm Password'}
                value={values.confirm_password}
                onChangeText={handleChange('confirm_password')}
                secureTextEntry={false}
                icon="at"
                error={errors?.confirm_password}
                touched={touched.confirm_password}
              /> */}

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  paddingBottom: verticalScale(30),
                }}>
                {isDisabledField && (
                  <ProfileCustomButton
                    value={'cancel'}
                    onPress={() => {
                      setIsDisableField(false);
                      resetForm();
                    }}
                    extraStyle={{
                      // backgroundColor: 'orange',
                      borderWidth: 1,
                      borderRadius: 100,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: horizontalScale(20),
                      width: horizontalScale(100),
                      paddingVertical: verticalScale(10),
                    }}
                  />
                )}

                <ProfileCustomButton
                  value={isDisabledField ? 'Update' : 'Edit'}
                  isLoading={isLoading}
                  extraStyle={{
                    backgroundColor: themeColors.primary,
                    borderRadius: 100,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: horizontalScale(20),
                    width: isDisabledField
                      ? horizontalScale(130)
                      : horizontalScale(330),
                    paddingVertical: verticalScale(18),
                  }}
                  onPress={() => {
                    setIsDisableField(true);
                    if (isDisabledField) handleSubmit();
                  }}
                />
              </View>

              {/* <CustomButton
                text={'Sign Up'}
                onPress={handleSubmit}
                loading={loading}
                extraStyle={{
                  width: horizontalScale(330),
                  marginTop: 30,
                  // backgroundColor: 'red',
                }}
              /> */}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        // <View style={styles.container}>
      )}
    </Formik>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: themeColors.white,
  },
  title: {
    fontSize: size.xxlg,
    color: themeColors.black,
    fontFamily: fonts.QuincyCFBold,
  },
  subTitle: {
    fontSize: size.md,
    marginBottom: 30,
    color: themeColors.black,
    fontFamily: fonts.OpenSansRegular,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: horizontalScale(330),
    marginBottom: 20,
    // backgroundColor: 'orange',
  },
  pickerContainer: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderRadius: 50,
    // backgroundColor: themeColors.white,
    marginLeft: 2,
  },
  picker: {
    height: 50,
    width: '100%',
    alignSelf: 'center',
    // color: 'red',
  },
  datePickerContainer: {
    width: '100%',
  },
  datePickerButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderRadius: 50,
    // backgroundColor: themeColors.white,
    marginHorizontal: 2,
  },
  datePickerText: {
    fontSize: size.md,
    color: themeColors.black,
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
    // paddingHorizontal: 4,
    marginTop: verticalScale(5),
    fontFamily: fonts.OpenSansRegular,
    textAlign: 'center',
  },
  profileContainer: {
    flex: 1,
    backgroundColor: themeColors.lightGray,
  },
  backText: {
    color: themeColors.black,
    fontFamily: fonts.OpenSansRegular,
    paddingHorizontal: 15,
    fontSize: 18,
  },
});
