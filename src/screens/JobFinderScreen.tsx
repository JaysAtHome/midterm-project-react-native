import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';
import { useSavedJobs } from '../context/SavedJobsContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import uuid from 'react-native-uuid';
import Modal from 'react-native-modal';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/roottypes';

interface Job {
  id: string;
  title: string;
  companyName: string;
  description: string;
  minSalary: number | null;
  maxSalary: number | null;
}

type JobFinderScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'JobFinder'
>;

interface Props {
  navigation: JobFinderScreenNavigationProp;
}

const JobFinderScreen = ({ navigation }: Props) => {
  const { savedJobs, saveJob } = useSavedJobs();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [isModalVisible, setModalVisible] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <IconButton
            icon={isDarkMode ? 'white-balance-sunny' : 'weather-night'}
            onPress={toggleTheme}
            iconColor={colors.text} // Changed from 'color' to 'iconColor'
            />
          <IconButton
            icon="bookmark"
            onPress={() => navigation.navigate('SavedJobs')}
            iconColor={colors.text} // Changed from 'color' to 'iconColor'
            />
        </View>
      ),
    });
  }, [navigation, isDarkMode, colors.text]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://empllo.com/api/v1');
      const jobsWithIds = response.data.jobs.map((job: any) => ({
        id: uuid.v4() as string,
        title: job.title,
        companyName: job.companyName,
        description: job.description,
        minSalary: job.minSalary,
        maxSalary: job.maxSalary,
      }));
      setJobs(jobsWithIds);
      setFilteredJobs(jobsWithIds);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setLoading(false);
    }
  };

  const cleanDescription = (htmlString: string): string => {
    let decodedString = htmlString
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/u003c/g, '<')
      .replace(/u003e/g, '>')
      .replace(/\\"/g, '"');

    decodedString = decodedString.replace(/<\/?[^>]+(>|$)/g, '');
    decodedString = decodedString.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

    return decodedString.trim();
  };

  const formatSalary = (min: number | null, max: number | null): string => {
    if (min === null && max === null) return 'Not specified';
    if (min === null) return `Up to $${max}`;
    if (max === null) return `From $${min}`;
    return `$${min} - $${max}`;
  };

  const renderJobItem = ({ item }: { item: Job }) => {
    const isSaved = savedJobs.some((saved) => saved.id === item.id);
    const cleanedDescription = cleanDescription(item.description);

    return (
      <View
        style={[
          styles.jobCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
          },
        ]}>
        <Text style={[styles.jobTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.companyText, { color: colors.text }]}>
          Company: {item.companyName}
        </Text>
        <Text
          style={[styles.descriptionText, { color: colors.text }]}
          numberOfLines={3}>
          {cleanedDescription}
        </Text>
        <Text style={[styles.salaryText, { color: colors.secondary }]}>
          Salary: {formatSalary(item.minSalary, item.maxSalary)}
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              isSaved ? styles.savedButton : styles.saveButton,
              {
                backgroundColor: isSaved ? colors.secondary : colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
            onPress={() => saveJob(item)}
            disabled={isSaved}>
            <Text
              style={[
                styles.buttonText,
                { color: isSaved ? colors.background : colors.text },
              ]}>
              {isSaved ? '✓ Saved' : 'Save Job'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() =>
              navigation.navigate('ApplicationForm', {
                jobId: item.id,
                fromSavedJobs: false,
              })
            }>
            <Text style={[styles.buttonText, { color: '#fff' }]}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Modal
          isVisible={isModalVisible}
          onBackdropPress={() => setModalVisible(false)}
          style={styles.bottomModal}
          swipeDirection="down"
          onSwipeComplete={() => setModalVisible(false)}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: colors.cardBackground },
            ]}>
            <TouchableOpacity
              style={[
                styles.modalButton,
                { borderBottomColor: colors.border },
              ]}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('SavedJobs');
              }}>
              <Text style={[styles.modalText, { color: colors.text }]}>
                View Saved Jobs
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                { borderBottomColor: colors.border },
              ]}
              onPress={() => setModalVisible(false)}>
              <Text style={[styles.modalText, { color: colors.text }]}>
                View Available Jobs
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>

        <TextInput
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Search jobs..."
          placeholderTextColor={colors.text}
          value={search}
          onChangeText={setSearch}
        />

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <FlatList
            data={filteredJobs}
            keyExtractor={(item) => item.id}
            renderItem={renderJobItem}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  jobCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  companyText: {
    fontSize: 16,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  salaryText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  saveButton: {
    borderWidth: 1,
  },
  savedButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalButton: {
    padding: 15,
    borderBottomWidth: 1,
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default JobFinderScreen;