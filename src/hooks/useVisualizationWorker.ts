import { useState, useEffect, useRef, useCallback } from 'react';

interface WorkerMessage {
  type: string;
  data: any;
  requestId?: string; // Add request ID to match responses with requests
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

// Cache for visualization results to avoid recalculation
interface CachedResult {
  key: string;
  result: WorkerResponse;
  timestamp: number;
}

/**
 * Custom hook for offloading visualization calculations to a web worker
 * with improved caching and cancellation support
 */
function useVisualizationWorker() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WorkerResponse | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const currentRequestIdRef = useRef<string | null>(null); // Track current request ID
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, CachedResult>>(new Map());
  
  // Generate unique request IDs
  const generateRequestId = () => `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Generate cache key based on request parameters
  const generateCacheKey = (type: string, params: any): string => {
    return `${type}_${JSON.stringify(params)}`;
  };

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
          
          // Verify this is the response to our most recent request
          if (e.data.requestId && e.data.requestId === currentRequestIdRef.current) {
            // Cache the result
            if (e.data.cacheKey) {
              cacheRef.current.set(e.data.cacheKey, {
                key: e.data.cacheKey,
                result: e.data,
                timestamp: Date.now()
              });
              
              // Limit cache size to 50 items
              if (cacheRef.current.size > 50) {
                // Delete oldest entry
                let oldestKey: string | null = null;
                let oldestTime = Date.now();
                
                cacheRef.current.forEach((value, key) => {
                  if (value.timestamp < oldestTime) {
                    oldestTime = value.timestamp;
                    oldestKey = key;
                  }
                });
                
                if (oldestKey) {
                  cacheRef.current.delete(oldestKey);
                }
              }
            }
            
            // Set result and clear loading state
            setResult(e.data);
            setLoading(false);
          }
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
      cancelCurrentRequest();
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);
  
  // Helper to cancel current request
  const cancelCurrentRequest = useCallback(() => {
    currentRequestIdRef.current = null;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);
  
  // Reset hook state when component unmounts or changes
  const resetState = useCallback(() => {
    setLoading(true);
    setError(null);
    setResult(null);
    cancelCurrentRequest();
  }, [cancelCurrentRequest]);

  // Function to generate curve points
  const generateCurvePoints = useCallback(
    (request: CurvePointsRequest) => {
      if (!workerRef.current) {
        setError('Worker not available');
        return;
      }
      
      // Cancel any existing request
      cancelCurrentRequest();
      
      // Check cache first
      const cacheKey = generateCacheKey('curvePoints', request);
      const cachedResult = cacheRef.current.get(cacheKey);
      
      if (cachedResult) {
        setResult(cachedResult.result);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      // Set up new abort controller
      abortControllerRef.current = new AbortController();
      
      // Generate new request ID
      const requestId = generateRequestId();
      currentRequestIdRef.current = requestId;
      
      const message: WorkerMessage = {
        type: 'generateCurvePoints',
        data: { ...request, cacheKey },
        requestId
      };
      
      workerRef.current.postMessage(message);
    },
    [cancelCurrentRequest]
  );

  // Function to calculate test strength
  const calculateTestStrength = useCallback(
    (request: TestStrengthRequest) => {
      if (!workerRef.current) {
        setError('Worker not available');
        return;
      }
      
      // Cancel any existing request
      cancelCurrentRequest();
      
      // Check cache first
      const cacheKey = generateCacheKey('testStrength', request);
      const cachedResult = cacheRef.current.get(cacheKey);
      
      if (cachedResult) {
        setResult(cachedResult.result);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      // Set up new abort controller
      abortControllerRef.current = new AbortController();
      
      // Generate new request ID
      const requestId = generateRequestId();
      currentRequestIdRef.current = requestId;
      
      const message: WorkerMessage = {
        type: 'calculateTestStrength',
        data: { ...request, cacheKey },
        requestId
      };
      
      workerRef.current.postMessage(message);
    },
    [cancelCurrentRequest]
  );

  return {
    loading,
    error,
    result,
    generateCurvePoints,
    calculateTestStrength,
    resetState,
    cancelCurrentRequest,
    // Provide a fallback function when Web Workers aren't available
    isWorkerAvailable: typeof Worker !== 'undefined' && workerRef.current !== null
  };
}

export default useVisualizationWorker; 