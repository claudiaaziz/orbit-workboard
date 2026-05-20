/** @type {import('jest').Config} */
module.exports = {
    preset: 'jest-expo',
    testMatch: ['<rootDir>/src/**/*.test.ts'],
    collectCoverageFrom: ['src/**/domain/**/*.ts'],
};
