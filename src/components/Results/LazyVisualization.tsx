import React, { ReactNode, useState, useEffect } from 'react';
import styled from 'styled-components';
import useInView from '../../hooks/useInView';
import ChartSkeleton from './ChartSkeleton';

interface LazyVisualizationProps {
  height?: number;
  minHeight?: number;
  children: ReactNode;
  placeholder?: ReactNode;
  priority?: number; // Higher priority loads sooner (1-10)
  loadingDelay?: number; // Milliseconds to delay loading (for staggered effect)
}

const VisualizationContainer = styled.div<{ minHeight?: number }>`
  position: relative;
  min-height: ${({ minHeight }) => minHeight ? `${minHeight}px` : '200px'};
  width: 100%;
`;

/**
 * Component that lazy loads visualization charts only when they enter the viewport.
 * This improves mobile performance by:
 * 1. Only rendering visualizations when needed
 * 2. Progressively loading visualizations in order of priority
 * 3. Preventing layout shifts with proper placeholders
 */
const LazyVisualization: React.FC<LazyVisualizationProps> = ({
  height = 250,
  minHeight = 200,
  children,
  placeholder,
  priority = 5,
  loadingDelay = 0
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true, 
    threshold: 0.1,
    rootMargin: '100px 0px'
  });
  
  const [shouldRender, setShouldRender] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (inView) {
      // Priority-based staggered loading (higher priority = less delay)
      // The base delay is adjusted by the component's priority
      const priorityDelay = loadingDelay + (10 - Math.min(10, Math.max(1, priority))) * 50;
      
      const timer = setTimeout(() => {
        setShouldRender(true);
        
        // Add a small transition delay to prevent layout shifts
        const loadingTimer = setTimeout(() => {
          setIsLoading(false);
        }, 100);
        
        return () => clearTimeout(loadingTimer);
      }, priorityDelay);
      
      return () => clearTimeout(timer);
    }
  }, [inView, priority, loadingDelay]);
  
  // Adjust for smaller screen sizes
  const getSkeletonHeight = () => {
    if (window.innerWidth < 480) {
      return Math.min(height, 200); // Cap at 200px on small screens
    }
    return height;
  };
  
  return (
    <VisualizationContainer ref={ref} minHeight={minHeight}>
      {isLoading && (
        placeholder || <ChartSkeleton height={getSkeletonHeight()} />
      )}
      
      {shouldRender && (
        <div style={{ 
          opacity: isLoading ? 0 : 1, 
          transition: 'opacity 0.3s ease-in-out',
          width: '100%'
        }}>
          {children}
        </div>
      )}
    </VisualizationContainer>
  );
};

export default LazyVisualization; 