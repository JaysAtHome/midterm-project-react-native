import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './src/navigation/roottypes';
import { ThemeProvider } from './src/context/ThemeContext';
import JobFinderScreen from './src/screens/JobFinderScreen';
import SavedJobsScreen from './src/screens/SavedJobsScreen';
import ApplicationForm from './src/screens/ApplicationForm';
import { SavedJobsProvider } from './src/context/SavedJobsContext';
import { useTheme } from './/src/context/ThemeContext';
const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  const { theme } = useTheme();
  return (
    <ThemeProvider>
      <SavedJobsProvider>
        <NavigationContainer theme={theme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack.Navigator 
            initialRouteName="JobFinder"
            screenOptions={{
              headerTitleAlign: 'center', // This centers all screen titles
            }}
          >
            <Stack.Screen 
              name="JobFinder" 
              component={JobFinderScreen} 
              options={{ title: 'Job Finder' }}
            />
            <Stack.Screen 
              name="SavedJobs" 
              component={SavedJobsScreen}
              options={{ title: 'Saved Jobs' }}
            />
            <Stack.Screen 
              name="ApplicationForm" 
              component={ApplicationForm}
              options={{ title: 'Application' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SavedJobsProvider>
    </ThemeProvider>
  );
};

export default App;