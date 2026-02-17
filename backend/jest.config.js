module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  clearMocks: true,
  roots: ["<rootDir>/"],
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/dist/"],
};
