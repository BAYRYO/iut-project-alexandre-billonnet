'use strict';

module.exports = {
    coverage: true,
    threshold: 85,
    reporter: ['console', 'html', 'lcov'],
    output: ['stdout', 'coverage/coverage.html', 'coverage/lcov.info'],
    verbose: false,
    globals: [
        'AggregateError', 'DOMException', 'AbortController', 'AbortSignal',
        'Event', 'EventTarget', 'TransformStream', 'TransformStreamDefaultController',
        'WritableStream', 'WritableStreamDefaultController', 'WritableStreamDefaultWriter',
        'ReadableStream', 'ReadableStreamDefaultReader', 'ReadableStreamBYOBReader',
        'ReadableStreamBYOBRequest', 'ReadableByteStreamController',
        'ReadableStreamDefaultController', 'ByteLengthQueuingStrategy',
        'CountQueuingStrategy', 'TextEncoderStream', 'TextDecoderStream',
        'CompressionStream', 'DecompressionStream', 'structuredClone',
        'atob', 'btoa', 'BroadcastChannel', 'MessageChannel', 'MessagePort',
        'Blob', 'File', 'Performance', 'PerformanceEntry', 'PerformanceMark',
        'PerformanceMeasure', 'PerformanceObserver', 'PerformanceObserverEntryList',
        'PerformanceResourceTiming', 'performance', 'fetch', 'FormData',
        'Headers', 'Request', 'Response', 'MessageEvent', 'WebSocket',
        'Iterator', 'Navigator', 'navigator', 'crypto', 'Crypto',
        'CryptoKey', 'SubtleCrypto', 'CustomEvent'
    ]
};