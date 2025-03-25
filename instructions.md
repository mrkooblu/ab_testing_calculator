# A/B Testing Significance Calculator - Development Instructions

## Overview

This document provides instructions for creating an A/B Testing Significance Calculator web application. The calculator will help users determine if their A/B test results are statistically significant by analyzing visitor and conversion data.

## Core Functionality

The application should:
1. Allow users to input visitor and conversion data for variants A and B
2. Calculate conversion rates for both variants
3. Determine statistical significance
4. Display confidence level, p-value, and test power
5. Provide clear visualization of results

## UI Requirements

### Layout
- Clean, responsive design with a modern aesthetic
- Color-coded sections to differentiate variants (A/B)
- Clear separation between input fields and results
- Professional appearance with consistent spacing

### Header Section
- Title: "A/B Testing Significance Calculator"
- Subtitle: "Calculate statistical significance with our calculator"
- Brief explanation: "Are your results statistically significant? Find out if your test variations made a real difference."
- "Get Started" button to scroll to calculator section

## Input Section

### Required Fields
- **Variant A**:
  - Number of visitors
  - Number of conversions
  - (Auto-calculated) Conversion rate

- **Variant B**:
  - Number of visitors
  - Number of conversions
  - (Auto-calculated) Conversion rate

### Test Settings
- **Hypothesis Type** (radio buttons):
  - One-sided (default)
  - Two-sided

- **Confidence Level** (radio buttons):
  - 90%
  - 95% (default)
  - 99%

- Calculate button (prominent, uses primary color)

## Results Section

### Primary Results Display
- Clear "Significant Result!" or "Not Significant" message
- Comparative statement: "Variant B's conversion rate (X%) was Y% higher than variant A's conversion rate (Z%)"
- Confidence statement: "You can be 95% confident that variant B will perform better than variant A"

### Statistical Details
- **Power**: Display as percentage (e.g., 86.69%)
- **P-value**: Display with 4 decimal places (e.g., 0.0157)
- **Relative uplift**: Show percentage improvement

### Optional Visualization
- Simple distribution curves showing the expected distributions of variants A and B
- Highlight area of statistical significance

## Calculations

Include the following statistical calculations:

1. **Conversion Rate**: 
   - CR = (Conversions / Visitors) * 100

2. **Relative Uplift**:
   - ((CR_B - CR_A) / CR_A) * 100

3. **Standard Error**:
   - SE_A = sqrt((CR_A * (1 - CR_A)) / Visitors_A)
   - SE_B = sqrt((CR_B * (1 - CR_B)) / Visitors_B)
   - SE_diff = sqrt(SE_A² + SE_B²)

4. **Z-Score**:
   - Z = (CR_B - CR_A) / SE_diff

5. **P-value**:
   - For one-sided test: p = 1 - normCDF(Z)
   - For two-sided test: p = 2 * (1 - normCDF(abs(Z)))

6. **Statistical Power**:
   - Calculate based on sample sizes, effect size, and significance level

## Technical Requirements

### Frontend
- Responsive design (mobile and desktop compatible)
- Real-time calculation of conversion rates as users input data
- Clear validation for input fields
- Tooltips explaining statistical terms

### Backend Calculations
- Implement robust statistical functions for:
  - Standard error calculation
  - Z-score calculation
  - P-value determination
  - Power analysis

### Error Handling
- Validate user inputs (positive numbers only)
- Handle edge cases (e.g., zero visitors, identical conversion rates)
- Provide helpful error messages

## Additional Features (Optional)

- Option to add more variants (C, D, etc.)
- Pre-test sample size calculator
- Save and share results via link or export
- Toggle between percentage and decimal display

## Notes for Implementation

- Prioritize accuracy of statistical calculations
- Ensure intuitive UX for users without statistical background
- Include brief explanations of statistical terms
- Use tooltips to help users understand what the numbers mean
- Consider accessibility requirements (contrast, screen readers)

## Reference Components and Styling

When implementing this calculator, please reference the example components and styling provided in the `docs/example-code-1` and `docs/example-code-2` directories:

### Example Code 1
- Review the components in `docs/example-code-1/src/components`, particularly:
  - Form components for input handling
  - Results components for displaying statistical data
  - Layout components for page structure
- Reference the styling in `docs/example-code-1/src/styles` including:
  - Theme configuration in `theme.js`
  - Global styles in `GlobalStyles.js`

### Example Code 2
- Leverage the components in `docs/example-code-2/components`, which include:
  - Input form implementations
  - Results visualization
  - Data display patterns
- Adopt the styling approach from `docs/example-code-2/styles`:
  - Theme structure in `theme.ts`
  - Global styling in `GlobalStyle.ts`

These reference components and styles should be used as a foundation for implementing the calculator UI. Adapt and extend them to meet the specific requirements outlined in this document while maintaining a consistent design language.