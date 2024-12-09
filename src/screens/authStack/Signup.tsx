import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {themeColors} from '../../theme/colors';
import {size} from '../../theme/fontStyle';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import {SCREENS} from '../../constants/screens';
import {fonts} from '../../theme/fonts';
import {signup} from '../../services/auth';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../store/slices/User';
import {Formik} from 'formik';
import {NavigationStackParams, SignUpSchema} from '../../interfaces';
import {horizontalScale, verticalScale} from '../../utils/metrics';
import {validationSignUpSchema} from '../../validation';
import {NavigationProp, useNavigation} from '@react-navigation/native';

const SignupScreen = () => {
  const toast = useToast();
  const dispatch = useDispatch();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<NavigationStackParams>>();

  const handleSubmit = async (values: SignUpSchema) => {
    console.log('~Sign_up_Schema', values);
    await signup(
      values,
      () => {
        setLoading(true);
      },

      (successData: any) => {
        setLoading(false);
        dispatch(setUserData(successData));
        navigation.navigate('Home');
      },

      (error: any) => {
        setLoading(false);
        console.log('Error registering user:', error);
        toast.show(error.message, {
          type: 'danger',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
      },
    );
  };

  return (
    <Formik
      initialValues={{
        first_name: '',
        last_name: '',
        sex: '',
        dob: '',
        email: '',
        password: '',
        confirm_password: '',
      }}
      onSubmit={handleSubmit}
      validationSchema={validationSignUpSchema}>
      {({
        errors,
        values,
        handleChange,
        handleReset,
        handleSubmit,
        resetForm,
        touched,
        setSubmitting,
        isSubmitting,
        setFieldValue,
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
            <Text style={styles.title}>Create New Account</Text>
            <Text style={styles.subTitle}>
              Enter Your details to create account
            </Text>
            <CustomInput
              placeholder="First Name"
              value={values.first_name}
              onChangeText={handleChange('first_name')}
              secureTextEntry={false}
              // isError={isError}
              error={errors?.first_name}
              editable={true}
              touched={touched.first_name}
            />

            <CustomInput
              placeholder="Last Name"
              value={values.last_name}
              onChangeText={handleChange('last_name')}
              secureTextEntry={false}
              // isError={isError}
              editable={true}
              error={errors?.last_name}
              touched={touched.last_name}
            />

            <View style={styles.row}>
              <View style={{width: '49%'}}>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={values.sex}
                    onValueChange={handleChange('sex')}
                    style={styles.picker}>
                    <Picker.Item
                      style={{color: themeColors.black}}
                      label="Sex"
                      value="Sex"
                    />
                    <Picker.Item
                      style={{color: themeColors.black}}
                      label="Male"
                      value="male"
                    />
                    <Picker.Item
                      style={{color: themeColors.black}}
                      label="Female"
                      value="female"
                    />
                  </Picker>
                </View>
                {errors.sex && <Text style={styles.error}>{errors.sex}</Text>}
              </View>

              <View style={{width: '49%'}}>
                <View style={styles.datePickerContainer}>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={styles.datePickerButton}>
                    <Text style={styles.datePickerText}>
                      {values.dob
                        ? new Date(values.dob).toLocaleDateString()
                        : 'Date of birth'}
                    </Text>
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={values.dob ? new Date(values.dob) : new Date()}
                      mode="date"
                      display="default"
                      // textColor="red"
                      // textColor="red"
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
                  )}
                </View>

                {touched.dob && typeof errors.dob === 'string' && (
                  <Text style={styles.error}>{errors.dob}</Text>
                )}
              </View>
            </View>

            <CustomInput
              placeholder={'Email Address'}
              value={values.email}
              onChangeText={handleChange('email')}
              secureTextEntry={false}
              icon="at"
              editable={true}
              error={errors?.email}
              touched={touched.email}
            />

            <CustomInput
              placeholder={'Password'}
              value={values.password}
              onChangeText={handleChange('password')}
              secureTextEntry={false}
              icon="at"
              editable={true}
              error={errors?.password}
              touched={touched.password}
            />

            <CustomInput
              placeholder={'Confirm Password'}
              value={values.confirm_password}
              onChangeText={handleChange('confirm_password')}
              secureTextEntry={false}
              icon="at"
              editable={true}
              error={errors?.confirm_password}
              touched={touched.confirm_password}
            />

            <CustomButton
              text={'Sign Up'}
              onPress={handleSubmit}
              loading={loading}
              extraStyle={{
                width: horizontalScale(330),
                marginTop: 30,
                // backgroundColor: 'red',
              }}
            />
          </ScrollView>
        </KeyboardAvoidingView>

        // <View style={styles.container}>
      )}
    </Formik>
  );
};

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
    color: themeColors.black,
    marginBottom: 30,
    fontFamily: fonts.OpenSansRegular,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: horizontalScale(330),
    marginBottom: 20,
  },
  pickerContainer: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderRadius: 50,
    backgroundColor: themeColors.white,
    marginLeft: 2,
  },
  picker: {
    height: 50,
    width: '100%',
    alignSelf: 'center',
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
    backgroundColor: themeColors.white,
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
});

export default SignupScreen;
