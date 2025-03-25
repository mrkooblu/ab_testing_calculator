import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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
    line-height: 1.2;
    font-weight: 600;
  }

  h1 {
    font-size: 2.5rem;
    
    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  h2 {
    font-size: 2rem;
    
    @media (max-width: 768px) {
      font-size: 1.75rem;
    }
  }

  h3 {
    font-size: 1.5rem;
    
    @media (max-width: 768px) {
      font-size: 1.25rem;
    }
  }

  h4 {
    font-size: 1.25rem;
    
    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }

  h5 {
    font-size: 1.1rem;
  }

  h6 {
    font-size: 1rem;
  }

  p, ul, ol {
    margin-bottom: 1rem;
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

  /* Responsive container */
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    
    @media (max-width: 768px) {
      padding: 0 0.75rem;
    }
  }

  .section {
    padding: 3rem 0;
    
    @media (max-width: 768px) {
      padding: 2rem 0;
    }
  }

  .text-center {
    text-align: center;
  }

  /* Touch-friendly targets for mobile */
  @media (max-width: 768px) {
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