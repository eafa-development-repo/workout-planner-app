import { Platform, TextStyle } from 'react-native';

// The app targets Android, where these resolve to Roboto and Roboto Medium.
const family: string = Platform.OS === 'android' ? 'sans-serif' : 'System';
const familyMedium: string = Platform.OS === 'android' ? 'sans-serif-medium' : 'System';

export const typography = {
  display: {
    fontFamily: familyMedium,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  title: {
    fontFamily: familyMedium,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  heading: {
    fontFamily: familyMedium,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subheading: {
    fontFamily: familyMedium,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  body: {
    fontFamily: family,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
  },
  bodySmall: {
    fontFamily: family,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  label: {
    fontFamily: familyMedium,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  caption: {
    fontFamily: family,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  numeric: {
    fontFamily: familyMedium,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  button: {
    fontFamily: familyMedium,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
