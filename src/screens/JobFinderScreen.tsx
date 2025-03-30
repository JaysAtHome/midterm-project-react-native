import React, { useEffect, useState, useLayoutEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';
import { useSavedJobs } from '../context/SavedJobsContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import uuid from 'react-native-uuid';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/roottypes';
import { Job } from '../types/jobtypes';

type JobFinderScreenNavigationProp = StackNavigationProp<RootStackParamList, 'JobFinder'>;

interface Props {
  navigation: JobFinderScreenNavigationProp;
}

const JobFinderScreen = ({ navigation }: Props) => {
  const { savedJobs, saveJob, isJobSaved } = useSavedJobs();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = useCallback(async () => {
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
    } catch (error) {
      console.error('Error fetching jobs:', error);
      Alert.alert('Error', 'Failed to fetch jobs. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <IconButton
            icon={isDarkMode ? 'white-balance-sunny' : 'weather-night'}
            onPress={toggleTheme}
            iconColor={colors.text}
            testID="themeToggle"
          />
          <IconButton
            icon="bookmark"
            onPress={() => {
              if (savedJobs.length > 0) {
                navigation.navigate('SavedJobs');
              } else {
                Alert.alert('No Saved Jobs', 'You have no saved jobs yet.');
              }
            }}
            iconColor={colors.text}
            testID="savedJobsButton"
          />
        </View>
      ),
    });
  }, [navigation, isDarkMode, colors.text, savedJobs]);

  const cleanDescription = useCallback((htmlString: string): string => {
    return htmlString
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/u003c/g, '<')
      .replace(/u003e/g, '>')
      .replace(/\\"/g, '"')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .trim();
  }, []);

  const formatSalary = useCallback((min: number | null, max: number | null): string => {
    if (min === null && max === null) return 'Not specified';
    if (min === null) return `Up to $${max?.toLocaleString()}`;
    if (max === null) return `From $${min?.toLocaleString()}`;
    return `$${min?.toLocaleString()} - $${max?.toLocaleString()}`;
  }, []);

  const filteredJobs = useMemo(() => {
    if (!search) return jobs;
    const searchTerm = search.toLowerCase();
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(searchTerm) ||
        job.companyName.toLowerCase().includes(searchTerm)
    );
  }, [jobs, search]);

  const renderJobItem = useCallback(({ item }: { item: Job }) => {
    const isSaved = isJobSaved(item.id);
    const cleanedDescription = cleanDescription(item.description);

    return (
      <View
        style={[
          styles.jobCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
          },
        ]}
        testID={`jobCard-${item.id}`}>
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
            onPress={() => !isSaved && saveJob(item)}
            disabled={isSaved}
            testID={`saveButton-${item.id}`}>
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
            }
            testID={`applyButton-${item.id}`}>
            <Text style={[styles.buttonText, { color: '#fff' }]}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [colors, isJobSaved, cleanDescription, formatSalary, saveJob, navigation]);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} testID="loadingIndicator" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          testID="searchInput"
        />

        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          renderItem={renderJobItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                {search ? 'No jobs match your search' : 'No jobs available'}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
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
});

export default JobFinderScreen;