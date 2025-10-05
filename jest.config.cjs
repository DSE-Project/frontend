module.exports = {
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/jest.setup.js"], // << load BEFORE tests
  setupFilesAfterEnv: ["@testing-library/jest-dom"], 
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  moduleFileExtensions: ["js", "jsx", "json", "node"],
  transformIgnorePatterns: [
    "/node_modules/(?!(@testing-library)/)",
  ],
};
