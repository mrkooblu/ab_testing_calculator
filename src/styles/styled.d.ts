import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      success: string;
      error: string;
      warning: string;
      info: string;
      variantA: string;
      variantB: string;
      variantC: string;
      variantD: string;
      background: string;
      surface: string;
      text: {
        primary: string;
        secondary: string;
        disabled: string;
        hint: string;
      };
      border: string;
      divider: string;
      tooltip: {
        background: string;
        text: string;
        title: string;
        border: string;
        link: string;
      };
    };
    breakpoints: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    typography: {
      fontFamily: string;
      fontSize: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        xxl: string;
      };
      heading: {
        h1: string;
        h2: string;
        h3: string;
        h4: string;
        h5: string;
        h6: string;
      };
      fontWeight: {
        light: number;
        regular: number;
        medium: number;
        semiBold: number;
        bold: number;
        extraBold: number;
      };
      lineHeight: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
        heading: number;
      };
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    borderRadius: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      circle: string;
    };
    transitions: {
      short: string;
      medium: string;
      long: string;
    };
  }
} 