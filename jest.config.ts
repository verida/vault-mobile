import type { Config } from 'jest'

export default async (): Promise<Config> => ({
  verbose: true,
  preset: 'react-native',
  testMatch: ['**/__tests__/**/*.[jt]s?(x)'],
  transform: {
    '\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/__tests__/tsconfig.json' }],
    '^.+\\.(js|jsx|ts)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|@react-navigation)',
  ],
  moduleNameMapper: {
    '^~/(.*)$': ['<rootDir>/src/$1'],
  },
})
