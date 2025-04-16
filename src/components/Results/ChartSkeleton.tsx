import React from 'react';
import styled, { keyframes } from 'styled-components';

interface ChartSkeletonProps {
  height?: number;
  style?: React.CSSProperties;
  variant?: 'distribution' | 'strength' | 'general';
  animate?: boolean;
}

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 0.6;
  }
`;

const SkeletonContainer = styled.div<{ height: number; animate?: boolean }>`
  width: 100%;
  height: ${({ height }) => `${height}px`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  position: relative;
  overflow: hidden;
  animation: ${fadeIn} 0.2s ease-in;
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

const SkeletonCurve = styled.div<{ color: string; left?: string; width?: string; height?: string; delay?: string }>`
  position: absolute;
  height: ${props => props.height || '35%'};
  width: ${props => props.width || '80%'};
  left: ${props => props.left || '15%'};
  top: 30%;
  border-radius: 50% 50% 0 0;
  border: 2px solid ${({ color }) => color};
  border-bottom: none;
  opacity: 0.3;
  animation: ${fadeIn} 0.3s ease-in;
  animation-delay: ${props => props.delay || '0s'};
`;

// Distribution version that matches the actual distribution chart
const DistributionSkeleton = ({ height }: { height: number }) => (
  <>
    <SkeletonXAxis />
    <SkeletonYAxis />
    {/* Replace curve outlines with rectangular placeholders to avoid the glitchy appearance */}
    <rect 
      x="10%" 
      y="30%" 
      width="80%" 
      height="10%" 
      rx="4" 
      fill="#f0f0f0"
    />
    <rect 
      x="10%" 
      y="50%" 
      width="80%" 
      height="10%" 
      rx="4" 
      fill="#f5f5f5"
    />
  </>
);

// Strength meter version that matches the test strength meter
const StrengthSkeleton = ({ height }: { height: number }) => (
  <>
    <div style={{ 
      position: 'absolute', 
      width: '80px', 
      height: '80px', 
      borderRadius: '50%', 
      border: '6px solid #eee',
      top: '50%',
      left: '15%',
      transform: 'translateY(-50%)'
    }} />
    <div style={{
      position: 'absolute',
      top: '30%',
      left: 'calc(15% + 100px)',
      width: '60%',
      height: '40%',
    }}>
      <div style={{ width: '70%', height: '8px', backgroundColor: '#eee', marginBottom: '12px', borderRadius: '4px' }} />
      <div style={{ width: '50%', height: '8px', backgroundColor: '#eee', marginBottom: '12px', borderRadius: '4px' }} />
      <div style={{ width: '60%', height: '8px', backgroundColor: '#eee', borderRadius: '4px' }} />
    </div>
  </>
);

// General purpose skeleton with minimal visual presence
const GeneralSkeleton = ({ height }: { height: number }) => (
  <>
    {/* Empty skeleton that takes space but shows nothing */}
    <SkeletonBase style={{ opacity: 0.1 }} />
  </>
);

const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ 
  height = 250, 
  style, 
  variant = 'distribution',
  animate = true 
}) => {
  return (
    <SkeletonContainer height={height} style={style} animate={animate}>
      <SkeletonBase />
      
      {/* Render appropriate skeleton based on variant */}
      {variant === 'distribution' && <DistributionSkeleton height={height} />}
      {variant === 'strength' && <StrengthSkeleton height={height} />}
      {variant === 'general' && <GeneralSkeleton height={height} />}
      
      {/* Shimmer effect */}
      {animate && <SkeletonShimmer />}
    </SkeletonContainer>
  );
};

export default ChartSkeleton; 