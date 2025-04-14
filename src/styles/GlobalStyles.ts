import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    overflow-x: hidden;
    position: relative;
    width: 100%;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily};
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 16px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Typography scale for better visual hierarchy */
  h1, h2, h3, h4, h5, h6 {
    margin-bottom: 0.5em;
    font-weight: ${({ theme }) => theme.typography.fontWeight.extraBold};
  }

  h1 {
    font-size: ${({ theme }) => theme.typography.heading.h1};
    line-height: ${({ theme }) => theme.typography.lineHeight.heading};
    
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
      font-size: 2rem; /* 32px */
    }
  }

  h2 {
    font-size: ${({ theme }) => theme.typography.heading.h2};
    line-height: 1.4;
    
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
      font-size: 1.625rem; /* 26px */
    }
  }

  h3 {
    font-size: ${({ theme }) => theme.typography.heading.h3};
    line-height: 1.4;
    
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
      font-size: 1.375rem; /* 22px */
    }
  }

  h4 {
    font-size: ${({ theme }) => theme.typography.heading.h4};
    line-height: 1.4;
    
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
      font-size: 1.125rem; /* 18px */
    }
  }

  h5 {
    font-size: ${({ theme }) => theme.typography.heading.h5};
    line-height: 1.4;
    
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
      font-size: 1rem; /* 16px */
    }
  }

  h6 {
    font-size: ${({ theme }) => theme.typography.heading.h6};
    line-height: 1.6;
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
      font-size: 0.9375rem; /* 15px */
    }
  }

  p {
    margin-bottom: 1rem;
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    line-height: ${({ theme }) => theme.typography.lineHeight.lg};
  }

  .text-large {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    line-height: ${({ theme }) => theme.typography.lineHeight.xl};
    
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
      font-size: ${({ theme }) => theme.typography.fontSize.md};
    }
  }

  .text-small {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    line-height: ${({ theme }) => theme.typography.lineHeight.md};
  }

  .text-xs {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    line-height: ${({ theme }) => theme.typography.lineHeight.lg};
  }

  .intro-text {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    line-height: ${({ theme }) => theme.typography.lineHeight.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
      font-size: ${({ theme }) => theme.typography.fontSize.lg};
    }
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }

  button, input, select, textarea {
    font-family: inherit;
    font-size: inherit;
  }

  /* Button text styling */
  button, .button {
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    font-size: 0.8125rem; /* 13px */
    line-height: 1;
  }

  /* Responsive container */
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
      padding: 0 0.75rem;
    }
  }

  .section {
    padding: 3rem 0;
    
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
      padding: 2rem 0;
    }
  }

  .text-center {
    text-align: center;
  }

  /* Text color variations */
  .text-secondary {
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  .text-accent {
    color: ${({ theme }) => theme.colors.primary};
  }

  .text-light {
    color: ${({ theme }) => theme.colors.text.disabled};
  }

  .text-white {
    color: ${({ theme }) => theme.colors.background};
  }

  /* Touch-friendly targets for mobile */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    button, 
    .button,
    input[type="radio"] + label,
    input[type="checkbox"] + label {
      min-height: 44px;
      min-width: 44px;
    }

    input[type="text"],
    input[type="number"],
    input[type="email"],
    select {
      height: 44px;
      font-size: 16px; /* Prevents iOS zoom on focus */
    }
  }
  
  /* Disable pull-to-refresh on mobile */
  html, body {
    overscroll-behavior-y: contain;
  }
  
  /* Improved focus styles for accessibility */
  :focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
  
  /* Focus-visible polyfill for keyboard-only focus styles */
  :focus:not(:focus-visible) {
    outline: none;
  }
  
  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export default GlobalStyles; 