import type { Config } from 'jest'

export default async (): Promise<Config> => ({
  verbose: true,
  preset: 'ts-jest',
  testMatch: ['**/__tests__/**/*.[jt]s?(x)'],
  transform: {
    '\\.tsx?$': 'ts-jest',
    '^.+\\.(js|jsx|ts)$': 'babel-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/__tests__/tsconfig.json',
    },
  },
})
