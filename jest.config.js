export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/backend/$1"
  },
  globals: {
    jest: {
      useESModules: true
    }
  },
  roots: [
    "<rootDir>/backend"
  ],
};