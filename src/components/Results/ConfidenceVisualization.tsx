import React, { useMemo, useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { generateNormalCurvePoints, getCriticalZValue } from '../../utils/visualizationUtils';
import useVisualizationWorker, { isCurvePointsResponse } from '../../hooks/useVisualizationWorker';
import useInView from '../../hooks/useInView';
import ChartSkeleton from './ChartSkeleton';

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

// SVG viewBox properties
const SVG_WIDTH = 600;
const SVG_HEIGHT = 250;
const PADDING = 40;

// Responsive step sizes
const getStepSize = () => {
  // Use fewer points on mobile for better performance
  if (window.innerWidth < 480) {
    return 20; // Much fewer points for small mobile devices
  } else if (window.innerWidth < 768) {
    return 35; // Fewer points for larger mobile devices
  }
  return 100; // Default for desktop
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
  testType,
}) => {
  // Use Intersection Observer to detect when visualization is in view
  const { ref: containerRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '100px',
  });
  
  // State for responsive behavior
  const [stepSize, setStepSize] = useState(getStepSize());
  const [isVisible, setIsVisible] = useState(false);
  
  // Reference for frame request
  const frameRef = useRef<number | null>(null);
  
  // Use our web worker hook
  const { 
    loading: workerLoading, 
    error: workerError, 
    result: workerResult,
    generateCurvePoints,
    isWorkerAvailable
  } = useVisualizationWorker();
  
  // Update step size when window resizes
  useEffect(() => {
    const handleResize = () => {
      setStepSize(getStepSize());
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);
  
  // When the component comes into view, trigger data calculation
  useEffect(() => {
    if (inView && !isVisible) {
      setIsVisible(true);
      
      // Find the range for plot
      const minX = Math.min(controlMean, testMean) - Math.max(controlStdDev, testStdDev) * 3;
      const maxX = Math.max(controlMean, testMean) + Math.max(controlStdDev, testStdDev) * 3;
      
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
          isTwoSided
        });
      }
    }
  }, [
    inView, isVisible, controlMean, controlStdDev, testMean, testStdDev, 
    stepSize, confidenceLevel, isTwoSided, generateCurvePoints, isWorkerAvailable
  ]);
  
  // Fallback to client-side calculation if worker isn't available
  const clientSideData = useMemo(() => {
    // Skip calculation if worker is available or component not in view
    if (isWorkerAvailable || !isVisible) {
      return null;
    }
    
    // Find the range for plot
    const minX = Math.min(controlMean, testMean) - Math.max(controlStdDev, testStdDev) * 3;
    const maxX = Math.max(controlMean, testMean) + Math.max(controlStdDev, testStdDev) * 3;
    
    // Generate points for both curves with responsive step size
    const controlPoints = generateNormalCurvePoints(controlMean, controlStdDev, minX, maxX, stepSize);
    const testPoints = generateNormalCurvePoints(testMean, testStdDev, minX, maxX, stepSize);
    
    // Find max Y value for scaling
    const maxY = Math.max(
      ...controlPoints.map(([_, y]) => y),
      ...testPoints.map(([_, y]) => y)
    );
    
    // Calculate critical value for confidence level
    const criticalZ = getCriticalZValue(confidenceLevel, isTwoSided);
    
    // Calculate critical X value
    const criticalX = controlMean + criticalZ * controlStdDev;
    
    return {
      controlPoints,
      testPoints,
      minX,
      maxX,
      maxY,
      criticalX,
      criticalZ
    };
  }, [
    controlMean, controlStdDev, testMean, testStdDev, 
    stepSize, confidenceLevel, isTwoSided, isWorkerAvailable, isVisible
  ]);
  
  // Choose which dataset to use (worker or client-side)
  const workerData = isWorkerAvailable && workerResult && isCurvePointsResponse(workerResult) 
    ? workerResult 
    : null;
    
  const data = isWorkerAvailable ? workerData : clientSideData;
  const loading = isWorkerAvailable ? workerLoading || !workerData : !clientSideData;
  const error = isWorkerAvailable ? workerError : null;
  
  // If there's an error, show error message
  if (error) {
    return (
      <VisualizationContainer ref={containerRef}>
        <Title>Distribution Comparison</Title>
        <ErrorMessage>
          Error loading visualization: {error}
        </ErrorMessage>
      </VisualizationContainer>
    );
  }
  
  // If loading or no data, show skeleton
  if (loading || !data) {
    return (
      <VisualizationContainer ref={containerRef}>
        <Title>Distribution Comparison</Title>
        <ChartSkeleton height={SVG_HEIGHT} />
      </VisualizationContainer>
    );
  }
  
  // Destructure data
  const { controlPoints, testPoints, minX, maxX, maxY, criticalX } = data;
  
  // Scale functions to convert data points to SVG coordinates
  const xScale = (x: number) => 
    PADDING + ((x - minX) / (maxX - minX)) * (SVG_WIDTH - 2 * PADDING);
  
  const yScale = (y: number) =>
    SVG_HEIGHT - PADDING - (y / maxY) * (SVG_HEIGHT - 2 * PADDING);
  
  // Create path data strings - optimized to process only once
  const createPathData = (points: [number, number][]) => {
    return points.map((point, i) => {
      const [x, y] = point;
      const svgX = xScale(x);
      const svgY = yScale(y);
      return (i === 0 ? `M ${svgX} ${svgY}` : `L ${svgX} ${svgY}`);
    }).join(' ');
  };
  
  // Path data for both curves
  const controlPathData = createPathData(controlPoints);
  const testPathData = createPathData(testPoints);
  
  // Add bottom line to close the path for filling
  const closedControlPathData = `${controlPathData} L ${xScale(maxX)} ${yScale(0)} L ${xScale(minX)} ${yScale(0)} Z`;
  const closedTestPathData = `${testPathData} L ${xScale(maxX)} ${yScale(0)} L ${xScale(minX)} ${yScale(0)} Z`;
  
  // Calculate the SVG coordinates for the critical value line
  const criticalLineX = xScale(criticalX);
  
  // Optimize SVG rendering with explicit attributes
  return (
    <VisualizationContainer ref={containerRef}>
      <Title>Distribution Comparison</Title>
      
      <SVGContainer>
        <svg 
          width="100%" 
          height={SVG_HEIGHT} 
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} 
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: 'hidden' }}
          shape-rendering="optimizeSpeed" 
          text-rendering="optimizeSpeed"
        >
          {/* X-axis */}
          <line
            x1={PADDING}
            y1={SVG_HEIGHT - PADDING}
            x2={SVG_WIDTH - PADDING}
            y2={SVG_HEIGHT - PADDING}
            stroke="#ccc"
            strokeWidth="1"
            vector-effect="non-scaling-stroke"
          />
          
          {/* Y-axis */}
          <line
            x1={PADDING}
            y1={PADDING}
            x2={PADDING}
            y2={SVG_HEIGHT - PADDING}
            stroke="#ccc"
            strokeWidth="1"
            vector-effect="non-scaling-stroke"
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
            vector-effect="non-scaling-stroke"
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
            vector-effect="non-scaling-stroke"
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
            vector-effect="non-scaling-stroke"
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
        <LegendItem color="#4361ee">Variant {controlType}</LegendItem>
        <LegendItem color="#f72585">Variant {testType}</LegendItem>
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