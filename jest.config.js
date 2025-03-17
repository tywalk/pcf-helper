module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: ['/node_modules/', '/packages/'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  }
};