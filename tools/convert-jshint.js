// tools/convert-jshint.js
const fs = require('fs');
const path = require('path');

const inPath = process.argv[2] || 'jshint-report.json';
const outPath = process.argv[3] || 'sonar-jshint.json';

function mapSeverity(code) {
  if (!code || typeof code !== 'string') return 'INFO';
  const c = code.charAt(0);
  if (c === 'E') return 'MAJOR';
  if (c === 'W') return 'MINOR';
  return 'INFO';
}

function normalizeFilePath(filePath) {
  if (!filePath) return filePath;
  return path.relative(process.cwd(), filePath).replace(/\\/g, '/');
}

let raw;
try {
  raw = JSON.parse(fs.readFileSync(inPath, 'utf8'));
} catch (e) {
  console.error('❌ Failed to parse JSHint report:', e.message);
  process.exit(2);
}

const issues = [];

if (Array.isArray(raw)) {
  raw.forEach(fileReport => {
    const filePath = normalizeFilePath(fileReport.file);
    (fileReport.errors || []).forEach(err => {
      issues.push({
        engineId: 'jshint',
        ruleId: err.code || 'jshint:unknown',
        primaryLocation: {
          message: err.reason || 'JSHint issue',
          filePath: filePath,
          textRange: {
            startLine: err.line || 1,
            startColumn: err.character || 1
          }
        },
        type: 'CODE_SMELL',
        severity: mapSeverity(err.code || '')
      });
    });
  });
}

fs.writeFileSync(outPath, JSON.stringify({ issues }, null, 2));
console.log(`✅ Wrote ${issues.length} issues to ${outPath}`);