// Script to find all backtick positions in SORULAR cevap fields
const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');
const lines = content.split('\n');

// Find lines with backticks inside cevap template literals
let inCevap = false;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('cevap: `')) {
    inCevap = true;
    continue;
  }
  if (inCevap) {
    // Check if this line ends the template literal
    const trimmed = line.trim();
    if (trimmed.endsWith('`,') || trimmed.endsWith('`}') || (trimmed === '`,' )) {
      inCevap = false;
    }
    // Check for unescaped backticks in this line (that are not the closing one)
    const backtickPositions = [];
    for (let j = 0; j < line.length; j++) {
      if (line[j] === '`' && (j === 0 || line[j-1] !== '\\')) {
        backtickPositions.push(j);
      }
    }
    if (backtickPositions.length > 0) {
      // If this is the closing line, the last backtick is the closer
      const isClosingLine = trimmed.endsWith('`,');
      if (isClosingLine && backtickPositions.length > 1) {
        console.log(`Line ${i+1}: ${backtickPositions.length} backticks (last is closer): ${line.substring(0, 120)}`);
      } else if (!isClosingLine && backtickPositions.length > 0) {
        console.log(`Line ${i+1}: ${backtickPositions.length} unescaped backtick(s): ${line.substring(0, 120)}`);
      }
    }
  }
}
