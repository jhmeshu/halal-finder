#!/usr/bin/env node
/**
 * Test agent frontmatter across all agent directories (including symlinks).
 * Verifies that:
 * 1. Files have valid frontmatter (starts and ends with ---).
 * 2. 'name' and 'description' fields are present.
 * 3. 'permission' or 'tools' is a map/object (never a scalar string like `tools: Read, Write`).
 */

const fs = require('fs');
const path = require('path');

const AGENT_DIRS = [
  path.resolve(__dirname, '../.agents/agent'),
  path.resolve(__dirname, '../.claude/agents'),
  path.resolve(__dirname, '../.opencode/agents'),
  path.resolve(__dirname, '../.kilo/agent')
];

let totalChecked = 0;
let failures = 0;

for (const dir of AGENT_DIRS) {
  if (!fs.existsSync(dir)) {
    console.error(`Error: Directory ${dir} not found.`);
    failures++;
    continue;
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  console.log(`Checking ${files.length} agent files in ${dir}...`);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    totalChecked++;

    if (lines[0]?.trim() !== '---') {
      console.error(`FAIL: ${dir}/${file} does not start with '---'`);
      failures++;
      continue;
    }

    const endIndex = lines.findIndex((l, idx) => idx > 0 && l.trim() === '---');
    if (endIndex === -1) {
      console.error(`FAIL: ${dir}/${file} does not have closing '---'`);
      failures++;
      continue;
    }

    const fmLines = lines.slice(1, endIndex);
    const hasName = fmLines.some(l => /^name:\s*\S+/.test(l));
    const hasDesc = fmLines.some(l => /^description:\s*\S+/.test(l));

    if (!hasName) {
      console.error(`FAIL: ${dir}/${file} missing 'name' field`);
      failures++;
    }
    if (!hasDesc) {
      console.error(`FAIL: ${dir}/${file} missing 'description' field`);
      failures++;
    }

    const scalarTools = fmLines.find(l => /^tools:\s*[A-Za-z]/.test(l));
    if (scalarTools) {
      console.error(`FAIL: ${dir}/${file} has scalar 'tools' string: "${scalarTools}". Must be map or use 'permission:'.`);
      failures++;
    }

    if (hasName && hasDesc && !scalarTools) {
      console.log(`  PASS: ${file}`);
    }
  }
}

if (failures > 0) {
  console.error(`\nFound ${failures} frontmatter failures.`);
  process.exit(1);
} else {
  console.log(`\nAll ${totalChecked} agent frontmatter checks passed successfully across all directories!`);
}
