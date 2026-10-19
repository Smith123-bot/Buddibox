/** BuddhiBox dark palette. Light mode is not implemented. */
export const colors = {
  background: '#0F1020', surface: '#191B30', surfaceRaised: '#222540',
  primary: '#A69CFF', secondary: '#43D9C3', highlight: '#FFCA70',
  text: '#F7F7FF', muted: '#B4B7D0', error: '#FF6B78', success: '#43D9A3',
  border: '#343752', buttonText: '#101226',
} as const;
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 40 } as const;
export const radius = { small: 10, medium: 16, card: 22, pill: 999 } as const;
export const typeScale = { display: 32, title: 26, heading: 21, body: 16, caption: 14, eyebrow: 12 } as const;
export const touchTarget = 48;
export const border = { width: 1, color: colors.border } as const;
export const elevation = { card: 2 } as const;
