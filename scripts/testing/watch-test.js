#!/usr/bin/env node
/**
 * Watch mode for test files
 * 
 * This script watches for changes in test files and automatically reruns them.
 * It's useful for live development and debugging of tests.
 * 
 * Usage:
 *   node watch-test.js path/to/test.js
 */

const chokidar = require('chokidar');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Parse command line arguments
const testFile = process.argv[2] || 'output/simple-playwright-test.js';

// Ensure chokidar is installed
try {
  require.resolve('chokidar');
} catch (e) {
  console.log('Installing chokidar for file watching...');
  exec('npm install chokidar --save-dev', (error) => {
    if (error) {
      console.error('Failed to install chokidar:', error);
      process.exit(1);
    }
    console.log('Chokidar installed successfully, restarting...');
    // Restart this script
    exec(`node ${__filename} ${testFile}`, {
      stdio: 'inherit'
    });
    process.exit(0);
  });
  return;
}

// Check if file exists
if (!fs.existsSync(testFile)) {
  console.error(`Error: Test file "${testFile}" does not exist.`);
  console.log('Available test files:');
  
  // List available test files
  const outputFiles = fs.readdirSync('output').filter(file => file.endsWith('.js'));
  outputFiles.forEach(file => {
    console.log(`  - output/${file}`);
  });
  
  process.exit(1);
}

console.log(`Watching ${testFile} for changes...`);
console.log('Press Ctrl+C to stop watching.');

// Determine the type of test
const isPlaywrightTest = fs.readFileSync(testFile, 'utf8').includes('playwright');
const isMochaTest = fs.readFileSync(testFile, 'utf8').includes('mocha');

// Helper to run the test
function runTest(filePath) {
  console.log(`\n[${new Date().toLocaleTimeString()}] File ${path.basename(filePath)} changed, running test...`);
  
  let command;
  if (isMochaTest) {
    command = `npx mocha ${filePath}`;
  } else if (isPlaywrightTest) {
    command = `node ${filePath}`;
  } else {
    command = `node ${filePath}`;
  }
  
  console.log(`$ ${command}`);
  
  const child = exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }
  });
  
  // Stream output in real-time
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  
  child.on('exit', (code) => {
    if (code === 0) {
      console.log('\n✅ Test completed successfully');
    } else {
      console.log(`\n❌ Test failed with exit code ${code}`);
    }
    console.log('\nWaiting for changes...');
  });
}

// Run the test once at startup
runTest(testFile);

// Start watching for changes
const watcher = chokidar.watch(testFile, {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 100,
    pollInterval: 100
  }
});

watcher.on('change', runTest);
watcher.on('error', error => console.error(`Watcher error: ${error}`));

console.log('\nWaiting for changes...');
