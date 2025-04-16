import { useState, useEffect, useRef, useCallback } from 'react';

interface WorkerMessage {
  type: string;
  data: any;
}

interface CurvePointsRequest {
  controlMean: number;
  controlStdDev: number;
  testMean: number;
  testStdDev: number;
  minX: number;
  maxX: number;
  stepSize: number;
  confidenceLevel: number;
  isTwoSided: boolean;
}

interface TestStrengthRequest {
  pValue: number;
  alpha: number;
}

export interface CurvePointsResponse {
  controlPoints: [number, number][];
  testPoints: [number, number][];
  maxY: number;
  criticalX: number;
  criticalZ: number;
  minX: number;
  maxX: number;
}

export interface TestStrengthResponse {
  strength: number;
}

export type WorkerResponse = CurvePointsResponse | TestStrengthResponse;

// Type guard to check if response is a CurvePointsResponse
export function isCurvePointsResponse(response: any): response is CurvePointsResponse {
  return response && 
    Array.isArray(response.controlPoints) && 
    Array.isArray(response.testPoints) &&
    typeof response.maxY === 'number' &&
    typeof response.criticalX === 'number';
}

// Type guard to check if response is a TestStrengthResponse
export function isTestStrengthResponse(response: any): response is TestStrengthResponse {
  return response && typeof response.strength === 'number';
}

/**
 * Custom hook for offloading visualization calculations to a web worker
 */
function useVisualizationWorker() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WorkerResponse | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // Initialize worker on first render
  useEffect(() => {
    try {
      // Create a worker if it doesn't exist
      if (!workerRef.current && typeof Worker !== 'undefined') {
        workerRef.current = new Worker('/visualization-worker.js');
        
        // Set up message handler
        workerRef.current.onmessage = (e: MessageEvent) => {
          // Check for errors
          if (e.data.error) {
            setError(e.data.error);
            setLoading(false);
            return;
          }
          
          // Set result and clear loading state
          setResult(e.data);
          setLoading(false);
        };
        
        // Set up error handler
        workerRef.current.onerror = (e: ErrorEvent) => {
          setError(e.message);
          setLoading(false);
        };
      }
    } catch (err) {
      console.error('Failed to create web worker:', err);
      setError('Failed to initialize visualization calculations');
      setLoading(false);
    }
    
    // Clean up worker on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Function to generate curve points
  const generateCurvePoints = useCallback(
    (request: CurvePointsRequest) => {
      if (!workerRef.current) {
        setError('Worker not available');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      const message: WorkerMessage = {
        type: 'generateCurvePoints',
        data: request
      };
      
      workerRef.current.postMessage(message);
    },
    []
  );

  // Function to calculate test strength
  const calculateTestStrength = useCallback(
    (request: TestStrengthRequest) => {
      if (!workerRef.current) {
        setError('Worker not available');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      const message: WorkerMessage = {
        type: 'calculateTestStrength',
        data: request
      };
      
      workerRef.current.postMessage(message);
    },
    []
  );

  return {
    loading,
    error,
    result,
    generateCurvePoints,
    calculateTestStrength,
    // Provide a fallback function when Web Workers aren't available
    isWorkerAvailable: typeof Worker !== 'undefined' && workerRef.current !== null
  };
}

export default useVisualizationWorker; 