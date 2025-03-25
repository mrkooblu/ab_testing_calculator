# A/B Testing Significance Calculator

A web application that helps you determine if your A/B test results are statistically significant by analyzing visitor and conversion data.

## Features

- Input visitor and conversion data for variants A and B
- Calculate conversion rates automatically
- Configure hypothesis type (one-sided or two-sided)
- Select confidence level (90%, 95%, or 99%)
- View detailed statistical analysis:
  - P-value
  - Statistical power
  - Relative uplift
  - Clear significance indicators

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
- Statistical calculations for A/B testing significance

## Usage

1. Enter the number of visitors and conversions for both variant A and variant B
2. Select your hypothesis type (one-sided or two-sided)
3. Choose your confidence level
4. Click "Calculate Results" to view the statistical analysis
5. Interpret the results to make data-driven decisions

## Example

- **Variant A**: 1000 visitors, 150 conversions (15% conversion rate)
- **Variant B**: 1000 visitors, 180 conversions (18% conversion rate)
- **Confidence Level**: 95%
- **Result**: Statistically significant, with 20% relative improvement

## License

This project is licensed under the MIT License - see the LICENSE file for details. 