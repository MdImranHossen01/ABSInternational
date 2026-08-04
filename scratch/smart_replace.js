const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, '..');

// Define replacements in order of specificity (longest/most specific first)
const replacements = [
  { regex: /Climax Apparels/g, replacement: 'ABS International' },
  { regex: /climax apparels/g, replacement: 'abs international' },
  { regex: /CLIMAX APPARELS/g, replacement: 'ABS INTERNATIONAL' },
  { regex: /ClimaxApparels/g, replacement: 'ABSInternational' },
  { regex: /climaxApparels/g, replacement: 'absInternational' },
  { regex: /climax-apparels/g, replacement: 'abs-international' },
  { regex: /climaxapparels/g, replacement: 'absinternational' },
  { regex: /Climaxapparels/g, replacement: 'Absinternational' },
  { regex: /Climax/g, replacement: 'ABS' },
  { regex: /climax/g, replacement: 'abs' },
  { regex: /CLIMAX/g, replacement: 'ABS' },
];

const ignoreDirs = ['node_modules', '.next', '.git', '.github', 'scratch', 'public'];
const ignoreFiles = ['package-lock.json', 'tsconfig.tsbuildinfo', 'smart_replace.js'];

let updatedFilesCount = 0;

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!ignoreDirs.includes(file)) {
        walkDir(filePath);
      }
    } else {
      if (ignoreFiles.includes(file)) continue;

      // Only process specific file extensions
      const ext = path.extname(file);
      if (['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.html'].includes(ext)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        for (const { regex, replacement } of replacements) {
          content = content.replace(regex, replacement);
        }

        if (content !== originalContent) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`Updated: ${filePath.replace(directory, '')}`);
          updatedFilesCount++;
        }
      }
    }
  }
}

console.log('Starting smart replacement...');
walkDir(directory);
console.log(`\nFinished! Successfully updated ${updatedFilesCount} files.`);
