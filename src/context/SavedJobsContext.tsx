import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Job {
  id: string;
  title: string;
  companyName: string;
  description: string;
  minSalary: number | null;
  maxSalary: number | null;
}

interface SavedJobsContextType {
  savedJobs: Job[];
  savedJobsCount: number;
  saveJob: (job: Job) => void;
  removeJob: (jobId: string) => void;
  isJobSaved: (jobId: string) => boolean; // New helper function
}

const SavedJobsContext = createContext<SavedJobsContextType | undefined>(undefined);

export const SavedJobsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);

  // Load saved jobs from storage on initial render
  useEffect(() => {
    const loadSavedJobs = async () => {
      try {
        const saved = await AsyncStorage.getItem('savedJobs');
        if (saved) setSavedJobs(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved jobs:', error);
      }
    };
    loadSavedJobs();
  }, []);

  // Persist jobs to storage whenever they change
  useEffect(() => {
    const saveJobsToStorage = async () => {
      try {
        await AsyncStorage.setItem('savedJobs', JSON.stringify(savedJobs));
      } catch (error) {
        console.error('Failed to save jobs:', error);
      }
    };
    saveJobsToStorage();
  }, [savedJobs]);

  const saveJob = (job: Job) => {
    setSavedJobs((prev) => 
      prev.some((saved) => saved.id === job.id) ? prev : [...prev, job]
    );
  };

  const removeJob = (jobId: string) => {
    setSavedJobs((prev) => prev.filter((job) => job.id !== jobId));
  };

  const isJobSaved = (jobId: string) => {
    return savedJobs.some((job) => job.id === jobId);
  };

  return (
    <SavedJobsContext.Provider 
      value={{
        savedJobs,
        savedJobsCount: savedJobs.length,
        saveJob,
        removeJob,
        isJobSaved
      }}
    >
      {children}
    </SavedJobsContext.Provider>
  );
};

export const useSavedJobs = (): SavedJobsContextType => {
  const context = useContext(SavedJobsContext);
  if (!context) {
    throw new Error("useSavedJobs must be used within a SavedJobsProvider");
  }
  return context;
};