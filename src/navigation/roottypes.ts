import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  JobFinder: undefined;
  SavedJobs: undefined;
  ApplicationForm: {
    jobId: string;
    fromSavedJobs: boolean;
  };
};

export type ApplicationFormScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'ApplicationForm'>;
  route: RouteProp<RootStackParamList, 'ApplicationForm'>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}