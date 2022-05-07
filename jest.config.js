module.exports = {
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['**/?(*.)+(spec|test).+(ts|js)'],
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
