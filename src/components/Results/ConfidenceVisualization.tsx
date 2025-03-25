import React, { useMemo } from 'react';
import styled from 'styled-components';
import { generateNormalCurvePoints, getCriticalZValue } from '../../utils/visualizationUtils';

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
`;

const Title = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`;

const SVGContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const Legend = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
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
`;

// SVG viewBox properties
const SVG_WIDTH = 600;
const SVG_HEIGHT = 250;
const PADDING = 40;

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
  // Generate points for curves
  const memoizedData = useMemo(() => {
    // Find the range for plot
    const minX = Math.min(controlMean, testMean) - Math.max(controlStdDev, testStdDev) * 3;
    const maxX = Math.max(controlMean, testMean) + Math.max(controlStdDev, testStdDev) * 3;
    
    // Generate points for both curves
    const controlPoints = generateNormalCurvePoints(controlMean, controlStdDev, minX, maxX);
    const testPoints = generateNormalCurvePoints(testMean, testStdDev, minX, maxX);
    
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
  }, [controlMean, controlStdDev, testMean, testStdDev, confidenceLevel, isTwoSided]);
  
  const { controlPoints, testPoints, minX, maxX, maxY, criticalX } = memoizedData;
  
  // Scale functions to convert data points to SVG coordinates
  const xScale = (x: number) => 
    PADDING + ((x - minX) / (maxX - minX)) * (SVG_WIDTH - 2 * PADDING);
  
  const yScale = (y: number) =>
    SVG_HEIGHT - PADDING - (y / maxY) * (SVG_HEIGHT - 2 * PADDING);
  
  // Create path data strings
  const createPathData = (points: [number, number][]) => {
    return points.map((point, i) => {
      const [x, y] = point;
      const svgX = xScale(x);
      const svgY = yScale(y);
      return (i === 0 ? `M ${svgX} ${svgY}` : `L ${svgX} ${svgY}`);
    }).join(' ');
  };
  
  const controlPathData = createPathData(controlPoints);
  const testPathData = createPathData(testPoints);
  
  // Add bottom line to close the path for filling
  const closedControlPathData = `${controlPathData} L ${xScale(maxX)} ${yScale(0)} L ${xScale(minX)} ${yScale(0)} Z`;
  const closedTestPathData = `${testPathData} L ${xScale(maxX)} ${yScale(0)} L ${xScale(minX)} ${yScale(0)} Z`;
  
  // Calculate the SVG coordinates for the critical value line
  const criticalLineX = xScale(criticalX);
  
  return (
    <VisualizationContainer>
      <Title>Distribution Comparison</Title>
      
      <SVGContainer>
        <svg width="100%" height={SVG_HEIGHT} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="xMidYMid meet">
          {/* X-axis */}
          <line
            x1={PADDING}
            y1={SVG_HEIGHT - PADDING}
            x2={SVG_WIDTH - PADDING}
            y2={SVG_HEIGHT - PADDING}
            stroke="#ccc"
            strokeWidth="1"
          />
          
          {/* Y-axis */}
          <line
            x1={PADDING}
            y1={PADDING}
            x2={PADDING}
            y2={SVG_HEIGHT - PADDING}
            stroke="#ccc"
            strokeWidth="1"
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
          />
          
          {/* Mean markers */}
          <circle
            cx={xScale(controlMean)}
            cy={yScale(0)}
            r="4"
            fill="#4361ee"
          />
          <circle
            cx={xScale(testMean)}
            cy={yScale(0)}
            r="4"
            fill="#f72585"
          />
          
          {/* X-axis labels */}
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
          
          {/* Critical value label */}
          <text
            x={criticalLineX}
            y={PADDING - 10}
            textAnchor="middle"
            fontSize="10"
            fill={isSignificant ? "#4caf50" : "#f44336"}
          >
            {confidenceLevel}% Confidence
          </text>
        </svg>
      </SVGContainer>
      
      <Legend>
        <LegendItem color="#4361ee">Variant {controlType}</LegendItem>
        <LegendItem color="#f72585">Variant {testType}</LegendItem>
        <LegendItem color={isSignificant ? "#4caf50" : "#f44336"}>
          {confidenceLevel}% Threshold
        </LegendItem>
      </Legend>
      
      <SignificanceZone isSignificant={isSignificant}>
        {isSignificant
          ? "The difference between variants is statistically significant!"
          : "The difference between variants is not statistically significant yet."
        }
      </SignificanceZone>
    </VisualizationContainer>
  );
};

export default ConfidenceVisualization; 