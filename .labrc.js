'use strict';

module.exports = {
    coverage: true,
    threshold: 85,
    reporter: ['console', 'html', 'lcov'],
    output: ['stdout', 'coverage/coverage.html', 'coverage/lcov.info'],
    verbose: false
};