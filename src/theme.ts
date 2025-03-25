import { DefaultTheme } from 'styled-components';

const theme: DefaultTheme = {
  colors: {
    primary: '#4361ee',
    secondary: '#3a0ca3',
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    variantA: '#4361ee',
    variantB: '#f72585',
    variantC: '#7209b7',
    variantD: '#3a0ca3',
    background: '#ffffff',
    surface: '#ffffff',
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#9e9e9e',
      hint: '#868e96'
    },
    border: '#e0e0e0',
    divider: '#eeeeee',
    tooltip: {
      background: 'rgba(33, 33, 33, 0.9)',
      text: '#ffffff',
      title: '#ffffff',
      border: 'rgba(255, 255, 255, 0.1)',
      link: '#8ecdf8'
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      xxl: '2rem',
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
    },
    lineHeight: {
      xs: 1.25,
      sm: 1.2,
      md: 1.4,
      lg: 1.6,
      xl: 2,
      normal: 1.5,
      loose: 1.8,
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