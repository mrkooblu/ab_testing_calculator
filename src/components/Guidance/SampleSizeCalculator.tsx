import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Tooltip from '../common/Tooltip';

interface SampleSizeCalculatorProps {
  onClose?: () => void;
}

const CalculatorContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
`;

const CalculatorTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.extraBold};
  line-height: 1.4;
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.background};
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}30`};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.background};
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}30`};
  }
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: 100%;
  line-height: 1;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const ResultsContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ResultTitle = styled.h4`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.extraBold};
  line-height: 1.4;
`;

const ResultValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ResultExplanation = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoBanner = styled.div`
  background-color: ${({ theme }) => `${theme.colors.info}10`};
  border-left: 4px solid ${({ theme }) => theme.colors.info};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

// Sample size calculation formula
const calculateSampleSize = (
  baselineConversionRate: number,
  minimumDetectableEffect: number,
  significance: number,
  power: number
): number => {
  // Convert percentages to proportions
  const p1 = baselineConversionRate / 100;
  const p2 = p1 * (1 + minimumDetectableEffect / 100);
  
  // Get z-values for significance and power
  const alpha = 1 - significance / 100;
  const beta = 1 - power / 100;
  const z_alpha = getZScore(alpha / 2); // Two-tailed test
  const z_beta = getZScore(beta);
  
  // Calculate pooled standard error
  const p = (p1 + p2) / 2;
  const se = Math.sqrt(2 * p * (1 - p));
  
  // Calculate sample size per variant
  const effect = Math.abs(p2 - p1);
  const sampleSize = Math.pow(se * (z_alpha + z_beta) / effect, 2);
  
  // Round up to nearest integer
  return Math.ceil(sampleSize);
};

// Helper function to get Z score from probability
const getZScore = (p: number): number => {
  // Using approximation formula for standard normal CDF inverse
  let q = p - 0.5;
  if (Math.abs(q) <= 0.425) {
    const r = 0.180625 - q * q;
    return q * (((((((2.509080928730122e+00 * r + 3.430575583588128e+00) * r + 1.431167399463234e+00) * r + 2.359774930376490e-01) * r + 1.256171797144461e-02) * r + 3.097046096595139e-04) * r + 3.541961054360565e-06) / (((((((1.0 * r + 2.260528520767326e+00) * r + 2.440242251469404e+00) * r + 1.037555970026755e+00) * r + 1.828766270495581e-01) * r + 1.226756772994494e-02) * r + 3.252671081553397e-04) * r + 3.878173589080444e-06));
  } else {
    let r = (q > 0) ? 1 - p : p;
    r = Math.log(-Math.log(r));
    return (q > 0 ? 1 : -1) * (((((((7.784894002430293e-03 * r + 3.223964580411365e-01) * r + 2.400758277161838e+00) * r + 2.549732539343734e+00) * r + 4.374664141464968e+00) * r + 2.938163982698783e+00) * r + 7.609527903289166e-01) / ((((((7.784695709041462e-03 * r + 3.224671290700398e-01) * r + 2.445134137142996e+00) * r + 3.754408661907416e+00) * r + 1.386267011904135e+00) * r + 1.296068716758416e-01) * r + 3.527609920671325e-03));
  }
};

const SampleSizeCalculator: React.FC<SampleSizeCalculatorProps> = ({ onClose }) => {
  const [baselineRate, setBaselineRate] = useState(5);
  const [mde, setMde] = useState(20);
  const [significance, setSignificance] = useState(95);
  const [power, setPower] = useState(80);
  const [sampleSize, setSampleSize] = useState(0);
  const [totalSampleSize, setTotalSampleSize] = useState(0);
  const [calculated, setCalculated] = useState(false);
  
  const handleCalculate = () => {
    const calculatedSampleSize = calculateSampleSize(
      baselineRate,
      mde,
      significance,
      power
    );
    
    setSampleSize(calculatedSampleSize);
    setTotalSampleSize(calculatedSampleSize * 2); // Multiply by 2 for both variants
    setCalculated(true);
  };
  
  return (
    <CalculatorContainer>
      <CalculatorTitle>
        Sample Size Calculator
        <Tooltip
          title="Sample Size Calculator"
          content={
            <>
              <p>This calculator helps you determine how many visitors you need for each variant to detect a statistically significant difference.</p>
              <p>The calculation is based on your baseline conversion rate, the minimum difference you want to detect, and your desired level of statistical confidence.</p>
            </>
          }
        />
      </CalculatorTitle>
      
      <InfoBanner>
        Calculating the right sample size before running your test helps ensure that your test is properly powered to detect meaningful differences between variants.
      </InfoBanner>
      
      <TwoColumnGrid>
        <FormGroup>
          <Label>
            Baseline Conversion Rate (%)
            <Tooltip
              content="This is your current conversion rate (the control variant), expressed as a percentage. For example, if 5 out of 100 visitors convert, enter 5."
            />
          </Label>
          <Input
            type="number"
            min="0.1"
            max="99.9"
            step="0.1"
            value={baselineRate}
            onChange={(e) => setBaselineRate(parseFloat(e.target.value))}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>
            Minimum Detectable Effect (%)
            <Tooltip
              content="This is the smallest relative improvement you want to be able to detect. For example, if you want to detect a 20% lift in your conversion rate, enter 20."
            />
          </Label>
          <Input
            type="number"
            min="1"
            max="100"
            step="1"
            value={mde}
            onChange={(e) => setMde(parseFloat(e.target.value))}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>
            Statistical Significance (%)
            <Tooltip
              content="This is how confident you want to be that your results aren't due to random chance. Industry standard is 95%, meaning there's only a 5% chance that your results are due to random variation."
            />
          </Label>
          <Select
            value={significance}
            onChange={(e) => setSignificance(parseInt(e.target.value))}
          >
            <option value="90">90% (less strict)</option>
            <option value="95">95% (recommended)</option>
            <option value="99">99% (more strict)</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label>
            Statistical Power (%)
            <Tooltip
              content="This is the probability of detecting a true effect if one exists. Higher power means you're less likely to miss a real difference between variants. Industry standard is 80%."
            />
          </Label>
          <Select
            value={power}
            onChange={(e) => setPower(parseInt(e.target.value))}
          >
            <option value="70">70% (less power)</option>
            <option value="80">80% (recommended)</option>
            <option value="90">90% (more power)</option>
          </Select>
        </FormGroup>
      </TwoColumnGrid>
      
      <Button onClick={handleCalculate}>Calculate Sample Size</Button>
      
      {calculated && (
        <ResultsContainer>
          <ResultTitle>Recommended Sample Size</ResultTitle>
          <ResultValue>{sampleSize.toLocaleString()} visitors per variant</ResultValue>
          <ResultExplanation>
            You need a total of <strong>{totalSampleSize.toLocaleString()} visitors</strong> across both variants
            to detect a <strong>{mde}%</strong> relative improvement with <strong>{significance}%</strong> confidence
            and <strong>{power}%</strong> power.
          </ResultExplanation>
          <ResultExplanation>
            Keep in mind that this is the minimum sample size. Running your test longer can increase confidence in your results.
          </ResultExplanation>
        </ResultsContainer>
      )}
    </CalculatorContainer>
  );
};

export default SampleSizeCalculator; 