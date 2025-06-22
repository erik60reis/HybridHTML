#!/usr/bin/env node

const { compileHybridHTML } = require('../lib/index.js');
const path = require('path');

function showHelp() {
  console.log(`
Hybrid HTML Compiler

Usage:
  hybrid compile <input> <output>     Compile a hybrid HTML file
  hybrid --help                       Show this help message
  hybrid --version                    Show version

Examples:
  hybrid compile index.hybrid.html dist.html
  hybrid compile src/app.hybrid.html build/app.html

Options:
  <input>    Path to the input .hybrid.html file
  <output>   Path to the output compiled .html file
`);
}

function showVersion() {
  const packageJson = require('../package.json');
  console.log(`hybrid-html-compiler v${packageJson.version}`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }
  
  if (args.includes('--version') || args.includes('-v')) {
    showVersion();
    process.exit(0);
  }
  
  if (args[0] === 'compile') {
    const [, input, output] = args;
    
    if (!input || !output) {
      console.error('❌ Error: Both input and output files are required.');
      console.log('\nUsage: hybrid compile <input> <output>');
      console.log('Example: hybrid compile index.hybrid.html dist.html');
      process.exit(1);
    }
    
    try {
      compileHybridHTML(input, output);
    } catch (error) {
      console.error('❌ Compilation failed:', error.message);
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  } else {
    console.error(`❌ Unknown command: ${args[0]}`);
    console.log('Run "hybrid --help" for usage information.');
    process.exit(1);
  }
}

main();