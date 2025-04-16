import React, { ReactNode, useState, useEffect, useRef } from 'react';
import styled, { css, keyframes } from 'styled-components';
import useInView from '../../hooks/useInView';
import ChartSkeleton from './ChartSkeleton';
import { useVisualization } from '../../context/VisualizationContext';

interface LazyVisualizationProps {
  height?: number;
  minHeight?: number;
  children: ReactNode;
  placeholder?: ReactNode;
  priority?: number; // Higher priority loads sooner (1-10)
  loadingDelay?: number; // Milliseconds to delay loading (for staggered effect)
  forceLoading?: boolean; // External control to force loading state (for tab switches)
  isCached?: boolean; // Whether this visualization has been loaded before
  prevTabName?: string | null; // Name of previous tab for transition effects
  currentTabName?: string; // Name of current tab for transition effects
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const VisualizationContainer = styled.div<{ minHeight?: number }>`
  position: relative;
  min-height: ${({ minHeight }) => minHeight ? `${minHeight}px` : '200px'};
  width: 100%;
`;

const FadeContainer = styled.div<{ 
  visible: boolean; 
  isCached?: boolean;
  isTransitioning?: boolean;
}>`
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: ${({ isCached }) => isCached 
    ? 'opacity 0.5s ease-in-out' 
    : 'opacity 0.7s ease-in-out'};
  width: 100%;
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  display: ${({ visible }) => (visible ? 'block' : 'none')};
  
  ${({ isTransitioning }) => isTransitioning && css`
    animation: ${fadeIn} 0.7s ease-in-out;
  `}
`;

const SkeletonContainer = styled.div<{ isExiting?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  opacity: 1;
  z-index: 1;
  transition: opacity 0.4s ease-out;
  
  ${({ isExiting }) => isExiting && css`
    opacity: 0;
    animation: ${fadeOut} 0.4s ease-out;
  `}
`;

/**
 * Component that lazy loads visualization charts only when they enter the viewport.
 * This improves mobile performance by:
 * 1. Only rendering visualizations when needed
 * 2. Progressively loading visualizations in order of priority
 * 3. Preventing layout shifts with proper placeholders
 * 4. Caching visualizations to prevent recalculations
 * 5. Smooth transitions between visualizations
 */
const LazyVisualization: React.FC<LazyVisualizationProps> = ({
  height = 250,
  minHeight = 200,
  children,
  placeholder,
  priority = 5,
  loadingDelay = 0,
  forceLoading = false,
  isCached = false,
  prevTabName = null,
  currentTabName = ''
}) => {
  const { isTabSwitching } = useVisualization();
  const { ref, inView } = useInView({
    triggerOnce: true, 
    threshold: 0.1,
    rootMargin: '100px 0px'
  });
  
  const [shouldRender, setShouldRender] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSkeletonExiting, setIsSkeletonExiting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const loadTimerRef = useRef<number | null>(null);
  const renderTimerRef = useRef<number | null>(null);
  const prevTabRef = useRef<string | null>(null);
  
  // Track tab changes to handle transitions
  useEffect(() => {
    if (prevTabName !== prevTabRef.current) {
      prevTabRef.current = prevTabName as string;
      if (prevTabName && currentTabName) {
        setIsTransitioning(true);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 500);
      }
    }
  }, [prevTabName, currentTabName]);
  
  // Reset the loading state when forceLoading changes
  useEffect(() => {
    if (forceLoading) {
      setIsLoading(true);
      // Keep the content if cached
      if (!isCached) {
        setShouldRender(false);
      }
    }
  }, [forceLoading, isCached]);
  
  // Effect for handling tab changes
  useEffect(() => {
    // If this is a tab switch and the component is cached, immediately show it
    if (isTabSwitching && isCached) {
      if (loadTimerRef.current) {
        clearTimeout(loadTimerRef.current);
      }
      
      if (renderTimerRef.current) {
        clearTimeout(renderTimerRef.current);
      }
      
      // Skip all transitions and delays for tab switches
      setShouldRender(true);
      setIsLoading(false);
      setIsSkeletonExiting(true);
    }
  }, [isTabSwitching, isCached]);
  
  // Effect for normal visibility handling
  useEffect(() => {
    if (inView && !forceLoading) {
      // Skip loading delays for tab switching
      if (isTabSwitching) {
        setShouldRender(true);
        setIsLoading(false);
        return;
      }
      
      // Rest of existing code for normal lazy loading
      if (isCached) {
        setShouldRender(true);
        // Short delay for skeleton transition
        setIsSkeletonExiting(true);
        
        if (loadTimerRef.current) {
          clearTimeout(loadTimerRef.current);
        }
        
        loadTimerRef.current = window.setTimeout(() => {
          setIsLoading(false);
        }, isTabSwitching ? 0 : 250); // No delay for tab switches
        
        return;
      }
      
      // Priority-based staggered loading (higher priority = less delay)
      // Skip delays entirely for tab switches
      const priorityDelay = isTabSwitching ? 0 : loadingDelay + (10 - Math.min(10, Math.max(1, priority))) * 50;
      
      // Clear any existing timers
      if (renderTimerRef.current) {
        clearTimeout(renderTimerRef.current);
      }
      
      renderTimerRef.current = window.setTimeout(() => {
        setShouldRender(true);
        
        // Start skeleton exit animation after a longer delay
        setTimeout(() => {
          setIsSkeletonExiting(true);
        }, isTabSwitching ? 0 : 350); // No delay for tab switches
        
        // Add a small transition delay to prevent layout shifts
        if (loadTimerRef.current) {
          clearTimeout(loadTimerRef.current);
        }
        
        loadTimerRef.current = window.setTimeout(() => {
          setIsLoading(false);
        }, isTabSwitching ? 0 : 650); // No delay for tab switches
      }, priorityDelay);
      
      return () => {
        if (renderTimerRef.current) {
          clearTimeout(renderTimerRef.current);
        }
        if (loadTimerRef.current) {
          clearTimeout(loadTimerRef.current);
        }
      };
    }
  }, [inView, priority, loadingDelay, forceLoading, isCached, isTabSwitching]);
  
  // Helper to determine which skeleton variant to use based on children
  const getSkeletonVariant = (): 'distribution' | 'strength' | 'general' => {
    // For frequentist tab, avoid showing the distribution skeleton that causes the glitch
    if (currentTabName && currentTabName.toLowerCase().includes('frequentist')) {
      return 'general'; // Use general skeleton instead of distribution skeleton
    }
    if (currentTabName && currentTabName.toLowerCase().includes('bayesian')) {
      return 'general'; // Use general skeleton instead of distribution skeleton
    }
    
    // Default to general for higher charts, strength for lower ones
    return height > 150 ? 'general' : 'strength';
  };
  
  // Adjust for smaller screen sizes
  const getSkeletonHeight = () => {
    if (window.innerWidth < 480) {
      return Math.min(height, 200); // Cap at 200px on small screens
    }
    return height;
  };
  
  return (
    <VisualizationContainer ref={ref} minHeight={minHeight}>
      {(isLoading || forceLoading) && (
        <SkeletonContainer 
          isExiting={isSkeletonExiting}
          style={{ opacity: currentTabName.toLowerCase().includes('frequentist') ? 0.4 : 1 }}
        >
          {placeholder || (
            <ChartSkeleton 
              height={getSkeletonHeight()} 
              variant={getSkeletonVariant()}
              animate={!isSkeletonExiting && !isCached}
            />
          )}
        </SkeletonContainer>
      )}
      
      {(shouldRender || (isCached && forceLoading)) && (
        <FadeContainer 
          visible={!isLoading} 
          isCached={isCached}
          isTransitioning={isTransitioning}
        >
          {children}
        </FadeContainer>
      )}
    </VisualizationContainer>
  );
};

export default LazyVisualization; 