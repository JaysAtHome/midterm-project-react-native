import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Job } from '../types/jobtypes';

interface SavedJobsContextType {
  savedJobs: Job[];
  saveJob: (job: Job) => Promise<void>;
  removeJob: (jobId: string) => Promise<void>;
  isJobSaved: (jobId: string) => boolean;
}

const SavedJobsContext = createContext<SavedJobsContextType | undefined>(undefined);

interface SavedJobsProviderProps {
  children: React.ReactNode;
}

export const SavedJobsProvider: React.FC<SavedJobsProviderProps> = ({ children }) => {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);

  useEffect(() => {
    const loadSavedJobs = async () => {
      try {
        const storedJobs = await AsyncStorage.getItem('savedJobs');
        if (storedJobs) {
          setSavedJobs(JSON.parse(storedJobs));
        }
      } catch (error) {
        console.error('Failed to load saved jobs:', error);
      }
    };
    loadSavedJobs();
  }, []);

  const saveJob = useCallback(async (job: Job) => {
    try {
      const isAlreadySaved = savedJobs.some(savedJob => 
        savedJob.id === job.id || 
        (savedJob.title === job.title && savedJob.companyName === job.companyName)
      );
      
      if (!isAlreadySaved) {
        const updatedJobs = [...savedJobs, job];
        setSavedJobs(updatedJobs);
        await AsyncStorage.setItem('savedJobs', JSON.stringify(updatedJobs));
      }
    } catch (error) {
      console.error('Failed to save job:', error);
    }
  }, [savedJobs]);

  const removeJob = useCallback(async (jobId: string) => {
    try {
      const updatedJobs = savedJobs.filter(job => job.id !== jobId);
      setSavedJobs(updatedJobs);
      await AsyncStorage.setItem('savedJobs', JSON.stringify(updatedJobs));
    } catch (error) {
      console.error('Failed to remove job:', error);
    }
  }, [savedJobs]);

  const isJobSaved = useCallback((jobId: string) => {
    return savedJobs.some(job => job.id === jobId);
  }, [savedJobs]);

  const contextValue = {
    savedJobs,
    saveJob,
    removeJob,
    isJobSaved
  };

  return (
    <SavedJobsContext.Provider value={contextValue}>
      {children}
    </SavedJobsContext.Provider>
  );
};

export const useSavedJobs = () => {
  const context = useContext(SavedJobsContext);
  if (!context) {
    throw new Error('useSavedJobs must be used within a SavedJobsProvider');
  }
  return context;
};