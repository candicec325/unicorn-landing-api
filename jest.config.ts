import type { Config } from 'jest';

const baseConfig = {
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    moduleFileExtensions: ['js', 'ts', 'json'],
    testEnvironment: 'jsdom',
} as const satisfies Config;

export const config = {
    ...baseConfig,
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
} as const satisfies Config;
