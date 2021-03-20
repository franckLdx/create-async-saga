module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    './src/**/*.ts'
  ],
  coveragePathIgnorePatterns: ["index.ts"],
};