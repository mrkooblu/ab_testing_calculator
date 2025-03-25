import React, { useState } from 'react';
import styled from 'styled-components';

const ModuleContainer = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const ModuleHeader = styled.div`
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

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  
  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4a5568;
    margin-bottom: 0.5rem;
  }
  
  input, select {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 1rem;
    color: #2d3748;
    
    &:focus {
      outline: none;
      border-color: #4299e1;
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
    }
  }
  
  .help-text {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #718096;
  }
`;

const SubmitButton = styled.button`
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #3182ce;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }
`;

const TimeframeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  
  button {
    background-color: #edf2f7;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    color: #4a5568;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: #e2e8f0;
    }
    
    &.active {
      background-color: #4299e1;
      color: white;
      border-color: #4299e1;
    }
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
    }
  }
`;

const SemrushROIModule = ({ onCalculate }) => {
  const [formData, setFormData] = useState({
    monthlySEOCost: 2500,
    averageLeadValue: 200,
    conversionRate: 2.5,
    projectedTraffic: 5000,
    timeframe: 12
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value) || 0
    });
  };
  
  const setTimeframe = (months) => {
    setFormData({
      ...formData,
      timeframe: months
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onCalculate) {
      onCalculate(formData);
    }
  };
  
  return (
    <ModuleContainer>
      <ModuleHeader>
        <h2>Semrush SEO ROI Calculator</h2>
        <p>Estimate the potential return on investment for your SEO campaign</p>
      </ModuleHeader>
      
      <form onSubmit={handleSubmit}>
        <FormGrid>
          <FormGroup>
            <label htmlFor="monthlySEOCost">Monthly SEO Cost ($)</label>
            <input
              type="number"
              id="monthlySEOCost"
              name="monthlySEOCost"
              value={formData.monthlySEOCost}
              onChange={handleInputChange}
              min="0"
            />
            <div className="help-text">Your monthly investment in SEO services</div>
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="projectedTraffic">Monthly Projected Traffic</label>
            <input
              type="number"
              id="projectedTraffic"
              name="projectedTraffic"
              value={formData.projectedTraffic}
              onChange={handleInputChange}
              min="0"
            />
            <div className="help-text">Estimated monthly organic visitors from Semrush</div>
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="conversionRate">Conversion Rate (%)</label>
            <input
              type="number"
              id="conversionRate"
              name="conversionRate"
              value={formData.conversionRate}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.1"
            />
            <div className="help-text">Percentage of visitors who become leads</div>
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="averageLeadValue">Average Lead Value ($)</label>
            <input
              type="number"
              id="averageLeadValue"
              name="averageLeadValue"
              value={formData.averageLeadValue}
              onChange={handleInputChange}
              min="0"
            />
            <div className="help-text">Average revenue per converted lead</div>
          </FormGroup>
        </FormGrid>
        
        <FormGroup>
          <label>Timeframe</label>
          <TimeframeSelector>
            <button 
              type="button" 
              className={formData.timeframe === 3 ? 'active' : ''} 
              onClick={() => setTimeframe(3)}
            >
              3 Months
            </button>
            <button 
              type="button" 
              className={formData.timeframe === 6 ? 'active' : ''} 
              onClick={() => setTimeframe(6)}
            >
              6 Months
            </button>
            <button 
              type="button" 
              className={formData.timeframe === 12 ? 'active' : ''} 
              onClick={() => setTimeframe(12)}
            >
              12 Months
            </button>
            <button 
              type="button" 
              className={formData.timeframe === 24 ? 'active' : ''} 
              onClick={() => setTimeframe(24)}
            >
              24 Months
            </button>
          </TimeframeSelector>
        </FormGroup>
        
        <SubmitButton type="submit">Calculate ROI</SubmitButton>
      </form>
    </ModuleContainer>
  );
};

export default SemrushROIModule; 