const theme = {
  colors: {
    primary: '#4361ee',
    secondary: '#3f37c9',
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    variantA: '#4361ee',
    variantB: '#f72585',
    variantC: '#7209b7',
    variantD: '#3a0ca3',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: {
      primary: '#212529',
      secondary: '#6c757d',
      disabled: '#adb5bd',
      hint: '#868e96'
    },
    border: '#e9ecef',
    divider: '#dee2e6',
    tooltip: {
      background: 'rgba(33, 33, 33, 0.9)',
      text: '#ffffff',
      title: '#ffffff',
      border: 'rgba(255, 255, 255, 0.1)',
      link: '#8ecdf8'
    }
  },
  breakpoints: {
    xs: '0',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      xxl: '2rem'
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700
    },
    lineHeight: {
      xs: 1.25,
      sm: 1.5,
      md: 1.6,
      lg: 1.75,
      xl: 2,
      normal: 1.5,
      loose: 1.8
    }
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)'
  },
  borderRadius: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
    circle: '50%'
  },
  transitions: {
    short: '0.15s ease-in-out',
    medium: '0.25s ease-in-out',
    long: '0.35s ease-in-out'
  }
};

export default theme; 