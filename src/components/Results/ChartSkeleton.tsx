import React from 'react';
import styled, { keyframes } from 'styled-components';

interface ChartSkeletonProps {
  height?: number;
  style?: React.CSSProperties;
}

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const SkeletonContainer = styled.div<{ height: number }>`
  width: 100%;
  height: ${({ height }) => `${height}px`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  position: relative;
  overflow: hidden;
`;

const SkeletonBase = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.background};
`;

const SkeletonShimmer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const SkeletonAxis = styled.div`
  position: absolute;
  background-color: ${({ theme }) => theme.colors.border};
  opacity: 0.5;
`;

const SkeletonXAxis = styled(SkeletonAxis)`
  left: 10%;
  right: 5%;
  bottom: 15%;
  height: 2px;
`;

const SkeletonYAxis = styled(SkeletonAxis)`
  left: 10%;
  top: 10%;
  width: 2px;
  bottom: 15%;
`;

const SkeletonCurve = styled.div<{ color: string }>`
  position: absolute;
  height: 35%;
  width: 80%;
  left: 15%;
  top: 30%;
  border-radius: 50% 50% 0 0;
  border: 2px solid ${({ color }) => color};
  border-bottom: none;
  opacity: 0.3;
`;

const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ height = 250, style }) => {
  return (
    <SkeletonContainer height={height} style={style}>
      <SkeletonBase />
      
      {/* Chart structure */}
      <SkeletonXAxis />
      <SkeletonYAxis />
      
      {/* Curve suggestions */}
      <SkeletonCurve color="#4361ee" style={{ transform: 'scaleX(0.8) translateX(-10%)' }} />
      <SkeletonCurve color="#f72585" style={{ transform: 'scaleX(0.8) translateX(10%)' }} />
      
      {/* Shimmer effect */}
      <SkeletonShimmer />
    </SkeletonContainer>
  );
};

export default ChartSkeleton; 