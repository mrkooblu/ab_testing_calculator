declare module 'jstat' {
  export const jStat: {
    beta: {
      sample: (alpha: number, beta: number) => number;
      pdf: (x: number, alpha: number, beta: number) => number;
      cdf: (x: number, alpha: number, beta: number) => number;
    };
    normal: {
      pdf: (x: number, mean: number, std: number) => number;
      cdf: (x: number, mean: number, std: number) => number;
      inv: (p: number, mean: number, std: number) => number;
    };
    studentt: {
      cdf: (x: number, dof: number) => number;
      inv: (p: number, dof: number) => number;
    };
    binomial: {
      pdf: (k: number, n: number, p: number) => number;
      cdf: (k: number, n: number, p: number) => number;
    };
  };
  export default jStat;
} 