/**
 * Tiyatronot E2E Test Harness & Assertion Library
 * Provides BDD-style test definitions and comprehensive assertion matchers.
 */

class AssertionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AssertionError';
  }
}

export function createHarness() {
  const suites = [];
  let currentSuite = null;

  function describe(name, fn) {
    const suite = {
      name,
      tests: [],
      beforeEachFns: [],
      afterEachFns: []
    };
    const prevSuite = currentSuite;
    currentSuite = suite;
    suites.push(suite);
    try {
      fn();
    } finally {
      currentSuite = prevSuite;
    }
  }

  function beforeEach(fn) {
    if (currentSuite) {
      currentSuite.beforeEachFns.push(fn);
    }
  }

  function afterEach(fn) {
    if (currentSuite) {
      currentSuite.afterEachFns.push(fn);
    }
  }

  function test(name, fn) {
    if (!currentSuite) {
      throw new Error(`Test "${name}" must be within a describe() block`);
    }
    currentSuite.tests.push({ name, fn });
  }

  const it = test;

  function expect(actual) {
    const positiveMatchers = {
      toBe(expected) {
        if (actual !== expected) {
          throw new AssertionError(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
        }
      },
      toEqual(expected) {
        const actualStr = JSON.stringify(actual);
        const expectedStr = JSON.stringify(expected);
        if (actualStr !== expectedStr) {
          throw new AssertionError(`Expected deep equality:\nActual:   ${actualStr}\nExpected: ${expectedStr}`);
        }
      },
      toBeTruthy() {
        if (!actual) {
          throw new AssertionError(`Expected truthy value, got ${JSON.stringify(actual)}`);
        }
      },
      toBeFalsy() {
        if (actual) {
          throw new AssertionError(`Expected falsy value, got ${JSON.stringify(actual)}`);
        }
      },
      toBeNull() {
        if (actual !== null) {
          throw new AssertionError(`Expected null, got ${JSON.stringify(actual)}`);
        }
      },
      toBeDefined() {
        if (actual === undefined) {
          throw new AssertionError(`Expected value to be defined, got undefined`);
        }
      },
      toBeUndefined() {
        if (actual !== undefined) {
          throw new AssertionError(`Expected undefined, got ${JSON.stringify(actual)}`);
        }
      },
      toBeGreaterThan(expected) {
        if (!(actual > expected)) {
          throw new AssertionError(`Expected ${actual} > ${expected}`);
        }
      },
      toBeGreaterThanOrEqual(expected) {
        if (!(actual >= expected)) {
          throw new AssertionError(`Expected ${actual} >= ${expected}`);
        }
      },
      toBeLessThan(expected) {
        if (!(actual < expected)) {
          throw new AssertionError(`Expected ${actual} < ${expected}`);
        }
      },
      toBeLessThanOrEqual(expected) {
        if (!(actual <= expected)) {
          throw new AssertionError(`Expected ${actual} <= ${expected}`);
        }
      },
      toContain(expected) {
        if (typeof actual === 'string' || Array.isArray(actual)) {
          if (!actual.includes(expected)) {
            throw new AssertionError(`Expected collection to contain ${JSON.stringify(expected)}`);
          }
        } else {
          throw new AssertionError(`Expected string or array for toContain, got ${typeof actual}`);
        }
      },
      toMatch(pattern) {
        const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
        if (!regex.test(String(actual))) {
          throw new AssertionError(`Expected "${actual}" to match pattern ${pattern}`);
        }
      },
      toThrow(expectedErrorPattern) {
        if (typeof actual !== 'function') {
          throw new AssertionError(`Expected function for toThrow, got ${typeof actual}`);
        }
        let threw = false;
        let caughtError = null;
        try {
          actual();
        } catch (err) {
          threw = true;
          caughtError = err;
        }
        if (!threw) {
          throw new AssertionError(`Expected function to throw, but it did not`);
        }
        if (expectedErrorPattern) {
          const msg = caughtError?.message || String(caughtError);
          const regex = typeof expectedErrorPattern === 'string' ? new RegExp(expectedErrorPattern, 'i') : expectedErrorPattern;
          if (!regex.test(msg)) {
            throw new AssertionError(`Expected thrown error message "${msg}" to match ${expectedErrorPattern}`);
          }
        }
      },
      toBeCloseTo(expected, numDigits = 2) {
        const diff = Math.abs(actual - expected);
        const threshold = Math.pow(10, -numDigits) / 2;
        if (diff > threshold) {
          throw new AssertionError(`Expected ${actual} to be close to ${expected} (within ${threshold})`);
        }
      }
    };

    const negativeMatchers = {
      toBe(expected) {
        if (actual === expected) {
          throw new AssertionError(`Expected ${JSON.stringify(actual)} NOT to be ${JSON.stringify(expected)}`);
        }
      },
      toEqual(expected) {
        const actualStr = JSON.stringify(actual);
        const expectedStr = JSON.stringify(expected);
        if (actualStr === expectedStr) {
          throw new AssertionError(`Expected values NOT to be deeply equal: ${actualStr}`);
        }
      },
      toBeTruthy() {
        if (actual) {
          throw new AssertionError(`Expected falsy value, got truthy ${JSON.stringify(actual)}`);
        }
      },
      toBeFalsy() {
        if (!actual) {
          throw new AssertionError(`Expected truthy value, got falsy ${JSON.stringify(actual)}`);
        }
      },
      toBeNull() {
        if (actual === null) {
          throw new AssertionError(`Expected NOT null`);
        }
      },
      toBeDefined() {
        if (actual !== undefined) {
          throw new AssertionError(`Expected undefined, got defined`);
        }
      },
      toContain(expected) {
        if (typeof actual === 'string' || Array.isArray(actual)) {
          if (actual.includes(expected)) {
            throw new AssertionError(`Expected collection NOT to contain ${JSON.stringify(expected)}`);
          }
        } else {
          throw new AssertionError(`Expected string or array for not.toContain, got ${typeof actual}`);
        }
      },
      toMatch(pattern) {
        const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
        if (regex.test(String(actual))) {
          throw new AssertionError(`Expected "${actual}" NOT to match pattern ${pattern}`);
        }
      },
      toThrow() {
        if (typeof actual !== 'function') {
          throw new AssertionError(`Expected function for not.toThrow, got ${typeof actual}`);
        }
        try {
          actual();
        } catch (err) {
          throw new AssertionError(`Expected function NOT to throw, but it threw: ${err.message}`);
        }
      }
    };

    return {
      ...positiveMatchers,
      not: negativeMatchers
    };
  }

  async function run() {
    let total = 0;
    let passed = 0;
    let failed = 0;
    const results = [];
    const startTime = Date.now();

    for (const suite of suites) {
      const suiteResult = {
        name: suite.name,
        tests: [],
        passed: 0,
        failed: 0,
        durationMs: 0
      };
      const suiteStart = Date.now();

      for (const t of suite.tests) {
        total++;
        const testStart = Date.now();
        let err = null;

        try {
          for (const before of suite.beforeEachFns) {
            await before();
          }
          await t.fn();
          for (const after of suite.afterEachFns) {
            await after();
          }
          passed++;
          suiteResult.passed++;
        } catch (error) {
          failed++;
          suiteResult.failed++;
          err = error;
        }

        const durationMs = Date.now() - testStart;
        suiteResult.tests.push({
          name: t.name,
          passed: !err,
          error: err,
          durationMs
        });
      }

      suiteResult.durationMs = Date.now() - suiteStart;
      results.push(suiteResult);
    }

    const totalDurationMs = Date.now() - startTime;
    return {
      total,
      passed,
      failed,
      durationMs: totalDurationMs,
      results
    };
  }

  return {
    describe,
    test,
    it,
    beforeEach,
    afterEach,
    expect,
    run
  };
}
