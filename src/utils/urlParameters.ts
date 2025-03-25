import { ABTestFormData, VariantKey } from '../types';

/**
 * Encodes A/B test data into URL parameters
 * @param testData - A/B test data to encode
 * @returns Query string representing the test data
 */
export const encodeTestDataToURL = (testData: ABTestFormData): string => {
  // Build a simplified version of the test data for URL sharing
  // Only include active variants (with visitors)
  const { variants, settings } = testData;
  const params = new URLSearchParams();
  
  // Encode settings
  params.set('ht', settings.hypothesisType);
  params.set('cl', settings.confidenceLevel.toString());
  
  // Keep track of active variants to include in the URL
  let activeVariantCount = 0;
  
  // Encode variants (only include active ones)
  Object.entries(variants).forEach(([key, variant]) => {
    if (variant.visitors > 0) {
      const prefix = `v${activeVariantCount}`;
      params.set(`${prefix}k`, key);
      params.set(`${prefix}t`, variant.type);
      params.set(`${prefix}vis`, variant.visitors.toString());
      params.set(`${prefix}conv`, variant.conversions.toString());
      params.set(`${prefix}rate`, variant.conversionRate.toString());
      activeVariantCount++;
    }
  });
  
  // Include count of active variants
  params.set('vc', activeVariantCount.toString());
  
  return params.toString();
};

/**
 * Decodes URL parameters into A/B test data
 * @param queryString - URL query string to decode
 * @returns Decoded A/B test data or null if invalid
 */
export const decodeURLToTestData = (queryString: string): ABTestFormData | null => {
  try {
    const params = new URLSearchParams(queryString);
    
    // Create base test data structure with default values
    const testData: ABTestFormData = {
      variants: {
        variantA: { type: 'A', visitors: 0, conversions: 0, conversionRate: 0 },
        variantB: { type: 'B', visitors: 0, conversions: 0, conversionRate: 0 },
        variantC: { type: 'C', visitors: 0, conversions: 0, conversionRate: 0 },
        variantD: { type: 'D', visitors: 0, conversions: 0, conversionRate: 0 },
      },
      settings: {
        hypothesisType: 'one-sided',
        confidenceLevel: 95
      }
    };
    
    // Decode settings
    const hypothesisType = params.get('ht');
    if (hypothesisType === 'one-sided' || hypothesisType === 'two-sided') {
      testData.settings.hypothesisType = hypothesisType;
    }
    
    const confidenceLevel = params.get('cl');
    if (confidenceLevel) {
      const level = parseInt(confidenceLevel, 10);
      if (!isNaN(level) && level > 0 && level < 100) {
        testData.settings.confidenceLevel = level;
      }
    }
    
    // Decode variants
    const variantCount = parseInt(params.get('vc') || '0', 10);
    if (variantCount <= 0) {
      return null; // No valid variants in URL
    }
    
    let validVariantFound = false;
    
    for (let i = 0; i < variantCount; i++) {
      const prefix = `v${i}`;
      const key = params.get(`${prefix}k`);
      
      if (key && Object.keys(testData.variants).includes(key)) {
        const variantKey = key as VariantKey;
        const typeValue = params.get(`${prefix}t`) || '';
        const visitors = parseInt(params.get(`${prefix}vis`) || '0', 10);
        const conversions = parseInt(params.get(`${prefix}conv`) || '0', 10);
        const rate = parseFloat(params.get(`${prefix}rate`) || '0');
        
        // Only update if visitors is a positive number
        if (visitors > 0 && !isNaN(visitors)) {
          validVariantFound = true;
          // Ensure the type is a valid VariantType
          const type = (typeValue === 'A' || typeValue === 'B' || typeValue === 'C' || typeValue === 'D') 
            ? typeValue 
            : testData.variants[variantKey].type;
          
          testData.variants[variantKey] = {
            type,
            visitors,
            conversions: !isNaN(conversions) ? conversions : 0,
            conversionRate: !isNaN(rate) ? rate : 0
          };
        }
      }
    }
    
    // Ensure we have at least one valid variant
    return validVariantFound ? testData : null;
  } catch (error) {
    console.error('Error decoding URL parameters:', error);
    return null;
  }
};

/**
 * Generates a shareable URL for the current test
 * @param testData - A/B test data to share
 * @returns Complete URL for sharing
 */
export const getShareableURL = (testData: ABTestFormData): string => {
  const baseURL = window.location.origin + window.location.pathname;
  const queryString = encodeTestDataToURL(testData);
  return `${baseURL}?${queryString}`;
};

/**
 * Updates the browser's URL without reloading the page
 * @param testData - A/B test data to encode in the URL
 */
export const updateBrowserURL = (testData: ABTestFormData): void => {
  const queryString = encodeTestDataToURL(testData);
  const newURL = `${window.location.pathname}?${queryString}`;
  window.history.pushState({ path: newURL }, '', newURL);
}; 