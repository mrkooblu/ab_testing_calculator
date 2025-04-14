import { DefaultTheme } from 'styled-components';

const theme: DefaultTheme = {
  colors: {
    primary: '#2E5CE5',
    secondary: '#121737',
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    variantA: '#2E5CE5',
    variantB: '#f72585',
    variantC: '#7209b7',
    variantD: '#3a0ca3',
    background: '#ffffff',
    surface: '#ffffff',
    text: {
      primary: '#121737',
      secondary: '#595D73',
      disabled: '#A0A2AF',
      hint: '#A0A2AF'
    },
    border: '#A3B7EB',
    divider: '#EBF3FF',
    tooltip: {
      background: 'rgba(33, 33, 33, 0.9)',
      text: '#ffffff',
      title: '#ffffff',
      border: 'rgba(255, 255, 255, 0.1)',
      link: '#8ecdf8'
    },
  },
  typography: {
    fontFamily: "'Manrope', sans-serif",
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.375rem',
      xxl: '1.875rem',
    },
    heading: {
      h1: '2.5rem',
      h2: '1.875rem',
      h3: '1.5rem',
      h4: '1.25rem',
      h5: '1.125rem',
      h6: '1rem',
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
      extraBold: 800,
    },
    lineHeight: {
      xs: 1.25,
      sm: 1.4,
      md: 1.5,
      lg: 1.6,
      xl: 1.8,
      xxl: 2,
      heading: 1.3,
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    xs: '2px',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '24px',
    circle: '50%',
  },
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 8px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
    xl: '0 12px 24px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    short: '0.2s ease',
    medium: '0.3s ease',
    long: '0.5s ease',
  },
  breakpoints: {
    xs: '320px',
    sm: '576px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
};

export default theme; 