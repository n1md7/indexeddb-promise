module.exports = {
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  testMatch: ['**/?(*.)+(spec|test).+(ts|js)'],
  coveragePathIgnorePatterns: ['src/middleware'],
  testEnvironment: 'jsdom',
  coverageDirectory: './reports',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        suiteName: 'Unit tests',
        outputDirectory: '<rootDir>/reports',
        outputName: 'junit.xml',
      },
    ],
  ],
  coverageReporters: ['json', 'lcov', 'text', 'text-summary', 'clover', 'cobertura'],
  setupFiles: ['<rootDir>/tests/setup.js'],
};
