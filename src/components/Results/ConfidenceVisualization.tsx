import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { generateNormalCurvePoints, getCriticalZValue } from '../../utils/visualizationUtils';
import useVisualizationWorker, { isCurvePointsResponse, CurvePointsResponse } from '../../hooks/useVisualizationWorker';
import useInView from '../../hooks/useInView';
import ChartSkeleton from './ChartSkeleton';
import { useVisualization } from '../../context/VisualizationContext';

// SVG viewBox properties
const SVG_WIDTH = 600;
const SVG_HEIGHT = 250;
const PADDING = 40;

interface ConfidenceVisualizationProps {
  controlMean: number;
  controlStdDev: number;
  testMean: number;
  testStdDev: number;
  confidenceLevel: number;
  isTwoSided: boolean;
  isSignificant: boolean;
  controlType: string;
  testType: string;
}

// Update interface for worker request
interface ExtendedCurvePointsRequest {
  controlMean: number;
  controlStdDev: number;
  testMean: number;
  testStdDev: number;
  minX: number;
  maxX: number;
  stepSize: number;
  confidenceLevel: number;
  isTwoSided: boolean;
  cacheKey?: string;
}

// Styled components
const VisualizationContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.md} 0;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  position: relative;
  overflow: hidden;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.sm};
    margin: ${({ theme }) => theme.spacing.sm} 0;
  }
`;

const Title = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

const SVGContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  min-height: 200px;
  height: ${SVG_HEIGHT}px;
  position: relative;
`;

const PlaceholderSVG = styled.svg`
  width: 100%;
  height: ${SVG_HEIGHT}px;
  visibility: hidden;
  opacity: 0;
`;

const Legend = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    gap: ${({ theme }) => theme.spacing.sm};
    margin-top: ${({ theme }) => theme.spacing.sm};
  }
`;

const LegendItem = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  
  &::before {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${({ color }) => color};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
  }
`;

