import {
  BLACK_COLOR,
  ORANGE_COLOR,
  PRIMARY_COLOR,
  SEPARATOR,
  SUCCESS_COLOR,
  WHITE_COLOR,
} from 'constants/color'

export const defaultTheme = {
  color: {
    primary: PRIMARY_COLOR,
    onPrimary: BLACK_COLOR,
    background: WHITE_COLOR,
    onBackground: BLACK_COLOR,
    surface: WHITE_COLOR,
    onSurface: BLACK_COLOR,
    onDarkBackground: WHITE_COLOR,

    error: ORANGE_COLOR,
    onError: WHITE_COLOR,
    success: SUCCESS_COLOR,
    onSuccess: WHITE_COLOR,
    overlay: 'rgba(0, 0, 0, 0.6)',
    separator: SEPARATOR,

    transparent: 'transparent',

    gray100: '#EDF0F3',
    gray200: '#DDE3E9',
    gray300: '#CED3DA',
    gray400: '#92979E',
    gray500: '#686D72',
    gray600: '#383A3C',
    gray700: '#26282A',
    gray800: '#18191A',
    gray900: '#0F1011',
  },
  spacing: {
    xs: 4,
    s: 8,
    sm: 12,
    m: 16,
    l: 24,
    xl: 36,
    xxl: 40,
    xxxl: 48,
    xxxxl: 64,
  },
  fontSize: {
    s: 12,
    m: 14,
    l: 16,
    xl: 18,
    xxl: 24,
    xxxl: 36,
  },
}
