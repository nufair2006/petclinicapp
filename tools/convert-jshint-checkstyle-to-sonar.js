const fs = require('fs');
const path = require('path');
const { parseStringPromise } = require('xml2js');

(async () => {
  try {
    const inputFile = process.argv[2] || 'jshint-report.xml';
    const outputFile = process.argv[3] || 'sonar-jshint.json';

    const xmlData = fs.readFileSync(inputFile, 'utf8');
    const result = await parseStringPromise(xmlData);

    const sonarIssues = [];

    (result.checkstyle.file || []).forEach(fileObj => {
      const filePath = fileObj.$.name;
      const srcLines = fs.existsSync(filePath)
        ? fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
        : [];

      (fileObj.error || []).forEach(err => {
        const attrs = err.$;
        const line = parseInt(attrs.line, 10) || 1;

        // Clamp column
        const lineIndex = Math.max(0, line - 1);
        const maxCol = (srcLines[lineIndex] || '').length;

        let column = parseInt(attrs.column, 10) || 1;
        if (column > maxCol) column = maxCol > 0 ? maxCol : 1;

        sonarIssues.push({
          engineId: 'jshint',
          ruleId: attrs.source || 'jshint:unknown',
          ruleName: attrs.source || 'JSHint Rule',
          severity: 'MINOR',
          type: 'CODE_SMELL',
          primaryLocation: {
            message: attrs.message,
            filePath: filePath,
            textRange: {
              startLine: line,
              startColumn: column,
              endLine: line,
              endColumn: column + 1 // ✅ ensures non-zero length range
            }
          }
        });
      });
    });

    const sonarReport = { issues: sonarIssues };
    fs.writeFileSync(outputFile, JSON.stringify(sonarReport, null, 2));
    console.log(`✅ SonarQube report written to ${outputFile}`);
  } catch (err) {
    console.error('❌ Failed to convert JSHint report:', err.message);
    process.exit(1);
  }
})();
