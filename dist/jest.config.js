"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const baseConfig = {
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    moduleFileExtensions: ['js', 'ts', 'json'],
    testEnvironment: 'jsdom',
};
exports.config = {
    ...baseConfig,
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
};
//# sourceMappingURL=jest.config.js.map