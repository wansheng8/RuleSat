#!/usr/bin/env node
const path = require('path');
const AdblockFilterAggregator = require('./index');

const args = process.argv.slice(2);
const command = args[0] || 'all';
const modeMap = {
  'fetch': 'fetch',
  'parse': 'parse',
  'process': 'process',
  'build': 'build',
  'all': 'all',
};

const mode = modeMap[command] || 'all';

const outputDir = args.includes('--output') ?
  args[args.indexOf('--output') + 1] :
  path.join(__dirname, '..', 'output');

console.log(`=== Adblock Filter Aggregator v1.0.0 ===`);
console.log(`Mode: ${mode}`);
console.log(`Output: ${outputDir}`);
console.log('');

const aggregator = new AdblockFilterAggregator({ outputDir });

aggregator.run({ mode })
  .then((result) => {
    console.log('');
    console.log('=== Summary ===');
    console.log(`Elapsed: ${result.stats.elapsed}`);
    console.log(`Sources fetched: ${result.stats.fetchedCount}`);
    console.log(`Total parsed: ${result.stats.totalParsed?.toLocaleString()}`);
    console.log(`Unique rules: ${result.stats.totalUnique?.toLocaleString()}`);
    console.log(`Duplicates removed: ${result.stats.duplicatesRemoved?.toLocaleString()}`);

    if (result.outputs.length > 0) {
      console.log('');
      console.log('Output files:');
      for (const o of result.outputs) {
        console.log(`  ${o.filename} (${(o.size / 1024 / 1024).toFixed(2)} MB)`);
      }
    }

    console.log('');
    console.log('Done.');
  })
  .catch((err) => {
    console.error('Fatal error:', err.message);
    process.exit(1);
  });
