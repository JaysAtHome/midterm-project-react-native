import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView 
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/roottypes';
import { useSavedJobs } from '../context/SavedJobsContext';

type ApplicationFormScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'ApplicationForm'>;
  route: RouteProp<RootStackParamList, 'ApplicationForm'>;
};

const ApplicationForm: React.FC<ApplicationFormScreenProps> = ({ navigation, route }) => {
  const { jobId, fromSavedJobs } = route.params;
  const { savedJobs } = useSavedJobs();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    reason: ''
  });
  const [jobTitle, setJobTitle] = useState('');

  useEffect(() => {
    const job = savedJobs.find(job => job.id === jobId);
    if (job) {
      setJobTitle(job.title);
    }
  }, [jobId, savedJobs]);

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.reason) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    Alert.alert(
      'Application Submitted',
      `Thank you for applying to ${jobTitle}! We'll review your application and get back to you soon.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setFormData({
              name: '',
              email: '',
              phone: '',
              reason: ''
            });
            
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Apply for: {jobTitle}</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="John Doe"
          value={formData.name}
          onChangeText={(text) => setFormData({...formData, name: text})}
          testID="nameInput"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="john@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(text) => setFormData({...formData, email: text})}
          testID="emailInput"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="+1234567890"
          keyboardType="phone-pad"
          value={formData.phone}
          onChangeText={(text) => setFormData({...formData, phone: text})}
          testID="phoneInput"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Why should we hire you?</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Explain why you're a good fit for this position..."
          multiline
          numberOfLines={4}
          value={formData.reason}
          onChangeText={(text) => setFormData({...formData, reason: text})}
          testID="reasonInput"
        />
      </View>

      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleSubmit}
        testID="submitButton"
      >
        <Text style={styles.submitButtonText}>Submit Application</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#6200ee',
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
});

export default ApplicationForm;