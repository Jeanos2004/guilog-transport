const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Remplacements ciblés
  content = content.replace(/CFIG Guinée SARLU/g, 'Cabinet Guilogtrans');
  content = content.replace(/CFIG Guinée/g, 'Cabinet Guilogtrans');
  content = content.replace(/Cabinet de Formation Informatique de Gestion/g, 'Cabinet Guilogtrans');
  content = content.replace(/CFIG/g, 'Guilogtrans');
  content = content.replace(/cfig/g, 'guilogtrans');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        walkDir(fullPath);
      }
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(path.join(process.cwd(), 'app'));
walkDir(path.join(process.cwd(), 'components'));
walkDir(path.join(process.cwd(), 'lib'));
console.log('Done.');
