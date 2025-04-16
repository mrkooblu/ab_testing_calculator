import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CurvePointsResponse, TestStrengthResponse } from '../hooks/useVisualizationWorker';

interface TabVisualizations {
  frequentist?: CurvePointsResponse;
  bayesian?: CurvePointsResponse;
  sequential?: CurvePointsResponse;
  segmentation?: CurvePointsResponse;
  [key: string]: CurvePointsResponse | undefined;
}

interface TabStrengths {
  frequentist?: TestStrengthResponse;
  bayesian?: TestStrengthResponse;
  sequential?: TestStrengthResponse;
  segmentation?: TestStrengthResponse;
  [key: string]: TestStrengthResponse | undefined;
}

interface VisualizationContextType {
  curveResults: TabVisualizations;
  strengthResults: TabStrengths;
  setCurveResult: (tabName: string, result: CurvePointsResponse) => void;
  setStrengthResult: (tabName: string, result: TestStrengthResponse) => void;
  getCurveResult: (tabName: string) => CurvePointsResponse | undefined;
  getStrengthResult: (tabName: string) => TestStrengthResponse | undefined;
  activeTab: string;
  setActiveTab: (tabName: string) => void;
  previousTab: string | null;
  isTabSwitching: boolean;
  preloadStatus: Record<string, 'pending' | 'loading' | 'loaded' | 'error'>;
  setPreloadStatus: (tabName: string, status: 'pending' | 'loading' | 'loaded' | 'error') => void;
}

const VisualizationContext = createContext<VisualizationContextType | undefined>(undefined);

export const VisualizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [curveResults, setCurveResults] = useState<TabVisualizations>({});
  const [strengthResults, setStrengthResults] = useState<TabStrengths>({});
  const [activeTab, setActiveTab] = useState<string>('frequentist');
  const [previousTab, setPreviousTab] = useState<string | null>(null);
  const [isTabSwitching, setIsTabSwitching] = useState<boolean>(false);
  const [preloadStatus, setPreloadStatusState] = useState<Record<string, 'pending' | 'loading' | 'loaded' | 'error'>>({
    frequentist: 'pending',
    bayesian: 'pending',
    sequential: 'pending',
    segmentation: 'pending',
  });

  // Handle tab switches with a slight debounce to track transition state
  useEffect(() => {
    if (activeTab !== previousTab) {
      setIsTabSwitching(true);
      setPreviousTab(activeTab);
      
      // Reset tab switching state quickly
      const timer = setTimeout(() => {
        setIsTabSwitching(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [activeTab, previousTab]);

  const setCurveResult = useCallback((tabName: string, result: CurvePointsResponse) => {
    setCurveResults(prev => ({
      ...prev,
      [tabName.toLowerCase()]: result
    }));
    // Update preload status
    setPreloadStatusState(prev => ({
      ...prev,
      [tabName.toLowerCase()]: 'loaded'
    }));
  }, []);

  const setStrengthResult = useCallback((tabName: string, result: TestStrengthResponse) => {
    setStrengthResults(prev => ({
      ...prev,
      [tabName.toLowerCase()]: result
    }));
  }, []);

  const getCurveResult = useCallback((tabName: string) => {
    return curveResults[tabName.toLowerCase()];
  }, [curveResults]);

  const getStrengthResult = useCallback((tabName: string) => {
    return strengthResults[tabName.toLowerCase()];
  }, [strengthResults]);

  const setPreloadStatus = useCallback((tabName: string, status: 'pending' | 'loading' | 'loaded' | 'error') => {
    setPreloadStatusState(prev => ({
      ...prev,
      [tabName.toLowerCase()]: status
    }));
  }, []);

  const value = {
    curveResults,
    strengthResults,
    setCurveResult,
    setStrengthResult,
    getCurveResult,
    getStrengthResult,
    activeTab,
    setActiveTab,
    previousTab,
    isTabSwitching,
    preloadStatus,
    setPreloadStatus
  };

  return (
    <VisualizationContext.Provider value={value}>
      {children}
    </VisualizationContext.Provider>
  );
};

export const useVisualization = () => {
  const context = useContext(VisualizationContext);
  if (context === undefined) {
    throw new Error('useVisualization must be used within a VisualizationProvider');
  }
  return context;
};

export default VisualizationContext; 