import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';
import { useSavedJobs } from '../context/SavedJobsContext';
import { useTheme } from '../context/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/roottypes';
import { Job } from '../types/jobtypes';

type SavedJobsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'SavedJobs'
>;

interface Props {
  navigation: SavedJobsScreenNavigationProp;
}

const SavedJobsScreen = ({ navigation }: Props) => {
  const { savedJobs, removeJob } = useSavedJobs();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = React.useState(false);

  const errorColor = '#dc3545';

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton
            icon={isDarkMode ? 'white-balance-sunny' : 'weather-night'}
            onPress={toggleTheme}
            iconColor={colors.text}
            size={24}
          />
          <IconButton
            icon="magnify"
            onPress={() => navigation.navigate('JobFinder')}
            iconColor={colors.text}
            size={24}
            testID="searchJobsButton"
          />
        </View>
      ),
    });
  }, [navigation, isDarkMode, colors.text]);

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

  const handleApply = (jobId: string) => {
    navigation.navigate('ApplicationForm', {
      jobId,
      fromSavedJobs: true,
    });
  };

  const confirmRemove = (jobId: string) => {
    Alert.alert(
      'Remove Job',
      'Are you sure you want to remove this job from your saved jobs?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: () => removeJob(jobId) },
      ]
    );
  };

  const formatSalary = (min: number | null, max: number | null): string => {
    if (min === null && max === null) return 'Not specified';
    if (min === null) return `Up to $${max}`;
    if (max === null) return `From $${min}`;
    return `$${min} - $${max}`;
  };

  const renderJobItem = ({ item }: { item: Job }) => {
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
        testID={`savedJob-${item.id}`}>
        <Text style={[styles.jobTitle, { color: colors.text }]}>
          {item.title}
        </Text>
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
            styles.removeButton,
            {
            backgroundColor: (colors as any).error ?? errorColor,
            borderColor: colors.border,
            },
        ]}
        onPress={() => confirmRemove(item.id)}
        testID={`removeButton-${item.id}`}>
        <Text style={[styles.buttonText, { color: '#fff' }]}>
            Remove
        </Text>
        </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => handleApply(item.id)}
            testID={`applyButton-${item.id}`}>
            <Text style={[styles.buttonText, { color: '#fff' }]}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {savedJobs.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No saved jobs yet
            </Text>
            <TouchableOpacity
              style={[
                styles.browseButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => navigation.navigate('JobFinder')}>
              <Text style={[styles.browseButtonText, { color: '#fff' }]}>
                Browse Jobs
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={savedJobs}
            keyExtractor={(item) => item.id}
            renderItem={renderJobItem}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={<View style={styles.footer} />}
            testID="savedJobsList"
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 20,
  },
  browseButton: {
    padding: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  footer: {
    height: 16,
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
  removeButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SavedJobsScreen;