const SignificanceZone = styled.div<{ isSignificant: boolean }>`
  background-color: ${({ theme, isSignificant }) => 
    isSignificant ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'};
  border-left: 4px solid ${({ theme, isSignificant }) => 
    isSignificant ? theme.colors.success : theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme, isSignificant }) => 
    isSignificant ? theme.colors.success : theme.colors.error};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semiBold};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.xs};
    margin-top: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

// Responsive step sizes
const stepSize = window.innerWidth < 480 ? 50 : 100;

// Utility function to format percent values
const formatPercent = (value: number): string => {
  return (value * 100).toFixed(1) + '%';
};

const ConfidenceVisualization: React.FC<ConfidenceVisualizationProps> = ({
  controlMean,
  controlStdDev,
  testMean,
  testStdDev,
  confidenceLevel,
  isTwoSided,
  isSignificant,
  controlType,
  testType
}) => {
  // Get visualization context for caching
  const { 
    getCurveResult, 
    setCurveResult, 
    activeTab, 
    isTabSwitching,
    preloadStatus,
    setPreloadStatus
  } = useVisualization();
  
  // Add state variables
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [localData, setLocalData] = useState<CurvePointsResponse | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  
  // Refs for tracking timers and animation frames
  const timerRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  
  // Use Intersection Observer to detect when visualization is in view
  const { ref: containerRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  
  // Create worker hook for offloading calculations
  const {
    loading: workerLoading,
    error: workerError,
    result: workerResult,
    generateCurvePoints,
    resetState,
    isWorkerAvailable
  } = useVisualizationWorker();
  
  // Create a cache key for this specific visualization
  const cacheKey = useMemo(() => {
    return `${activeTab}_${controlMean}_${controlStdDev}_${testMean}_${testStdDev}_${confidenceLevel}_${isTwoSided}`;
  }, [activeTab, controlMean, controlStdDev, testMean, testStdDev, confidenceLevel, isTwoSided]);
  
  // Try to get cached result
  const cachedResult = useMemo(() => {
    return getCurveResult(activeTab);
  }, [getCurveResult, activeTab]);
  
  // Check if this is a tab switch with existing data
  const isInstantRender = useMemo(() => {
    return isTabSwitching && cachedResult !== undefined;
  }, [isTabSwitching, cachedResult]);
  
  // When the component comes into view, trigger data calculation
  useEffect(() => {
    if (inView && !isVisible) {
      setIsVisible(true);
      
      // If we have cached data for this tab, use it immediately
      if (cachedResult) {
        setLocalData(cachedResult);
        // Skip loading state for immediate display
        setLocalLoading(false);
        setIsReady(true);
        return;
      }
      
      // Otherwise set up for calculation
      if (preloadStatus[activeTab] !== 'loading') {
        setPreloadStatus(activeTab, 'loading');
        
        // Find the range for plot
        const minX = Math.min(controlMean, testMean) - Math.max(controlStdDev, testStdDev) * 3;
        const maxX = Math.max(controlMean, testMean) + Math.max(controlStdDev, testStdDev) * 3;
        
        // Reset previous state before starting new calculation
        resetState();
        setIsReady(false);
        
        // Calculate using web worker if available
        if (isWorkerAvailable) {
          generateCurvePoints({
            controlMean,
            controlStdDev,
            testMean,
            testStdDev,
            minX,
            maxX,
            stepSize,
            confidenceLevel,
            isTwoSided,
            cacheKey
          } as ExtendedCurvePointsRequest);
        }
      }
    }
  }, [
    inView, 
    isVisible, 
    activeTab, 
    cachedResult, 
    cacheKey, 
    controlMean, 
    controlStdDev, 
    testMean, 
    testStdDev, 
    confidenceLevel,
    isTwoSided, 
    generateCurvePoints, 
    isWorkerAvailable, 
    resetState,
    isTabSwitching,
    preloadStatus,
    setPreloadStatus
  ]);
  
  // When worker result comes in, save it to context
  useEffect(() => {
    if (workerResult && isCurvePointsResponse(workerResult)) {
      setLocalData(workerResult);
      setLocalLoading(false);
      // Store in context for tab switching
      setCurveResult(activeTab, workerResult);
    }
  }, [workerResult, activeTab, setCurveResult]);
  
  // Use a two-phase rendering approach with requestAnimationFrame
  useEffect(() => {
    if (!workerLoading && !localLoading && localData) {
      // First, cancel any existing timers/frames
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      
      // If we're switching tabs and have cached data, render immediately
      if (isInstantRender) {
        setIsReady(true);
        return;
      }
      
      // Phase 1: Delay to ensure worker data is fully processed
      timerRef.current = window.setTimeout(() => {
        // Phase 2: Wait for next animation frame to ensure browser has time
        // to fully calculate all SVG paths before showing anything
        frameRef.current = requestAnimationFrame(() => {
          frameRef.current = requestAnimationFrame(() => {
            setIsReady(true);
          });
        });
      }, 100); // Reduced delay for better performance
    } else {
      // Ensure we reset ready state when loading starts (unless tab switching)
      if (!isTabSwitching) {
        setIsReady(false);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    }
  }, [workerLoading, localLoading, localData, isInstantRender, isTabSwitching]);
  
  // Calculate the curve points client-side - fallback if web worker isn't available
  function calculateCurvePoints(controlMean: number, controlStdDev: number, testMean: number, testStdDev: number, stepSize: number): CurvePointsResponse {
    // Find the range for plot
    const minX = Math.min(controlMean, testMean) - Math.max(controlStdDev, testStdDev) * 3;
    const maxX = Math.max(controlMean, testMean) + Math.max(controlStdDev, testStdDev) * 3;
    
    // Generate points for both distributions
    const controlPoints = generateNormalCurvePoints(controlMean, controlStdDev, minX, maxX, stepSize);
    const testPoints = generateNormalCurvePoints(testMean, testStdDev, minX, maxX, stepSize);
    
    // Find max Y value for scaling
    let maxY = 0;
    for (let i = 0; i < controlPoints.length; i++) {
      if (controlPoints[i][1] > maxY) maxY = controlPoints[i][1];
    }
    for (let i = 0; i < testPoints.length; i++) {
      if (testPoints[i][1] > maxY) maxY = testPoints[i][1];
    }
    
    // Calculate critical value
    const criticalZ = getCriticalZValue(confidenceLevel, isTwoSided);
    const criticalX = controlMean + criticalZ * controlStdDev;
    
    return {
      controlPoints,
      testPoints,
      maxY,
      criticalX,
      criticalZ,
      minX,
      maxX
    };
  }
  
  // Destructure data if available, or use defaults for memoization
  const { 
    controlPoints = [], 
    testPoints = [], 
    minX = 0, 
    maxX = 0, 
    maxY = 0, 
    criticalX = 0 
  } = localData || {};
  
  // Scale functions to convert data points to SVG coordinates
  const xScale = (x: number) => 
    PADDING + ((x - minX) / (maxX - minX || 1)) * (SVG_WIDTH - 2 * PADDING);
  
  const yScale = (y: number) =>
    SVG_HEIGHT - PADDING - (y / (maxY || 1)) * (SVG_HEIGHT - 2 * PADDING);
  
  // Pre-calculate all path data before rendering to prevent partial renders
  const controlPathData = useMemo(() => {
    if (!localData || !controlPoints.length) return '';
    return controlPoints.map((point: [number, number], i: number) => {
      const [x, y] = point;
      const svgX = xScale(x);
      const svgY = yScale(y);
      return (i === 0 ? `M ${svgX} ${svgY}` : `L ${svgX} ${svgY}`);
    }).join(' ');
  }, [localData, controlPoints, xScale, yScale]);
  
  const testPathData = useMemo(() => {
    if (!localData || !testPoints.length) return '';
    return testPoints.map((point: [number, number], i: number) => {
      const [x, y] = point;
      const svgX = xScale(x);
      const svgY = yScale(y);
      return (i === 0 ? `M ${svgX} ${svgY}` : `L ${svgX} ${svgY}`);
    }).join(' ');
  }, [localData, testPoints, xScale, yScale]);
  
  // Add bottom line to close the path for filling - also memoized
  const closedControlPathData = useMemo(() => {
    if (!localData || !controlPathData) return '';
    return `${controlPathData} L ${xScale(maxX)} ${yScale(0)} L ${xScale(minX)} ${yScale(0)} Z`;
  }, [localData, controlPathData, xScale, yScale, maxX, minX]);
  
  const closedTestPathData = useMemo(() => {
    if (!localData || !testPathData) return '';
    return `${testPathData} L ${xScale(maxX)} ${yScale(0)} L ${xScale(minX)} ${yScale(0)} Z`;
  }, [localData, testPathData, xScale, yScale, maxX, minX]);
  
  // Calculate the SVG coordinates for the critical value line
  const criticalLineX = localData ? xScale(criticalX) : 0;
  
  // If there's an error, show error message
  if (workerError) {
    return (
      <VisualizationContainer ref={containerRef}>
        <Title>Distribution Comparison</Title>
        <ErrorMessage>
          Error loading visualization: {workerError}
        </ErrorMessage>
      </VisualizationContainer>
    );
  }
  
  // If loading or no data, show skeleton
  if (localLoading || !localData) {
    return (
      <VisualizationContainer ref={containerRef}>
        <Title>Distribution Comparison</Title>
        <ChartSkeleton height={SVG_HEIGHT} variant="general" />
      </VisualizationContainer>
    );
  }
  
  // Optimize SVG rendering with explicit attributes and add smooth fade-in with visibility
  return (
    <VisualizationContainer 
      ref={containerRef} 
      style={{ 
        opacity: isReady ? 1 : 0, 
        transition: 'opacity 0.4s ease-in-out'
      }}
    >
      <Title>Distribution Comparison</Title>
      
      <SVGContainer>
        {/* Invisible placeholder to maintain dimensions */}
        <PlaceholderSVG 
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
        />
        
        <svg 
          width="100%" 
          height={SVG_HEIGHT} 
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} 
          preserveAspectRatio="xMidYMid meet"
          style={{ 
            overflow: 'hidden',
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: isReady ? 1 : 0,
            visibility: isReady ? 'visible' : 'hidden',
            display: isReady ? 'block' : 'none' // Completely remove from rendering pipeline
          }}
          shapeRendering="optimizeSpeed" 
          textRendering="optimizeSpeed"
        >
          {/* X-axis */}
          <line
            x1={PADDING}
            y1={SVG_HEIGHT - PADDING}
            x2={SVG_WIDTH - PADDING}
            y2={SVG_HEIGHT - PADDING}
            stroke="#ccc"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Y-axis */}
          <line
            x1={PADDING}
            y1={PADDING}
            x2={PADDING}
            y2={SVG_HEIGHT - PADDING}
            stroke="#ccc"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Control distribution */}
          <path
            d={closedControlPathData}
            fill="rgba(67, 97, 238, 0.2)"
            stroke="none"
          />
          <path
            d={controlPathData}
            fill="none"
            stroke="#4361ee"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Test distribution */}
          <path
            d={closedTestPathData}
            fill="rgba(247, 37, 133, 0.2)"
            stroke="none"
          />
          <path
            d={testPathData}
            fill="none"
            stroke="#f72585"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Critical value line */}
          <line
            x1={criticalLineX}
            y1={PADDING}
            x2={criticalLineX}
            y2={SVG_HEIGHT - PADDING}
            stroke={isSignificant ? "#4caf50" : "#f44336"}
            strokeWidth="2"
            strokeDasharray="5,5"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Mean markers */}
          <circle
            cx={xScale(controlMean)}
            cy={yScale(0)}
            r={window.innerWidth < 480 ? "3" : "4"}
            fill="#4361ee"
          />
          <circle
            cx={xScale(testMean)}
            cy={yScale(0)}
            r={window.innerWidth < 480 ? "3" : "4"}
            fill="#f72585"
          />
          
          {/* X-axis labels - only show on larger screens */}
          {window.innerWidth >= 480 && (
            <>
              <text
                x={xScale(controlMean)}
                y={SVG_HEIGHT - PADDING + 20}
                textAnchor="middle"
                fontSize="10"
              >
                {controlMean.toFixed(2)}%
              </text>
              <text
                x={xScale(testMean)}
                y={SVG_HEIGHT - PADDING + 20}
                textAnchor="middle"
                fontSize="10"
              >
                {testMean.toFixed(2)}%
              </text>
            </>
          )}
          
          {/* Critical value label - simplified on mobile */}
          <text
            x={criticalLineX}
            y={PADDING - 10}
            textAnchor="middle"
            fontSize={window.innerWidth < 480 ? "8" : "10"}
            fill={isSignificant ? "#4caf50" : "#f44336"}
          >
            {window.innerWidth < 480 ? `${confidenceLevel}%` : `${confidenceLevel}% Threshold`}
          </text>
        </svg>
      </SVGContainer>
      
      <Legend>
        <LegendItem color="#4361ee">Variant {controlType} ({formatPercent(controlMean)})</LegendItem>
        <LegendItem color="#f72585">Variant {testType} ({formatPercent(testMean)})</LegendItem>
      </Legend>
      
      <SignificanceZone isSignificant={isSignificant}>
        {isSignificant
          ? `Result is statistically significant at ${confidenceLevel}% confidence level`
          : `Result is not statistically significant at ${confidenceLevel}% confidence level`}
      </SignificanceZone>
    </VisualizationContainer>
  );
};

export default ConfidenceVisualization; 