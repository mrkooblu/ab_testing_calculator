import React, { useState } from 'react';
import SEOROIResults from '../components/SEOROIResults';
import SemrushROIModule from '../components/SemrushROIModule';
import styled from 'styled-components';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2.5rem;
    color: #2d3748;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.125rem;
    color: #718096;
    max-width: 700px;
    margin: 0 auto;
  }
`;

const HomePage = () => {
  const [calculationResult, setCalculationResult] = useState(null);
  
  const handleCalculate = (data) => {
    setCalculationResult(data);
    
    // Scroll to results
    setTimeout(() => {
      const resultsElement = document.getElementById('results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  return (
    <PageContainer>
      <Header>
        <h1>SEO ROI Calculator</h1>
        <p>
          Estimate the return on investment for your SEO campaigns using real data from Semrush.
          Enter your campaign details below to calculate potential traffic, leads, and revenue.
        </p>
      </Header>
      
      <SemrushROIModule onCalculate={handleCalculate} />
      
      {calculationResult && (
        <div id="results">
          <SEOROIResults
            monthlySEOCost={calculationResult.monthlySEOCost}
            averageLeadValue={calculationResult.averageLeadValue}
            conversionRate={calculationResult.conversionRate}
            projectedTraffic={calculationResult.projectedTraffic}
            timeframe={calculationResult.timeframe}
          />
        </div>
      )}
    </PageContainer>
  );
};

export default HomePage; 