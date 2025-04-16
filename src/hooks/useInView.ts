import { useState, useEffect, useRef, RefObject } from 'react';

interface InViewOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Custom hook that detects when an element is visible in the viewport
 * using the Intersection Observer API
 */
function useInView<T extends HTMLElement = HTMLDivElement>(
  options: InViewOptions = {}
): {
  ref: RefObject<T>;
  inView: boolean;
  entryRef: RefObject<IntersectionObserverEntry>;
} {
  const [inView, setInView] = useState<boolean>(false);
  const ref = useRef<T>(null);
  const entryRef = useRef<IntersectionObserverEntry | null>(null);
  
  const {
    threshold = 0,
    rootMargin = '0px',
    triggerOnce = false,
  } = options;
  
  useEffect(() => {
    // Skip if SSR or no element ref
    if (typeof window === 'undefined' || !ref.current) {
      return;
    }
    
    // Store current element reference
    const currentElement = ref.current;
    
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers: just mark element as visible
      setInView(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        entryRef.current = entry;
        
        // Update state when visibility changes
        if (entry.isIntersecting !== inView) {
          setInView(entry.isIntersecting);
          
          // If element is in view and triggerOnce is true, unobserve
          if (entry.isIntersecting && triggerOnce) {
            observer.unobserve(currentElement);
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );
    
    // Start observing
    observer.observe(currentElement);
    
    // Cleanup function
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold, rootMargin, triggerOnce, inView]);
  
  return { ref, inView, entryRef };
}

export default useInView; 