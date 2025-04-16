# A/B Testing Significance Calculator

A comprehensive web application that helps you determine if your A/B test results are statistically significant by analyzing visitor and conversion data across multiple variants.

## Features

- Test up to four variants (A, B, C, D) simultaneously
- Input visitor and conversion data for each variant
- Calculate conversion rates automatically
- Configure hypothesis type (one-sided or two-sided)
- Select confidence level (90%, 95%, or 99%)
- Segmentation analysis to identify performance differences across user groups
- View detailed statistical analysis:
  - P-value
  - Statistical power
  - Relative uplift
  - Clear significance indicators
- Full keyboard navigation and accessibility support
- URL parameter sharing to save and share test results
- Multiple number input support (paste comma-separated values)
- Interactive setup wizard for first-time users
- Sample size calculator to plan your tests
- Example datasets for learning and demonstration
- Mobile-optimized interface with responsive visualizations

## Performance Optimizations

This application has been optimized for performance using several techniques:

### 1. Advanced Caching System

We've implemented a custom LRU (Least Recently Used) cache system to optimize statistical calculations:

- **Memory-Efficient**: Automatically evicts the oldest entries when the cache reaches capacity
- **Type-Safe**: Fully typed cache implementation for reliable and predictable behavior
- **Shared Cache Instances**: Dedicated caches for different types of calculations with appropriate sizes

### 2. Memoization of Expensive Calculations

Function memoization has been applied to computationally intensive operations:

- **Statistical Functions**: Calculations like normal CDF, p-values, and critical Z-values are cached
- **Curve Generation**: Visualization data points are cached to avoid redundant calculations
- **Argument-Based Caching**: Cache keys generated from function arguments for precise lookup

### 3. Visualization Optimizations

The visualization utilities have been optimized for better performance:

- **Pre-calculated Constants**: Mathematical constants calculated outside of loops
- **Cached Curve Points**: Normal distribution curves are generated once and reused
- **Lookup Tables**: Common test strength values and critical Z-values use lookup tables
- **Web Workers**: CPU-intensive calculations moved to background threads
- **Lazy Loading**: Visualizations only render when they come into view
- **Progressive Loading**: Priority-based loading to improve perceived performance
- **Mobile Optimizations**: Reduced data points and optimized SVG rendering for mobile devices

### 4. React Performance Improvements

Several React-specific optimizations have been implemented:

- **useMemo for Calculations**: Complex variant comparisons use memoization to avoid recalculation
- **State Management**: Efficient state updates to minimize unnecessary re-renders
- **Controlled Input Handling**: Optimized form inputs with debounced updates
- **Intersection Observer**: Components load only when scrolled into view
- **Staggered Rendering**: Visualizations load in sequence to prevent main thread blocking
- **Skeleton Placeholders**: Visual indicators during loading to prevent layout shifts

### 5. Mobile Enhancements

The application is fully responsive with specific mobile optimizations:

- **Optimized Touch Targets**: Larger interactive elements for better tap accuracy
- **Reduced Graph Complexity**: Fewer data points on small screens to improve performance
- **Progressive Rendering**: Components load based on importance and visibility
- **Memory Management**: Careful resource allocation for lower-end mobile devices
- **Responsive Layouts**: UI adapts seamlessly to different screen sizes

## Technologies Used

- **React**: Frontend UI library
- **TypeScript**: Type-safe JavaScript
- **Styled Components**: Component-based styling
- **Web Workers**: Background processing for CPU-intensive tasks
- **Intersection Observer**: Viewport-based loading optimization
- **Statistical Libraries**: Custom implementations of statistical algorithms

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/ab-testing-calculator.git
   cd ab-testing-calculator
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm start
   ```

4. Open your browser to `http://localhost:3000`

## Built With

- React - Frontend library
- TypeScript - Type safety
- Styled Components - Styling
- Web Workers - Background processing
- Statistical calculations for A/B testing significance

## Usage

1. Enter the number of visitors and conversions for your test variants (minimum two variants)
2. Optionally add additional variants (up to four total)
3. Select your hypothesis type (one-sided or two-sided)
4. Choose your confidence level (90%, 95%, or 99%)
5. Click "Calculate Results" to view the statistical analysis
6. Interpret the results to make data-driven decisions
7. Use the URL sharing feature to save or share your results

## Example

- **Variant A**: 1000 visitors, 150 conversions (15% conversion rate)
- **Variant B**: 1000 visitors, 180 conversions (18% conversion rate)
- **Confidence Level**: 95%
- **Result**: Statistically significant, with 20% relative improvement

## Advanced Features

### Segmentation Analysis
Analyze how different user segments respond to your variants to uncover hidden insights and opportunities.

### Multiple Variant Testing
Test up to four variants simultaneously to compare multiple approaches in a single experiment.

### Sample Size Calculator
Plan your tests properly by calculating the required sample size based on your expected effect size and desired statistical power.

### Mobile Experience
Enjoy a fully optimized mobile experience with smooth visualizations and responsive UI, making it easy to check your A/B test results on the go.

## Accessibility

This application is built with accessibility in mind, featuring:
- Proper semantic HTML structure
- ARIA attributes for screen reader support
- Keyboard navigation with logical tab order
- Focus indicators for keyboard users
- Color contrast that meets WCAG guidelines
- Responsive design for users with different viewport sizes and preferences

## License

This project is licensed under the MIT License - see the LICENSE file for details. 