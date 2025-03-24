module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'ts', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.test.(js|ts)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  }
};