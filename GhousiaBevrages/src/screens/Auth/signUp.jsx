import React, { useState } from 'react';
import { Image, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authstore } from '../../store/authstore';
import ghousiaBevrages from '../../assets/GhosiaBevrageslogo.png';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigation } from '@react-navigation/native';

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  // ✅ Yup Validation Schema
  const validationSchema = Yup.object().shape({
    fullname: Yup.string()
      .required('Fullname is required'),
    phoneNumber: Yup.string()
      .matches(/^\d{11}$/, 'Phone number must be exactly 11 digits')
      .required('Phone number is required'),
      password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  }
);

  // ✅ Form Submit Handler
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const user = await authstore.getState().signup(values);

      if (user) {
        await AsyncStorage.setItem('auth-storage', JSON.stringify(user));
        Alert.alert('Success', 'Signup successful');
        resetForm();
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', 'Signup failed');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.main}>
      <Image source={ghousiaBevrages} style={styles.logo} />
      <Text style={styles.heading}>Sign Up Your Account</Text>

      <Formik
        initialValues={{ fullname: '', phoneNumber: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <View style={styles.form}>
            {/* Fullname */}
            <Text style={styles.label}>Fullname</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your fullname"
              placeholderTextColor="#999"
              value={values.fullname}
              onChangeText={handleChange('fullname')}
              onBlur={handleBlur('fullname')}
            />
            {touched.fullname && errors.fullname && (
              <Text style={styles.errorText}>{errors.fullname}</Text>
            )}

            {/* Phone Number */}
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
              value={values.phoneNumber}
              onChangeText={handleChange('phoneNumber')}
              onBlur={handleBlur('phoneNumber')}
            />
            {touched.phoneNumber && errors.phoneNumber && (
              <Text style={styles.errorText}>{errors.phoneNumber}</Text>
            )}

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0 }]}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
              />
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color="black"
                onPress={() => setShowPassword(!showPassword)}
              />
            </View> 
            {touched.password && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, isSubmitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Signing Up...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
      <View style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', marginTop: 20 }}>
        <Text>Already have an account?</Text>
        <TouchableOpacity onPress={()=> navigation.navigate('SignIn')}><Text style={{color: 'blue'}}> Sign In</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  logo: {
    height: '20%',
    resizeMode: 'contain',
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: 'black',
  },
  form: {
    marginTop: 20,
    width: '80%',
  },
  label: {
    color: 'black',
    marginBottom: 5,
  },
  input: {
    borderColor: '#525252',
    borderWidth: 1,
    color: 'black',
    paddingLeft: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#525252',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,

  },
  button: {
    backgroundColor: 'blue',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    
  },
});
