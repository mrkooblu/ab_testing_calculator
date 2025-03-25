import React from 'react';
import styled from 'styled-components';

const ResultsContainer = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const ResultsHeader = styled.div`
  margin-bottom: 1.5rem;
  
  h2 {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
    color: #2d3748;
  }
  
  p {
    color: #718096;
    font-size: 0.875rem;
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ResultCard = styled.div`
  background-color: #f7fafc;
  border-radius: 6px;
  padding: 1.25rem;
  border-left: 4px solid #4299e1;
  
  h3 {
    font-size: 1rem;
    color: #4a5568;
    margin-bottom: 0.5rem;
  }
  
  .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2d3748;
  }
  
  .description {
    font-size: 0.75rem;
    color: #718096;
    margin-top: 0.5rem;
  }
`;

const SEOROIResults = ({ 
  monthlySEOCost = 2500,
  averageLeadValue = 200,
  conversionRate = 2.5,
  projectedTraffic = 5000,
  timeframe = 12
}) => {
  // Calculate ROI metrics
  const totalInvestment = monthlySEOCost * timeframe;
  const totalTraffic = projectedTraffic * timeframe;
  const totalLeads = Math.round(totalTraffic * (conversionRate / 100));
  const totalRevenue = totalLeads * averageLeadValue;
  const totalROI = ((totalRevenue - totalInvestment) / totalInvestment) * 100;
  const breakEvenMonth = Math.ceil(totalInvestment / (projectedTraffic * (conversionRate / 100) * averageLeadValue));
  
  return (
    <ResultsContainer>
      <ResultsHeader>
        <h2>SEO ROI Calculator Results</h2>
        <p>Based on a {timeframe}-month SEO campaign</p>
      </ResultsHeader>
      
      <ResultsGrid>
        <ResultCard>
          <h3>Total Investment</h3>
          <div className="value">${totalInvestment.toLocaleString()}</div>
          <div className="description">Over {timeframe} months at ${monthlySEOCost}/month</div>
        </ResultCard>
        
        <ResultCard>
          <h3>Projected Traffic</h3>
          <div className="value">{totalTraffic.toLocaleString()}</div>
          <div className="description">Estimated organic visitors</div>
        </ResultCard>
        
        <ResultCard>
          <h3>Projected Leads</h3>
          <div className="value">{totalLeads.toLocaleString()}</div>
          <div className="description">Based on {conversionRate}% conversion rate</div>
        </ResultCard>
        
        <ResultCard>
          <h3>Projected Revenue</h3>
          <div className="value">${totalRevenue.toLocaleString()}</div>
          <div className="description">Based on ${averageLeadValue} per lead</div>
        </ResultCard>
        
        <ResultCard>
          <h3>ROI</h3>
          <div className="value">{totalROI.toFixed(0)}%</div>
          <div className="description">Return on investment</div>
        </ResultCard>
        
        <ResultCard>
          <h3>Break-even Point</h3>
          <div className="value">
            {breakEvenMonth <= timeframe ? `Month ${breakEvenMonth}` : 'Beyond timeframe'}
          </div>
          <div className="description">When revenue exceeds investment</div>
        </ResultCard>
      </ResultsGrid>
    </ResultsContainer>
  );
};

export default SEOROIResults; 