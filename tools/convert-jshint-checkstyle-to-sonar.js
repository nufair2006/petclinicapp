// tools/convert-jshint-checkstyle-to-sonar.js
// Usage: node tools/convert-jshint-checkstyle-to-sonar.js input.xml output.json
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const inPath = process.argv[2] || 'jshint-report.xml';
const outPath = process.argv[3] || 'sonar-jshint.json';

function mapSeverity(sev) {
  if (!sev) return 'INFO';
  sev = sev.toLowerCase();
  if (sev === 'error' || sev === 'e') return 'MAJOR';
  if (sev === 'warning' || sev === 'warn' || sev === 'w') return 'MINOR';
  return 'INFO';
}

function normalizeFilePath(filePath) {
  if (!filePath) return filePath;
  try {
    // make it relative to workspace (current working dir)
    const rel = path.relative(process.cwd(), filePath);
    return rel === '' ? filePath.replace(/\\/g, '/') : rel.replace(/\\/g, '/');
  } catch (e) {
    return filePath.replace(/\\/g, '/');
  }
}

if (!fs.existsSync(inPath)) {
  console.warn(`Input file ${inPath} not found — writing empty report ${outPath}`);
  fs.writeFileSync(outPath, JSON.stringify({ issues: [] }, null, 2));
  process.exit(0);
}

const xml = fs.readFileSync(inPath, 'utf8');
xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
  if (err) {
    console.error('Failed to parse XML:', err.message);
    process.exit(2);
  }
  const issues = [];
  const checkstyle = result && result.checkstyle;
  if (!checkstyle) {
    fs.writeFileSync(outPath, JSON.stringify({ issues }, null, 2));
    console.log('No checkstyle content found — wrote empty report.');
    process.exit(0);
  }

  let files = checkstyle.file || [];
  if (!Array.isArray(files)) files = [files];

  files.forEach(fileObj => {
    const filename = (fileObj && fileObj.$ && fileObj.$.name) || fileObj.name || '';
    const filePath = normalizeFilePath(filename);

    let errors = fileObj.error || [];
    if (!Array.isArray(errors)) {
      // some files might have a single error object; ensure array
      if (errors && typeof errors === 'object') errors = [errors];
      else errors = [];
    }

    errors.forEach(err => {
      const attrs = err.$ || {};
      const line = parseInt(attrs.line, 10) || 1;
      const column = parseInt(attrs.column, 10) || 1;
      const message = attrs.message || attrs['@message'] || 'JSHint issue';
      const rule = attrs.source || attrs.source || 'jshint';
      const severity = mapSeverity(attrs.severity);

      issues.push({
        engineId: 'jshint',
        ruleId: rule,
        primaryLocation: {
          message: message,
          filePath: filePath,
          textRange: {
            startLine: line,
            startColumn: column
          }
        },
        type: 'CODE_SMELL',
        severity: severity
      });
    });
  });

  fs.writeFileSync(outPath, JSON.stringify({ issues }, null, 2), 'utf8');
  console.log(`Wrote ${issues.length} issues to ${outPath}`);
});
