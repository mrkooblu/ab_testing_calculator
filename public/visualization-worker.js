// Web Worker for A/B Testing Calculator visualization calculations
// This offloads CPU-intensive calculations from the main thread

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
  const { type, data } = e.data;
  
  try {
    switch (type) {
      case 'generateCurvePoints': {
        const { controlMean, controlStdDev, testMean, testStdDev, minX, maxX, stepSize } = data;
        
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
        const criticalZ = calculateCriticalZ(data.confidenceLevel, data.isTwoSided);
        const criticalX = controlMean + criticalZ * controlStdDev;
        
        self.postMessage({
          controlPoints,
          testPoints,
          maxY,
          criticalX,
          criticalZ,
          minX,
          maxX
        });
        break;
      }
      
      case 'calculateTestStrength': {
        const { pValue, alpha } = data;
        
        // Cap p-value at 0.9999 to avoid division by zero
        const safePValue = Math.min(pValue, 0.9999);
        
        // If the test is already significant, return 100%
        if (safePValue <= alpha) {
          self.postMessage({ strength: 100 });
          return;
        }
        
        // Calculate strength
        const ratio = (1 - safePValue) / (1 - alpha);
        const strength = Math.max(1, Math.min(100, 100 * ratio));
        
        self.postMessage({ strength });
        break;
      }
      
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  } catch (error) {
    self.postMessage({ error: error.message });
  }
}; 