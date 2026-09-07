#!/usr/bin/env node

/**
 * Tiyatronot E2E Test Suite Runner
 * Executes Tier 1 (Feature Coverage), Tier 2 (Boundary & Corner),
 * Tier 3 (Cross-Feature Interactions), and Tier 4 (Real-World Scenarios).
 */

import { createHarness } from './helpers/testHarness.js';
import { registerTier1Tests } from './tiers/tier1_feature_coverage.js';
import { registerTier2Tests } from './tiers/tier2_boundary_corner.js';
import { registerTier3Tests } from './tiers/tier3_cross_feature.js';
import { registerTier4Tests } from './tiers/tier4_real_world.js';

// ANSI Color Formatting
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  crimson: '\x1b[38;2;186;27;35m',
  gold: '\x1b[38;2;241;194;27m'
};

async function main() {
  console.log(`\n${colors.crimson}${colors.bold}========================================================================${colors.reset}`);
  console.log(`${colors.crimson}${colors.bold}  TIYATRO·NOT — OPAQUE-BOX E2E TEST SUITE RUNNER${colors.reset}`);
  console.log(`${colors.dim}  Methodology: Category-Partition • BVA • Pairwise • Real-World Workloads${colors.reset}`);
  console.log(`${colors.crimson}${colors.bold}========================================================================${colors.reset}\n`);

  const args = process.argv.slice(2);
  const tierFilterArg = args.find(a => a.startsWith('--tier='));
  const selectedTier = tierFilterArg ? tierFilterArg.split('=')[1] : null;

  const harness = createHarness();

  if (!selectedTier || selectedTier === '1') {
    registerTier1Tests(harness);
  }
  if (!selectedTier || selectedTier === '2') {
    registerTier2Tests(harness);
  }
  if (!selectedTier || selectedTier === '3') {
    registerTier3Tests(harness);
  }
  if (!selectedTier || selectedTier === '4') {
    registerTier4Tests(harness);
  }

  console.log(`${colors.cyan}▶ Executing test suites...${colors.reset}\n`);

  const startTime = Date.now();
  const runResult = await harness.run();
  const totalDuration = Date.now() - startTime;

  let currentTierName = '';

  for (const suite of runResult.results) {
    const isNewTier = suite.name.startsWith('Tier ');
    console.log(`\n${colors.bold}${colors.blue}● ${suite.name}${colors.reset} ${colors.dim}(${suite.durationMs}ms)${colors.reset}`);

    for (const test of suite.tests) {
      if (test.passed) {
        console.log(`  ${colors.green}✔${colors.reset} ${test.name} ${colors.dim}(${test.durationMs}ms)${colors.reset}`);
      } else {
        console.log(`  ${colors.red}✖${colors.reset} ${test.name} ${colors.dim}(${test.durationMs}ms)${colors.reset}`);
        console.log(`    ${colors.red}${test.error?.stack || test.error}${colors.reset}`);
      }
    }
  }

  // Summary Report
  console.log(`\n${colors.crimson}${colors.bold}------------------------------------------------------------------------${colors.reset}`);
  console.log(`${colors.bold}  E2E TEST EXECUTION SUMMARY${colors.reset}`);
  console.log(`${colors.crimson}${colors.bold}------------------------------------------------------------------------${colors.reset}`);
  console.log(`  Total Test Cases : ${colors.bold}${runResult.total}${colors.reset}`);
  console.log(`  Passed           : ${colors.green}${colors.bold}${runResult.passed}${colors.reset}`);
  console.log(`  Failed           : ${runResult.failed > 0 ? colors.red : colors.dim}${colors.bold}${runResult.failed}${colors.reset}`);
  console.log(`  Total Duration   : ${colors.yellow}${totalDuration}ms${colors.reset}`);
  console.log(`${colors.crimson}${colors.bold}------------------------------------------------------------------------${colors.reset}\n`);

  if (runResult.failed === 0) {
    console.log(`${colors.green}${colors.bold}🎉 ALL E2E TESTS PASSED (100% SUCCESS RATE)${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bold}❌ ${runResult.failed} TEST(S) FAILED${colors.reset}\n`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
