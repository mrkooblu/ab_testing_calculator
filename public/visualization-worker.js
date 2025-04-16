// Web Worker for A/B Testing Calculator visualization calculations
// This offloads CPU-intensive calculations from the main thread

// Track ongoing calculations to allow cancellation
const pendingCalculations = new Map();

// Track cached results
const resultCache = new Map();
const MAX_CACHE_SIZE = 50;

// Cache management utilities
const cacheResult = (cacheKey, result) => {
  if (!cacheKey) return;
  
  // Add to cache with timestamp
  resultCache.set(cacheKey, {
    result,
    timestamp: Date.now()
  });
  
  // Prune cache if too large
  if (resultCache.size > MAX_CACHE_SIZE) {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    resultCache.forEach((value, key) => {
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp;
        oldestKey = key;
      }
    });
    
    if (oldestKey) {
      resultCache.delete(oldestKey);
    }
  }
};

// Check if a result is cached
const getFromCache = (cacheKey) => {
  if (!cacheKey) return null;
  
  const cached = resultCache.get(cacheKey);
  if (cached) {
    // Update access timestamp
    cached.timestamp = Date.now();
    return cached.result;
  }
  
  return null;
};

// Normal distribution PDF calculation
function normalPDF(x, mean, stdDev) {
  const variance = stdDev * stdDev;
  const exponent = -Math.pow(x - mean, 2) / (2 * variance);
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
}

// Generate normal curve points
function generateNormalCurvePoints(mean, stdDev, min, max, steps) {
  const points = [];
  const step = (max - min) / steps;
  
  // Pre-calculate constants
  const sqrtTwoPi = Math.sqrt(2 * Math.PI);
  const variance = stdDev * stdDev;
  const denominator = stdDev * sqrtTwoPi;
  
  for (let i = 0; i <= steps; i++) {
    const x = min + i * step;
    const exponent = -Math.pow(x - mean, 2) / (2 * variance);
    const y = Math.exp(exponent) / denominator;
    points.push([x, y]);
  }
  
  return points;
}

// Calculate critical Z value
function calculateCriticalZ(confidenceLevel, twoSided) {
  let alpha = 1 - (confidenceLevel / 100);
  
  if (twoSided) {
    alpha /= 2;
  }
  
  // Implementation of inverse error function
  const erfInv = (x) => {
    const a = [0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429];
    const p = 0.3275911;
    
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a[4] * t + a[3]) * t + a[2]) * t + a[1]) * t + a[0]) * t * Math.exp(-x * x));
    
    return sign * y;
  };
  
  return Math.sqrt(2) * erfInv(2 * (1 - alpha) - 1);
}

// Message handler
self.onmessage = function(e) {
  const { type, data, requestId } = e.data;
  const cacheKey = data && data.cacheKey;
  
  try {
    // Register the calculation with its request ID for possible cancellation
    pendingCalculations.set(requestId, { type, aborted: false });
    
    // Check cache first if a cache key is provided
    if (cacheKey) {
      const cachedResult = getFromCache(cacheKey);
      if (cachedResult) {
        // Add the request ID to the cached result
        self.postMessage({ 
          ...cachedResult,
          requestId,
          cacheKey,
          fromCache: true
        });
        pendingCalculations.delete(requestId);
        return;
      }
    }
    
    switch (type) {
      case 'generateCurvePoints': {
        const { controlMean, controlStdDev, testMean, testStdDev, minX, maxX, stepSize } = data;
        
        // Check if calculation was aborted before starting computation
        if (pendingCalculations.get(requestId)?.aborted) {
          pendingCalculations.delete(requestId);
          return;
        }
        
        const controlPoints = generateNormalCurvePoints(controlMean, controlStdDev, minX, maxX, stepSize);
        
        // Check if aborted after controlPoints calculation
        if (pendingCalculations.get(requestId)?.aborted) {
          pendingCalculations.delete(requestId);
          return;
        }
        
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
        const criticalZ = calculateCriticalZ(data.confidenceLevel, data.isTwoSided);
        const criticalX = controlMean + criticalZ * controlStdDev;
        
        const result = {
          controlPoints,
          testPoints,
          maxY,
          criticalX,
          criticalZ,
          minX,
          maxX,
          requestId,
          cacheKey
        };
        
        // Cache the result if a cache key was provided
        if (cacheKey) {
          cacheResult(cacheKey, result);
        }
        
        pendingCalculations.delete(requestId);
        self.postMessage(result);
        break;
      }
      
      case 'calculateTestStrength': {
        const { pValue, alpha } = data;
        
        // Cap p-value at 0.9999 to avoid division by zero
        const safePValue = Math.min(pValue, 0.9999);
        
        // If the test is already significant, return 100%
        if (safePValue <= alpha) {
          const result = { 
            strength: 100,
            requestId,
            cacheKey
          };
          
          // Cache the result if a cache key was provided
          if (cacheKey) {
            cacheResult(cacheKey, result);
          }
          
          pendingCalculations.delete(requestId);
          self.postMessage(result);
          return;
        }
        
        // Calculate strength
        const ratio = (1 - safePValue) / (1 - alpha);
        const strength = Math.max(1, Math.min(100, 100 * ratio));
        
        const result = { 
          strength,
          requestId,
          cacheKey
        };
        
        // Cache the result if a cache key was provided
        if (cacheKey) {
          cacheResult(cacheKey, result);
        }
        
        pendingCalculations.delete(requestId);
        self.postMessage(result);
        break;
      }
      
      case 'abortCalculation': {
        // Mark calculation as aborted so it can be terminated
        const targetRequestId = data.targetRequestId;
        if (targetRequestId && pendingCalculations.has(targetRequestId)) {
          pendingCalculations.get(targetRequestId).aborted = true;
        }
        break;
      }
      
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  } catch (error) {
    pendingCalculations.delete(requestId);
    self.postMessage({ 
      error: error.message,
      requestId,
      cacheKey
    });
  }
}; 