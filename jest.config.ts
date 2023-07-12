import type { Config } from 'jest'

export default async (): Promise<Config> => ({
  verbose: true,
  preset: 'ts-jest',
  testMatch: ['**/__tests__/**/*.[jt]s?(x)'],
  transform: {
    '\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/__tests__/tsconfig.json' }],
    '^.+\\.(js|jsx|ts)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^features(.*)$': ['<rootDir>/src/features$1'],
    '^blockchain(.*)$': ['<rootDir>/src/blockchain$1'],
  },
})
