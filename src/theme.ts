import { DefaultTheme } from 'styled-components';

const theme: DefaultTheme = {
  colors: {
    primary: '#4361EE',
    secondary: '#F72585',
    success: '#00C853',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
    variantA: '#4361EE',
    variantB: '#F72585',
    variantC: '#7209B7',
    variantD: '#3A0CA3',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#BDBDBD',
      inverse: '#FFFFFF'
    },
    border: '#E0E0E0',
    divider: '#EEEEEE',
    tooltip: {
      background: 'rgba(33, 33, 33, 0.9)',
      text: '#ffffff',
      title: '#ffffff',
      border: 'rgba(255, 255, 255, 0.1)',
      link: '#8ecdf8'
    },
    focus: 'rgba(67, 97, 238, 0.6)',
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
    xxs: '360px',    // Very small mobile
    xs: '480px',     // Small mobile
    sm: '640px',     // Larger mobile
    md: '768px',     // Tablets
    lg: '1024px',    // Small laptops
    xl: '1280px',    // Standard laptops
    xxl: '1440px',   // Large screens
  },
  focus: {
    ring: '0 0 0 3px rgba(67, 97, 238, 0.6)',
    outline: '2px solid rgba(67, 97, 238, 0.8)',
    transitionProperty: 'box-shadow, border-color',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease-in-out',
  },
};

export default theme; 