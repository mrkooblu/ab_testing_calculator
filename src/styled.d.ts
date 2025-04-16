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
        inverse: string;
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
      focus: string;
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
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    borderRadius: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      circle: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    transitions: {
      short: string;
      medium: string;
      long: string;
    };
    breakpoints: {
      xxs: string;
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    focus: {
      ring: string;
      outline: string;
      transitionProperty: string;
      transitionDuration: string;
      transitionTimingFunction: string;
    };
  }
} 