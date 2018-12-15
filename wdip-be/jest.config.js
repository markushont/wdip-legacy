module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "./src",
  collectCoverage: true,
  coverageDirectory: "../coverage",
  setupTestFrameworkScriptFile: "jest-extended"
};
