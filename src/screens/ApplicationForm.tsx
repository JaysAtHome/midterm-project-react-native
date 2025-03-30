import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/roottypes';
import { useSavedJobs } from '../context/SavedJobsContext';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTheme } from '../context/ThemeContext';

type ApplicationFormScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'ApplicationForm'>;
  route: RouteProp<RootStackParamList, 'ApplicationForm'>;
};

const ApplicationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
  phone: Yup.string()
    .min(10, 'Invalid phone number')
    .required('Required'),
  reason: Yup.string()
    .min(20, 'Please provide at least 20 characters')
    .required('Required')
});

const ApplicationForm: React.FC<ApplicationFormScreenProps> = ({ navigation, route }) => {
  const { jobId, fromSavedJobs } = route.params;
  const { savedJobs } = useSavedJobs();
  const { colors } = useTheme();
  const [jobTitle, setJobTitle] = useState('');

  useEffect(() => {
    const job = savedJobs.find(job => job.id === jobId);
    if (job) {
      setJobTitle(job.title);
    }
  }, [jobId, savedJobs]);

  const handleFormSubmit = (values: {
    name: string;
    email: string;
    phone: string;
    reason: string;
  }, { resetForm }: { resetForm: () => void }) => {
    Alert.alert(
      'Application Submitted',
      `Thank you for applying! We'll review your application and get back to you soon.`,
      [
        {
          text: 'OK',
          onPress: () => {
            resetForm();
            if (fromSavedJobs) {
              navigation.navigate('JobFinder');
            } else {
              navigation.goBack();
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Application Form{jobTitle}</Text>
      
      <Formik
        initialValues={{ name: '', email: '', phone: '', reason: '' }}
        validationSchema={ApplicationSchema}
        onSubmit={handleFormSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
              <TextInput
                style={[styles.input, { 
                  borderColor: colors.border, 
                  backgroundColor: colors.cardBackground,
                  color: colors.text
                }]}
                placeholder="Full Name Here"
                placeholderTextColor={colors.text}
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                value={values.name}
                testID="nameInput"
              />
              {touched.name && errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[styles.input, { 
                  borderColor: colors.border, 
                  backgroundColor: colors.cardBackground,
                  color: colors.text
                }]}
                placeholder="Email Address Here"
                placeholderTextColor={colors.text}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                testID="emailInput"
              />
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
              <TextInput
                style={[styles.input, { 
                  borderColor: colors.border, 
                  backgroundColor: colors.cardBackground,
                  color: colors.text
                }]}
                placeholder="Phone Number Here"
                placeholderTextColor={colors.text}
                keyboardType="phone-pad"
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                value={values.phone}
                testID="phoneInput"
              />
              {touched.phone && errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Why should we hire you?</Text>
              <TextInput
                style={[
                  styles.input, 
                  styles.multilineInput, 
                  { 
                    borderColor: colors.border, 
                    backgroundColor: colors.cardBackground,
                    color: colors.text
                  }
                ]}
                placeholder="Explain why you're a good fit for this position..."
                placeholderTextColor={colors.text}
                multiline
                numberOfLines={4}
                onChangeText={handleChange('reason')}
                onBlur={handleBlur('reason')}
                value={values.reason}
                testID="reasonInput"
              />
              {touched.reason && errors.reason && (
                <Text style={styles.errorText}>{errors.reason}</Text>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: colors.primary }]} 
              onPress={() => handleSubmit()}
              testID="submitButton"
            >
              <Text style={styles.submitButtonText}>Submit Application</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 12,
    color: '#ff0000',
    marginTop: 5,
  },
});

export default ApplicationForm;