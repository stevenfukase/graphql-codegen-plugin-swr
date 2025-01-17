import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const CI = !!process.env.CI

export default () => {
  return {
    displayName: pkg.name,
    rootDir: __dirname,
    preset: 'ts-jest',
    testEnvironment: 'node',
    restoreMocks: true,
    reporters: ['default'],
    modulePathIgnorePatterns: ['dist'],
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    transform: {
      '^.+\\.tsx?$': [
        'ts-jest',
        {
          useESM: true,
          tsconfig: 'tsconfig.json'
        }
      ]
    },
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    cacheDirectory: resolve(
      __dirname,
      `${CI ? '' : 'node_modules/'}.cache/jest`
    ),
    setupFiles: [`${__dirname}/dev-test/setup.js`],
    collectCoverage: false,
  }
}
