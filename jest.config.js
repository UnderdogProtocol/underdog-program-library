/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  projects: [
    {
      displayName: "@underdog-protocol/underdog-core-sdk",
      roots: ["<rootDir>/packages/underdog-core-sdk"],
      testMatch: ["<rootDir>/packages/underdog-core-sdk/tests/**/*.test.ts"],
      globalSetup: "<rootDir>/packages/underdog-core-sdk/tests/setup.ts",
      transform: {
        "^.+\\.ts?$": ["ts-jest", { tsconfig: "<rootDir>/packages/underdog-core-sdk/tsconfig.json" }],
      },
    },
    {
      displayName: "@underdog-protocol/passport-sdk",
      roots: ["<rootDir>/packages/passport-sdk"],
      testMatch: ["<rootDir>/packages/passport-sdk/tests/**/*.test.ts"],
      globalSetup: "<rootDir>/packages/passport-sdk/tests/setup.ts",
      transform: {
        "^.+\\.ts?$": ["ts-jest", { tsconfig: "<rootDir>/packages/passport-sdk/tsconfig.json" }],
      },
    }
  ]
};